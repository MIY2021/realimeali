import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Save, X, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecipeNote } from "@/types";

interface RecipeNotesSectionProps {
  recipeId: string;
}

interface NoteWithProfile extends RecipeNote {
  profile?: {
    full_name: string;
    email: string;
  };
}

export const RecipeNotesSection = ({ recipeId }: RecipeNotesSectionProps) => {
  const [note, setNote] = useState<NoteWithProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();

  const fetchNote = async () => {
    if (!currentHousehold?.id) return;

    try {
      const { data, error } = await supabase
        .from('recipe_notes')
        .select(`
          *,
          profiles!recipe_notes_created_by_fkey (
            full_name,
            email
          )
        `)
        .eq('recipe_id', recipeId)
        .eq('household_id', currentHousehold.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching recipe note:', error);
        return;
      }

      if (data) {
        setNote(data as any);
        setContent(data.content);
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Error fetching recipe note:', error);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [recipeId, currentHousehold?.id]);

  const saveNote = async () => {
    if (!user || !currentHousehold?.id || !content.trim()) return;

    setIsLoading(true);
    try {
      if (note) {
        // Update existing note
        const { error } = await supabase
          .from('recipe_notes')
          .update({ content: content.trim() })
          .eq('id', note.id);

        if (error) throw error;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('recipe_notes')
          .insert({
            recipe_id: recipeId,
            household_id: currentHousehold.id,
            content: content.trim(),
            created_by: user.id
          })
          .select(`
            *,
            profiles!recipe_notes_created_by_fkey (
              full_name,
              email
            )
          `)
          .single();

        if (error) throw error;
        setNote(data as any);
      }

      setIsEditing(false);
      await fetchNote(); // Refresh to get updated data
      
      toast({
        title: "Note Saved",
        description: "Recipe note has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setIsExpanded(true);
    if (!note) {
      setContent("");
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setIsExpanded(false);
    setContent(note?.content || "");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="border-sage/20">
      <CardHeader 
        className="pb-2 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sage" />
            <span>Recipe Notes</span>
            {note && !isExpanded && (
              <Badge variant="secondary" className="text-xs">
                Has notes
              </Badge>
            )}
          </div>
          {(
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing) {
                  cancelEditing();
                } else {
                  startEditing();
                }
              }}
              className="text-sage hover:text-sage-600"
            >
              {isEditing ? <X className="h-4 w-4" /> : (note ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {(isExpanded || isEditing) && (
        <CardContent className="pt-0 px-4 pb-3">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add notes about this recipe for your household..."
                className="min-h-24 resize-none"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveNote}
                  disabled={isLoading || !content.trim()}
                  size="sm"
                  className="bg-sage hover:bg-sage-600"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : note ? (
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  By {(note as any)?.profiles?.full_name || (note as any)?.profiles?.email || 'Unknown'}
                </span>
                <span>
                  {note.updated_at !== note.created_at ? 'Updated' : 'Created'} {formatDate(note.updated_at)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No notes yet. Click the + button to add notes about this recipe for your household.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};