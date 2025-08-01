import { Link, Globe, Camera, Sparkles, FileText, User, UtensilsCrossed, Calendar } from "lucide-react";
import { format } from "date-fns";

interface RecipeSourceInfoProps {
  sourceUrl?: string;
  importMethod?: string;
  createdBy?: string;
  createdAt?: string;
}

export const RecipeSourceInfo = ({ sourceUrl, importMethod, createdBy, createdAt }: RecipeSourceInfoProps) => {
  // Don't render if no relevant info
  if (!sourceUrl && !importMethod && !createdAt) return null;

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

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
        {/* Left side - Creation info */}
        <div className="flex items-center gap-4">
          {createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created {format(new Date(createdAt), 'MMMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Right side - Import method and source */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {importMethod && (
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${importInfo.color}`} />
              <span>{importInfo.label}</span>
            </div>
          )}
          
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline decoration-1 underline-offset-2 flex items-center gap-1 break-all"
            >
              <span className="truncate max-w-[200px] sm:max-w-[300px]">
                {sourceUrl.replace(/^https?:\/\//, '').replace(/^www\./, '')}
              </span>
              <Link className="h-3 w-3 flex-shrink-0" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};