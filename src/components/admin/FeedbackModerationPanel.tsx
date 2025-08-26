import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, AlertCircle, Check, Trash2 } from "lucide-react";

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
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [currentFilter, setCurrentFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
      }
      
      setAllFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error("Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFeedback = async (feedbackId: string, updates: Partial<FeedbackItem>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin');

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        throw new Error('Failed to verify admin permissions');
      }

      if (!adminCheck) {
        throw new Error('Insufficient permissions');
      }

      const { data, error } = await supabase
        .from('feedback_suggestions')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', feedbackId)
        .select();

      if (error) {
        console.error('Database error updating feedback:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to update feedback - no rows affected');
      }

      setAllFeedback(prev => 
        prev.map(item => 
          item.id === feedbackId ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
        )
      );

      toast.success("Feedback updated successfully");
      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error("Failed to update feedback: " + (error.message || 'Unknown error'));
      return false;
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: string) => {
    return await updateFeedback(feedbackId, { status });
  };

  const handleUpdatePriority = async (feedbackId: string, priority: string) => {
    await updateFeedback(feedbackId, { priority });
  };

  const handleSaveNotes = async (feedbackId: string, notes: string) => {
    await updateFeedback(feedbackId, { admin_notes: notes });
  };

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const filteredFeedback = allFeedback.filter(feedback => {
    switch (currentFilter) {
      case 'pending':
        return feedback.status === 'pending';
      case 'in_progress':
        return feedback.status === 'in_progress';
      case 'complete':
        return feedback.status === 'complete';
      case 'dismissed':
        return feedback.status === 'dismissed';
      default:
        return true;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'complete':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <Trash2 className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex gap-4 items-center">
        <Select value={currentFilter} onValueChange={setCurrentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Feedback</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredFeedback.length} feedback items
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {getStatusIcon(currentFilter)}
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No {currentFilter === 'all' ? '' : currentFilter.replace('_', ' ')} feedback
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentFilter === 'pending' 
                    ? "All feedback has been reviewed!" 
                    : `No ${currentFilter.replace('_', ' ')} feedback found.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePriority={handleUpdatePriority}
              onSaveNotes={handleSaveNotes}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onUpdateStatus: (id: string, status: string) => Promise<boolean>;
  onUpdatePriority: (id: string, priority: string) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
}

function FeedbackCard({ 
  feedback, 
  onUpdateStatus, 
  onUpdatePriority, 
  onSaveNotes, 
  getStatusIcon, 
  getStatusColor 
}: FeedbackCardProps) {
  const [notes, setNotes] = useState(feedback.admin_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    await onUpdateStatus(feedback.id, newStatus);
    setIsUpdating(false);
  };

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true);
    await onUpdatePriority(feedback.id, newPriority);
    setIsUpdating(false);
  };

  const handleNotesSubmit = async () => {
    setIsUpdating(true);
    await onSaveNotes(feedback.id, notes);
    setIsUpdating(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(feedback.status)}
              {feedback.subject}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={getStatusColor(feedback.status)}>
                {feedback.status.replace('_', ' ')}
              </Badge>
              {feedback.type && (
                <Badge variant="outline">{feedback.type}</Badge>
              )}
              {feedback.priority && (
                <Badge variant="secondary">{feedback.priority}</Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(feedback.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Message:</h4>
          <p className="text-sm bg-muted/50 p-3 rounded">{feedback.message}</p>
        </div>

        {feedback.email && (
          <div>
            <h4 className="font-medium mb-1">Contact:</h4>
            <p className="text-sm text-muted-foreground">{feedback.email}</p>
          </div>
        )}

        {feedback.image_url && (
          <div>
            <h4 className="font-medium mb-2">Attached Image:</h4>
            <img 
              src={feedback.image_url} 
              alt="Feedback attachment" 
              className="max-w-md rounded border"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status:</label>
            <Select 
              value={feedback.status} 
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Priority:</label>
            <Select 
              value={feedback.priority || 'medium'} 
              onValueChange={handlePriorityChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Admin Notes:</label>
          <div className="space-y-2">
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this feedback..."
              className="min-h-20"
            />
            <Button 
              onClick={handleNotesSubmit}
              disabled={isUpdating || notes === (feedback.admin_notes || '')}
              size="sm"
            >
              {isUpdating ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}