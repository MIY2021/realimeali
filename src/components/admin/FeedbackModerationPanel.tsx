
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, AlertCircle, Check } from "lucide-react";
import { SingleFeedbackModerationView } from "./moderation/SingleFeedbackModerationView";
import { FeedbackModerationNavigation } from "./moderation/FeedbackModerationNavigation";

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
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFilter, setCurrentFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched feedback data:', data);
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
      console.log('Updating feedback:', { feedbackId, updates });
      
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', feedbackId)
        .select()
        .single();

      if (error) {
        console.error('Database error updating feedback:', error);
        throw error;
      }

      console.log('Updated feedback result:', data);

      // Update local state immediately for better UX
      setAllFeedback(prev => {
        const updated = prev.map(item => 
          item.id === feedbackId ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
        );
        console.log('Updated local state:', updated.find(item => item.id === feedbackId));
        return updated;
      });

      toast.success("Feedback updated successfully");
      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error("Failed to update feedback");
      return false;
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: string): Promise<boolean> => {
    console.log('Handling status update:', { feedbackId, status });
    const success = await updateFeedback(feedbackId, { status });
    if (success) {
      // Optionally refresh data to ensure consistency
      setTimeout(() => {
        fetchFeedback();
      }, 500);
    }
    return success;
  };

  const handleUpdatePriority = async (feedbackId: string, priority: string) => {
    console.log('Handling priority update:', { feedbackId, priority });
    await updateFeedback(feedbackId, { priority });
  };

  const handleSaveNotes = async (feedbackId: string, notes: string) => {
    console.log('Handling notes save:', { feedbackId, notes });
    await updateFeedback(feedbackId, { admin_notes: notes });
  };

  const normalizeStatus = (status: string) => {
    switch (status) {
      case 'new': return 'pending';
      case 'completed': return 'complete';
      case 'closed': return 'complete';
      default: return status;
    }
  };

  // Filter feedback based on current filter
  useEffect(() => {
    let filtered: FeedbackItem[] = [];
    
    switch (currentFilter) {
      case 'pending':
        filtered = allFeedback.filter(f => {
          const status = normalizeStatus(f.status);
          return status === 'pending';
        });
        break;
      case 'in_progress':
        filtered = allFeedback.filter(f => {
          const status = normalizeStatus(f.status);
          return status === 'in_progress';
        });
        break;
      case 'complete':
        filtered = allFeedback.filter(f => {
          const status = normalizeStatus(f.status);
          return status === 'complete';
        });
        break;
      default:
        filtered = allFeedback;
    }
    
    console.log('Filtering feedback:', { currentFilter, allCount: allFeedback.length, filteredCount: filtered.length });
    setFilteredFeedback(filtered);
    
    // Ensure currentIndex is within bounds
    if (filtered.length > 0) {
      const newIndex = Math.min(currentIndex, filtered.length - 1);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    } else {
      setCurrentIndex(0);
    }
  }, [allFeedback, currentFilter, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (filteredFeedback.length === 0) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < filteredFeedback.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, filteredFeedback]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  const currentFeedback = filteredFeedback[currentIndex];

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <FeedbackModerationNavigation
        currentIndex={currentIndex}
        totalCount={filteredFeedback.length}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onNavigate={setCurrentIndex}
        allFeedback={allFeedback}
      />

      {/* Main Content */}
      {filteredFeedback.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {currentFilter === 'pending' && <Clock className="h-12 w-12 text-amber-500" />}
                {currentFilter === 'in_progress' && <AlertCircle className="h-12 w-12 text-blue-500" />}
                {currentFilter === 'complete' && <Check className="h-12 w-12 text-green-500" />}
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No {currentFilter.replace('_', ' ')} feedback
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
      ) : currentFeedback ? (
        <SingleFeedbackModerationView
          key={`feedback-${currentFeedback.id}-${currentFeedback.status}`}
          feedback={currentFeedback}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePriority={handleUpdatePriority}
          onSaveNotes={handleSaveNotes}
        />
      ) : null}

      {/* Keyboard shortcuts info */}
      {filteredFeedback.length > 0 && (
        <div className="text-xs text-muted-foreground text-center py-2 border-t">
          <p><strong>Keyboard shortcuts:</strong> ← → Navigate between feedback items</p>
        </div>
      )}
    </div>
  );
}
