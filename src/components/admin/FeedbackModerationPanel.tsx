import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, AlertCircle, Check } from "lucide-react";

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

const VIEW_STORAGE_KEY = "feedback-moderation-view";

export function FeedbackModerationPanel() {
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFilter, setCurrentFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'table' | 'cards'>(() => {
    try {
      const savedView = localStorage.getItem(VIEW_STORAGE_KEY);
      return (savedView === 'table' || savedView === 'cards') ? savedView : 'table';
    } catch {
      return 'table';
    }
  });

  const handleViewChange = (view: 'table' | 'cards') => {
    setCurrentView(view);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch (error) {
      console.warn("Failed to save view preference:", error);
    }
  };

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching feedback suggestions...');
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
      }
      
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
      console.log('Updating feedback with ID:', feedbackId, 'Updates:', updates);
      
      // First, check if the current user is an admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }

      console.log('Current user:', user.id);

      // Check admin status
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin');

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        throw new Error('Failed to verify admin permissions');
      }

      if (!adminCheck) {
        console.error('User is not an admin');
        throw new Error('Insufficient permissions');
      }

      console.log('User is admin, proceeding with update...');

      // Use update without .single() to avoid the PGRST116 error
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
        console.error('No rows were updated - check permissions and feedback ID');
        throw new Error('Failed to update feedback - no rows affected');
      }

      console.log('Database update successful:', data[0]);

      // Update local state immediately
      setAllFeedback(prev => {
        const updated = prev.map(item => 
          item.id === feedbackId ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
        );
        console.log('Local state updated for feedback:', feedbackId);
        return updated;
      });

      toast.success("Feedback updated successfully");
      
      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error("Failed to update feedback: " + (error.message || 'Unknown error'));
      return false;
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: string): Promise<boolean> => {
    console.log('Handling status update for feedback:', feedbackId, 'New status:', status);
    return await updateFeedback(feedbackId, { status });
  };

  const handleUpdatePriority = async (feedbackId: string, priority: string): Promise<void> => {
    console.log('Handling priority update for feedback:', feedbackId, 'New priority:', priority);
    await updateFeedback(feedbackId, { priority });
  };

  const handleSaveNotes = async (feedbackId: string, notes: string): Promise<void> => {
    console.log('Handling notes save for feedback:', feedbackId, 'Notes length:', notes.length);
    await updateFeedback(feedbackId, { admin_notes: notes });
  };

  useEffect(() => {
    let filtered: FeedbackItem[] = [];
    
    switch (currentFilter) {
      case 'pending':
        filtered = allFeedback.filter(f => f.status === 'pending');
        break;
      case 'in_progress':
        filtered = allFeedback.filter(f => f.status === 'in_progress');
        break;
      case 'complete':
        filtered = allFeedback.filter(f => f.status === 'complete');
        break;
      case 'dismissed':
        filtered = allFeedback.filter(f => f.status === 'dismissed');
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

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (filteredFeedback.length === 0 || currentView === 'table') return;
      
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
  }, [currentIndex, filteredFeedback, currentView]);

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
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        Feedback moderation components are being restructured.
      </p>
    </div>
  );
}
