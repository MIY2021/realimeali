
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, AlertCircle, Check, X, Eye, Camera, Mail, User } from "lucide-react";

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

interface FeedbackTableRowProps {
  feedback: FeedbackItem;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onUpdateStatus: (feedbackId: string, status: string) => Promise<boolean>;
  onUpdatePriority: (feedbackId: string, priority: string) => Promise<void>;
  onSaveNotes: (feedbackId: string, notes: string) => Promise<void>;
}

export function FeedbackTableRow({
  feedback,
  isSelected,
  onSelect,
  onUpdateStatus,
  onUpdatePriority,
  onSaveNotes,
}: FeedbackTableRowProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState(feedback.admin_notes || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 text-amber-500" />;
      case 'in_progress': return <AlertCircle className="h-3 w-3 text-blue-500" />;
      case 'complete': return <Check className="h-3 w-3 text-green-500" />;
      case 'dismissed': return <X className="h-3 w-3 text-gray-500" />;
      default: return <Clock className="h-3 w-3" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(feedback.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdatingPriority(true);
    try {
      await onUpdatePriority(feedback.id, newPriority);
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleSaveNotes = async () => {
    if (adminNotes === (feedback.admin_notes || '')) return;
    
    setIsSavingNotes(true);
    try {
      await onSaveNotes(feedback.id, adminNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </TableCell>
        
        <TableCell className="max-w-xs">
          <div className="truncate font-medium">{feedback.subject}</div>
          <div className="text-xs text-muted-foreground truncate">
            {feedback.message.substring(0, 60)}...
          </div>
        </TableCell>
        
        <TableCell>
          <Badge variant="outline" className={`text-xs ${getTypeColor(feedback.type)}`}>
            {feedback.type.replace('_', ' ')}
          </Badge>
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-1">
            {getStatusIcon(feedback.status)}
            <Select
              value={feedback.status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
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
        </TableCell>
        
        <TableCell>
          <Select
            value={feedback.priority || 'medium'}
            onValueChange={handlePriorityChange}
            disabled={isUpdatingPriority}
          >
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-1 text-xs">
            {feedback.email ? <Mail className="h-3 w-3" /> : <User className="h-3 w-3" />}
            <span className="truncate max-w-32">
              {feedback.email || 'Anonymous'}
            </span>
          </div>
        </TableCell>
        
        <TableCell className="text-xs">
          {new Date(feedback.created_at).toLocaleDateString()}
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewDialogOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            {feedback.image_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImageDialogOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Camera className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon(feedback.status)}
              {feedback.subject}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getTypeColor(feedback.type)}>
                {feedback.type.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={getStatusColor(feedback.status)}>
                {feedback.status.replace('_', ' ')}
              </Badge>
              {feedback.priority && (
                <Badge variant="outline" className={getPriorityColor(feedback.priority)}>
                  {feedback.priority} priority
                </Badge>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Message</h4>
              <div className="bg-muted rounded p-3 text-sm whitespace-pre-wrap">
                {feedback.message}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Admin Notes</h4>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add admin notes..."
                className="min-h-20"
              />
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSavingNotes || adminNotes === (feedback.admin_notes || '')}
                className="mt-2"
              >
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Submitted: {new Date(feedback.created_at).toLocaleString()}
              {feedback.updated_at !== feedback.created_at && (
                <span> • Updated: {new Date(feedback.updated_at).toLocaleString()}</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Feedback Attachment</DialogTitle>
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
