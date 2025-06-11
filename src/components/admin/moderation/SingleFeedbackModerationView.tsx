
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, AlertCircle, Check, Camera, Eye, User, Mail, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { FeedbackStatusManager } from "./FeedbackStatusManager";

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

interface SingleFeedbackModerationViewProps {
  feedback: FeedbackItem;
  onUpdateStatus: (feedbackId: string, status: string) => Promise<boolean>;
  onUpdatePriority: (feedbackId: string, priority: string) => Promise<void>;
  onSaveNotes: (feedbackId: string, notes: string) => Promise<void>;
}

export function SingleFeedbackModerationView({
  feedback,
  onUpdateStatus,
  onUpdatePriority,
  onSaveNotes,
}: SingleFeedbackModerationViewProps) {
  const [adminNotes, setAdminNotes] = useState(feedback.admin_notes || '');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setAdminNotes(feedback.admin_notes || '');
  }, [feedback.admin_notes, feedback.id]);

  const getStatusIcon = (status: string) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'complete': return <Check className="h-4 w-4 text-green-500" />;
      case 'dismissed': return <Check className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const normalizeStatus = (status: string) => {
    switch (status) {
      case 'new': return 'pending';
      case 'completed': return 'complete';
      case 'closed': return 'complete';
      default: return status;
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

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdatingPriority(true);
    try {
      console.log('Changing priority from', feedback.priority, 'to', newPriority);
      await onUpdatePriority(feedback.id, newPriority);
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleSaveNotes = async () => {
    if (adminNotes === (feedback.admin_notes || '')) {
      console.log('Notes unchanged, skipping save');
      return;
    }

    setIsSavingNotes(true);
    try {
      console.log('Saving notes for feedback:', feedback.id, 'Notes:', adminNotes);
      await onSaveNotes(feedback.id, adminNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const openImageDialog = () => {
    if (feedback.image_url) {
      setImageDialogOpen(true);
    }
  };

  const currentStatus = normalizeStatus(feedback.status);

  return (
    <>
      <Card className="w-full">
        {/* Header */}
        <CardHeader className={`${isMobile ? 'px-4 py-4' : 'pb-4'}`}>
          <div className="space-y-3">
            {/* Title and Image Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(feedback.status)}
                  <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} line-clamp-2`}>
                    {feedback.subject}
                  </CardTitle>
                </div>
              </div>
              {feedback.image_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openImageDialog}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {!isMobile && "View Image"}
                </Button>
              )}
            </div>

            {/* Badges and Metadata */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`text-xs ${getTypeColor(feedback.type)}`}>
                {feedback.type.replace('_', ' ')}
              </Badge>
              {feedback.priority && (
                <Badge variant="outline" className={`text-xs ${getPriorityColor(feedback.priority)}`}>
                  {feedback.priority} priority
                </Badge>
              )}
              <Badge variant="outline" className={`text-xs ${
                currentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                currentStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                currentStatus === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                'bg-green-100 text-green-800'
              }`}>
                {currentStatus.replace('_', ' ')}
              </Badge>
            </div>

            {/* Contact and Date Info */}
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm text-muted-foreground`}>
              <div className="flex items-center gap-2">
                {feedback.email ? <Mail className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span>{feedback.email || 'Anonymous User'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className={`${isMobile ? 'px-4' : ''} space-y-6`}>
          {/* Feedback Message */}
          <div>
            <h4 className="font-medium mb-2">Feedback Message</h4>
            <div className="bg-muted rounded-lg p-4">
              <p className={`${isMobile ? 'text-sm' : ''} whitespace-pre-wrap`}>
                {feedback.message}
              </p>
            </div>
          </div>

          {/* Actions Panel */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            {/* Status and Priority Controls */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <FeedbackStatusManager
                  feedbackId={feedback.id}
                  currentStatus={feedback.status}
                  onStatusUpdate={onUpdateStatus}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select
                  value={feedback.priority || 'medium'}
                  onValueChange={handlePriorityChange}
                  disabled={isUpdatingPriority}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdatingPriority && (
                  <p className="text-xs text-muted-foreground mt-1">Updating priority...</p>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about this feedback..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className={`min-h-20 ${isMobile ? 'text-sm' : ''}`}
                />
              </div>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                className="w-full"
                disabled={isSavingNotes || adminNotes === (feedback.admin_notes || '')}
              >
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              src={feedback.image_url}
              alt="Feedback attachment"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
