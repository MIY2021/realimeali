import { Link, Globe, Camera, Sparkles, FileText, User, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipeSourceInfoProps {
  sourceUrl?: string;
  importMethod?: string;
}

export const RecipeSourceInfo = ({ sourceUrl, importMethod }: RecipeSourceInfoProps) => {
  // Don't render if no source info
  if (!sourceUrl && !importMethod) return null;

  const getImportMethodInfo = (method?: string) => {
    switch (method) {
      case 'url':
        return { icon: Globe, label: 'Imported from URL', color: 'bg-blue-100 text-blue-800' };
      case 'image':
        return { icon: Camera, label: 'Created from Image', color: 'bg-purple-100 text-purple-800' };
      case 'ai':
        return { icon: Sparkles, label: 'AI Generated', color: 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800' };
      case 'text':
        return { icon: FileText, label: 'Imported from Text', color: 'bg-green-100 text-green-800' };
      case 'whatcanImake':
        return { icon: UtensilsCrossed, label: 'What Can I Make', color: 'bg-yellow-100 text-yellow-800' };
      case 'manual':
      default:
        return { icon: User, label: 'Manual Entry', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const importInfo = getImportMethodInfo(importMethod);
  const Icon = importInfo.icon;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-sm text-foreground">Recipe Source</h3>
              {importMethod && (
                <Badge variant="secondary" className={`text-xs ${importInfo.color}`}>
                  {importInfo.label}
                </Badge>
              )}
            </div>
            
            {sourceUrl && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">From:</span>
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80 underline decoration-1 underline-offset-2 flex items-center gap-1 break-all"
                >
                  <span className="truncate max-w-[300px]">{sourceUrl}</span>
                  <Link className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            )}
            
            {!sourceUrl && importMethod && importMethod !== 'manual' && (
              <span className="text-sm text-muted-foreground">
                This recipe was {importInfo.label.toLowerCase()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};