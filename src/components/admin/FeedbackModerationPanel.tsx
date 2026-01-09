import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, AlertCircle, Check, Trash2, Table2, List, ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react";
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
  const isMobile = useIsMobile();
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [currentFilter, setCurrentFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  // Default to table view on desktop, list on mobile
  const [viewMode, setViewMode] = useState<"list" | "table">(() => {
    if (typeof window === 'undefined') return 'table';
    return window.innerWidth >= 768 ? 'table' : 'list';
  });
  const [sortColumn, setSortColumn] = useState<"created_at" | "status" | "priority" | "subject">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  // Sort feedback
  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        break;
      case 'subject':
        aValue = a.subject.toLowerCase();
        bValue = b.subject.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
      <div className="flex gap-4 items-center justify-between flex-wrap">
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
        
        {/* View Toggle */}
        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8"
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8"
          >
            <Table2 className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>
      </div>

      {/* Feedback Display */}
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <div className={isMobile ? "overflow-x-auto" : "overflow-visible"}>
              <Table className="w-full">
                <colgroup>
                  <col className="w-10" />
                  <col className="w-auto" />
                  <col className="w-32" />
                  <col className="w-28" />
                  <col className="w-24" />
                  <col className="w-[160px]" />
                  <col className="w-28" />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("subject")}
                    >
                      <div className="flex items-center gap-2">
                        Subject
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("priority")}
                    >
                      <div className="flex items-center gap-2">
                        Priority
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center gap-2">
                        Created
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFeedback.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          {getStatusIcon(currentFilter)}
                          <p className="text-muted-foreground">
                            No {currentFilter === 'all' ? '' : currentFilter.replace('_', ' ')} feedback found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedFeedback.map((feedback) => (
                      <FeedbackTableRow
                        key={feedback.id}
                        feedback={feedback}
                        isExpanded={expandedRows.has(feedback.id)}
                        onToggleExpand={() => toggleRowExpansion(feedback.id)}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdatePriority={handleUpdatePriority}
                        onSaveNotes={handleSaveNotes}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedFeedback.length === 0 ? (
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
            sortedFeedback.map((feedback) => (
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
      )}
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

interface FeedbackTableRowProps {
  feedback: FeedbackItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<boolean>;
  onUpdatePriority: (id: string, priority: string) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
}

function FeedbackTableRow({
  feedback,
  isExpanded,
  onToggleExpand,
  onUpdateStatus,
  onUpdatePriority,
  onSaveNotes,
  getStatusIcon,
  getStatusColor
}: FeedbackTableRowProps) {
  const [notes, setNotes] = useState(feedback.admin_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(feedback.status);
  const [localPriority, setLocalPriority] = useState(feedback.priority || 'medium');

  const handleStatusChange = async (newStatus: string) => {
    setLocalStatus(newStatus);
    setIsUpdating(true);
    await onUpdateStatus(feedback.id, newStatus);
    setIsUpdating(false);
  };

  const handlePriorityChange = async (newPriority: string) => {
    setLocalPriority(newPriority);
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
    <>
      <TableRow className="hover:bg-muted/30">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium">
          <div className="truncate" title={feedback.subject}>
            {feedback.subject}
          </div>
        </TableCell>
        <TableCell>
          <Select 
            value={localStatus} 
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <div className="flex items-center gap-1.5">
                {getStatusIcon(localStatus)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select 
            value={localPriority} 
            onValueChange={handlePriorityChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          {feedback.type ? (
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {feedback.type}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          {feedback.email ? (
            <a 
              href={`mailto:${feedback.email}`}
              className="text-xs text-blue-600 hover:underline truncate block"
              title={feedback.email}
            >
              {feedback.email}
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(feedback.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/20">
            <div className="space-y-4 p-4">
              <div>
                <h4 className="font-medium mb-2 text-sm">Message:</h4>
                <p className="text-sm bg-background p-3 rounded border">
                  {feedback.message}
                </p>
              </div>

              {feedback.image_url && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">Attached Image:</h4>
                  <img 
                    src={feedback.image_url} 
                    alt="Feedback attachment" 
                    className="max-w-md rounded border"
                  />
                </div>
              )}

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
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
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