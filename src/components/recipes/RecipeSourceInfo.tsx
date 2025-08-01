import { Link, Globe, Camera, Sparkles, FileText, User, UtensilsCrossed, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecipeSourceInfoProps {
  sourceUrl?: string;
  importMethod?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Profile {
  full_name?: string;
  email?: string;
}

export const RecipeSourceInfo = ({ sourceUrl, importMethod, createdBy, createdAt, updatedAt }: RecipeSourceInfoProps) => {
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      if (!createdBy) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', createdBy)
          .single();
        
        if (data) {
          setCreatorProfile(data);
        }
      } catch (error) {
        console.error('Error fetching creator profile:', error);
      }
    };

    fetchCreatorProfile();
  }, [createdBy]);

  // Don't render if no relevant info
  if (!createdAt && !importMethod && !sourceUrl) return null;

  const getImportMethodInfo = (method?: string) => {
    switch (method) {
      case 'url':
        return { icon: Globe, label: 'Imported from URL', color: 'text-blue-600' };
      case 'image':
        return { icon: Camera, label: 'Created from Image', color: 'text-purple-600' };
      case 'ai':
        return { icon: Sparkles, label: 'AI Generated', color: 'text-orange-600' };
      case 'text':
        return { icon: FileText, label: 'Imported from Text', color: 'text-green-600' };
      case 'whatcanImake':
        return { icon: UtensilsCrossed, label: 'What Can I Make', color: 'text-yellow-600' };
      case 'manual':
      default:
        return { icon: User, label: 'Manual Entry', color: 'text-gray-600' };
    }
  };

  const importInfo = getImportMethodInfo(importMethod);
  const Icon = importInfo.icon;
  const creatorName = creatorProfile?.full_name || creatorProfile?.email || 'Unknown User';

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        {/* Creation info */}
        {createdAt && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created {format(new Date(createdAt), 'MMMM d, yyyy')} by {creatorName}</span>
          </div>
        )}

        {/* Last updated info */}
        {updatedAt && updatedAt !== createdAt && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Last updated {format(new Date(updatedAt), 'MMMM d, yyyy')}</span>
          </div>
        )}

        {/* Import method and source */}
        {importMethod && (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${importInfo.color}`} />
            <span>{importInfo.label}</span>
            {sourceUrl && (
              <>
                <span>•</span>
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline decoration-1 underline-offset-2 flex items-center gap-1"
                >
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">
                    {sourceUrl.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                  </span>
                  <Link className="h-3 w-3 flex-shrink-0" />
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};