
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, AlertCircle, Check, Camera, Eye, User, Mail, Calendar } from "lucide-react";
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

interface SingleFeedbackModerationViewProps {
  feedback: FeedbackItem;
  onUpdateStatus: (feedbackId: string, status: string) => void;
  onUpdatePriority: (feedbackId: string, priority: string) => void;
  onSaveNotes: (feedbackId: string, notes: string) => void;
}

export function SingleFeedbackModerationView({
  feedback,
  onUpdateStatus,
  onUpdatePriority,
  onSaveNotes,
}: SingleFeedbackModerationViewProps) {
  const [adminNotes, setAdminNotes] = useState(feedback.admin_notes || '');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const getStatusIcon = (status: string) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'complete': return <Check className="h-4 w-4 text-green-500" />;
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

  const handleSaveNotes = () => {
    onSaveNotes(feedback.id, adminNotes);
  };

  const openImageDialog = () => {
    if (feedback.image_url) {
      setImageDialogOpen(true);
    }
  };

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
                <Select
                  value={normalizeStatus(feedback.status)}
                  onValueChange={(value) => onUpdateStatus(feedback.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select
                  value={feedback.priority || 'medium'}
                  onValueChange={(value) => onUpdatePriority(feedback.id, value)}
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
              >
                Save Notes
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
