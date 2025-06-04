
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackItem {
  id: string;
  user_id: string | null;
  email: string | null;
  subject: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function FeedbackModerationPanel() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: string }>({});
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const isMobile = useIsMobile();

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error("Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFeedbackStatus = async (feedbackId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('feedback_suggestions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', feedbackId);

      if (error) throw error;

      toast.success("Feedback status updated");
      await fetchFeedback();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast.error("Failed to update feedback status");
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800';
      case 'feature_request': return 'bg-blue-100 text-blue-800';
      case 'suggestion': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedFeedback = {
    new: feedback.filter(f => f.status === 'new'),
    in_progress: feedback.filter(f => f.status === 'in_progress'),
    completed: feedback.filter(f => f.status === 'completed'),
    closed: feedback.filter(f => f.status === 'closed')
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <TabsTrigger value="new" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {!isMobile && `New (${groupedFeedback.new.length})`}
          {isMobile && groupedFeedback.new.length}
        </TabsTrigger>
        <TabsTrigger value="in_progress" className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {!isMobile && `In Progress (${groupedFeedback.in_progress.length})`}
          {isMobile && groupedFeedback.in_progress.length}
        </TabsTrigger>
        {!isMobile && (
          <>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({groupedFeedback.completed.length})
            </TabsTrigger>
            <TabsTrigger value="closed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Closed ({groupedFeedback.closed.length})
            </TabsTrigger>
          </>
        )}
      </TabsList>

      {Object.entries(groupedFeedback).map(([status, items]) => (
        <TabsContent key={status} value={status} className="mt-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              {getStatusIcon(status)}
              <p className="text-muted-foreground mt-2">No {status.replace('_', ' ')} feedback</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="w-full">
                  <CardHeader className={`pb-3 ${isMobile ? 'px-3 py-3' : ''}`}>
                    <div className={`flex ${isMobile ? 'flex-col' : 'items-start justify-between'} gap-2`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(item.status)}
                          <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                            {item.subject}
                          </CardTitle>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className={`text-xs ${getTypeColor(item.type)}`}>
                            {item.type.replace('_', ' ')}
                          </Badge>
                          <span>{item.email || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'} gap-2`}>
                        <Select
                          value={selectedStatus[item.id] || item.status}
                          onValueChange={(value) => {
                            setSelectedStatus(prev => ({ ...prev, [item.id]: value }));
                            updateFeedbackStatus(item.id, value);
                          }}
                        >
                          <SelectTrigger className={`${isMobile ? 'w-full' : 'w-32'}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={`${isMobile ? 'px-3 pb-3' : ''}`}>
                    <div className="bg-muted rounded-md p-3 mb-3">
                      <p className={`text-sm ${isMobile ? 'text-xs' : ''}`}>{item.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
