import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, AlertCircle, Star, Camera, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackItem {
  id: string;
  user_id: string | null;
  email: string | null;
  subject: string;
  message: string;
  type: string;
  status: string;
  priority?: string;
  admin_notes?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export function FeedbackModerationPanel() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: string }>({});
  const [selectedPriority, setSelectedPriority] = useState<{ [key: string]: string }>({});
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
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

  const updateFeedback = async (feedbackId: string, updates: Partial<FeedbackItem>) => {
    try {
      const { error } = await supabase
        .from('feedback_suggestions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', feedbackId);

      if (error) throw error;

      toast.success("Feedback updated successfully");
      await fetchFeedback();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error("Failed to update feedback");
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, status: string) => {
    await updateFeedback(feedbackId, { status });
  };

  const updateFeedbackPriority = async (feedbackId: string, priority: string) => {
    await updateFeedback(feedbackId, { priority });
  };

  const saveAdminNotes = async (feedbackId: string, notes: string) => {
    await updateFeedback(feedbackId, { admin_notes: notes });
  };

  const openImageDialog = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageDialogOpen(true);
  };

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <Star className="h-4 w-4 text-green-500" />;
      case 'closed': return <Star className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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
    <div className="w-full">
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
                <Star className="h-4 w-4" />
                Completed ({groupedFeedback.completed.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
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
                            {item.image_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openImageDialog(item.image_url!)}
                                className="h-6 px-2"
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                {!isMobile && "View Image"}
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className={`text-xs ${getTypeColor(item.type)}`}>
                              {item.type.replace('_', ' ')}
                            </Badge>
                            {item.priority && (
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                                {item.priority} priority
                              </Badge>
                            )}
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
                          <Select
                            value={selectedPriority[item.id] || item.priority || 'medium'}
                            onValueChange={(value) => {
                              setSelectedPriority(prev => ({ ...prev, [item.id]: value }));
                              updateFeedbackPriority(item.id, value);
                            }}
                          >
                            <SelectTrigger className={`${isMobile ? 'w-full' : 'w-28'}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className={`${isMobile ? 'px-3 pb-3' : ''}`}>
                      <div className="bg-muted rounded-md p-3 mb-3">
                        <p className={`text-sm ${isMobile ? 'text-xs' : ''}`}>{item.message}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Admin Notes</label>
                          <Textarea
                            placeholder="Add notes about this feedback..."
                            value={adminNotes[item.id] || item.admin_notes || ''}
                            onChange={(e) => setAdminNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className={`min-h-16 ${isMobile ? 'text-xs' : 'text-sm'}`}
                          />
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => saveAdminNotes(item.id, adminNotes[item.id] || '')}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Image View Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Feedback Attachment
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={selectedImageUrl}
              alt="Feedback attachment"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
