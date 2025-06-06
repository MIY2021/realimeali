
import { Badge } from "@/components/ui/badge";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { Link, Clock, Users, Globe } from "lucide-react";
import { ModerationActions } from "./ModerationActions";
import { ImageManagementPanel } from "./ImageManagementPanel";
import { ModerationRecipeEditor } from "./ModerationRecipeEditor";

interface SingleRecipeModerationViewProps {
  recipe: CommunityRecipe;
  onApprove: (recipeId: string) => void;
  onReject: (recipeId: string) => void;
  onGenerateAI: (recipe: CommunityRecipe) => void;
  onUploadFile: (recipe: CommunityRecipe, file: File) => void;
  onUpdateImageUrl: (recipe: CommunityRecipe, imageUrl: string) => void;
  onSaveFields: (recipe: CommunityRecipe, updates: Partial<CommunityRecipe>) => void;
  generatingAI: { [key: string]: boolean };
  uploadingFile: { [key: string]: boolean };
  savingFields: { [key: string]: boolean };
}

export function SingleRecipeModerationView({
  recipe,
  onApprove,
  onReject,
  onGenerateAI,
  onUploadFile,
  onUpdateImageUrl,
  onSaveFields,
  generatingAI,
  uploadingFile,
  savingFields,
}: SingleRecipeModerationViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_review": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isGeneratingAIImage = generatingAI[`${recipe.id}-image`] || false;
  const isUploadingFile = uploadingFile[recipe.id] || false;
  const isSavingFields = savingFields[recipe.id] || false;

  return (
    <div className="space-y-6">
      {/* Recipe Title and Status - At the very top */}
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-navy mb-4">{recipe.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getStatusColor(recipe.moderation_status)}>
            {recipe.moderation_status}
          </Badge>
          {recipe.category && (
            <Badge variant="secondary">{recipe.category}</Badge>
          )}
          {recipe.cuisine && (
            <Badge variant="outline">{recipe.cuisine}</Badge>
          )}
          {recipe.difficulty_level && (
            <Badge variant="outline">{recipe.difficulty_level}</Badge>
          )}
        </div>

        {/* Source URL Display - Single line for better readability */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-sm font-medium text-muted-foreground">Source:</span>
              <span className="text-sm font-mono text-foreground truncate">{recipe.source_url}</span>
              <button
                onClick={() => window.open(recipe.source_url, '_blank')}
                className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <Link className="h-3 w-3" />
                Visit
              </button>
            </div>
          </div>
        </div>

        {/* Recipe Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Prep</p>
              <p className="text-sm font-medium">{recipe.prep_time}m</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Cook</p>
              <p className="text-sm font-medium">{recipe.cook_time}m</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Servings</p>
              <p className="text-sm font-medium">{recipe.servings}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="text-sm font-medium">{formatDate(recipe.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipe Image Management */}
          <ImageManagementPanel
            recipe={recipe}
            onGenerateAI={onGenerateAI}
            onUploadFile={onUploadFile}
            onUpdateImageUrl={onUpdateImageUrl}
            isGeneratingAI={isGeneratingAIImage}
            isUploadingFile={isUploadingFile}
          />

          {/* Recipe Editor */}
          <ModerationRecipeEditor
            recipe={recipe}
            onSave={(updates) => onSaveFields(recipe, updates)}
            isSaving={isSavingFields}
          />
        </div>

        {/* Right Column - Actions and Info */}
        <div className="space-y-6">
          {/* Submission Info */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Submission Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Submitted By</p>
                <p className="text-sm font-medium">{recipe.submitted_by_name || "Anonymous"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">View Count</p>
                <p className="text-sm">{recipe.view_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Save Count</p>
                <p className="text-sm">{recipe.save_count}</p>
              </div>
            </div>
          </div>

          {/* Moderation Actions */}
          <ModerationActions
            recipe={recipe}
            onApprove={onApprove}
            onReject={onReject}
          />
        </div>
      </div>
    </div>
  );
}
