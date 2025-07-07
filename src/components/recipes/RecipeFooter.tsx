
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, ArrowRight } from "lucide-react";
import { Recipe } from "@/types";

interface RecipeFooterProps {
  recipe: Recipe;
}

export const RecipeFooter = ({ recipe }: RecipeFooterProps) => {
  const getSourceDisplay = () => {
    if (!recipe.source_url) return null;
    
    try {
      const url = new URL(recipe.source_url);
      const domain = url.hostname.replace('www.', '');
      return { domain, url: recipe.source_url };
    } catch {
      return { domain: 'External Source', url: recipe.source_url };
    }
  };

  const getImportMethodLabel = (method?: string) => {
    switch (method) {
      case 'url': return 'Imported from web';
      case 'ai': return 'Generated with AI';
      case 'image': return 'Imported from image';
      case 'text': return 'Imported from text';
      default: return 'Created manually';
    }
  };

  const sourceInfo = getSourceDisplay();

  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <div className="flex flex-col gap-3 text-sm text-gray-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-terracotta text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>Created {new Date(recipe.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div>
            Last updated {new Date(recipe.updated_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        {/* Source Information */}
        {(sourceInfo || recipe.import_method) && (
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
            <span>{getImportMethodLabel(recipe.import_method)}</span>
            {sourceInfo && (
              <>
                <span>•</span>
                <a
                  href={sourceInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-sage transition-colors"
                >
                  <span>Source: {sourceInfo.domain}</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
