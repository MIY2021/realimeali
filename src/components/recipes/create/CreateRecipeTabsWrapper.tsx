
import { CreateRecipeTabNavigation } from "./CreateRecipeTabNavigation";
import { RecipeTabsContent } from "./RecipeTabsContent";
import { RecipeSaveSection } from "./RecipeSaveSection";
import { useRecipeCompletionStatus } from "./RecipeCompletionStatus";
import { RecipeOrigin } from "./CreateRecipeContainer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Globe, Camera, Pencil } from "lucide-react";
import { RecipeCardIcon, RealiChefIcon, MealIcon } from "@/components/icons/RealiMealiIcons";

interface CreateRecipeTabsWrapperProps {
  isMobile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recipeOrigin: RecipeOrigin;
  recipeFormHook: any;
  recipeProcessingHook: any;
  onProcessText: () => void;
  onImportFromUrlWithImages: () => void;
  onProcessImage: (file: File) => void;
  onGenerateRecipe: () => void;
  onGenerateImage: () => void;
  onSave: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
  isFromAI?: boolean;
  onSelectWhatCanIMakeRecipe?: (recipe: any) => void;
  isSaving?: boolean;
  onCardClick?: (tab: string) => void;
  isSheetOpen?: boolean;
  onSheetClose?: (open: boolean) => void;
}

export function CreateRecipeTabsWrapper({
  isMobile,
  activeTab,
  setActiveTab,
  recipeOrigin,
  recipeFormHook,
  recipeProcessingHook,
  onProcessText,
  onImportFromUrlWithImages,
  onProcessImage,
  onGenerateRecipe,
  onGenerateImage,
  onSave,
  onCancel,
  isEditMode = false,
  isFromAI = false,
  onSelectWhatCanIMakeRecipe,
  isSaving = false,
  onCardClick,
  isSheetOpen = false,
  onSheetClose,
}: CreateRecipeTabsWrapperProps) {
  
  const status = useRecipeCompletionStatus({ newRecipe: recipeFormHook.newRecipe });
  
  // Hide tab navigation after recipe is imported (when on manual tab with a non-manual origin)
  const hideTabsAfterImport = activeTab === "manual" && recipeOrigin !== "manual" && !isEditMode;
  
  // Show content inline only after import (when on manual tab with imported content)
  // Otherwise, show in Sheet
  const showContentInline = hideTabsAfterImport || isEditMode;

  // Get tab label and icon for Sheet header
  const getTabInfo = (tab: string) => {
    const tabInfo: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
      url: { label: "From Website", icon: Globe },
      image: { label: "From Photo", icon: Camera },
      generate: { label: "Generate with AI", icon: RealiChefIcon },
      text: { label: "Recipe Text", icon: RecipeCardIcon },
      whatcanImake: { label: "What Can I Make?", icon: MealIcon },
      manual: { label: "Manual Entry", icon: Pencil }
    };
    return tabInfo[tab] || { label: "Add Recipe", icon: RecipeCardIcon };
  };

  return (
    <div className="space-y-4">
      {/* Card Grid - Always visible unless content is shown inline */}
      {!showContentInline && (
        <div className="bg-white/50 backdrop-blur-sm rounded-none sm:rounded-lg shadow-none sm:shadow-md border-0 sm:border border-white/20 p-4 sm:p-6">
          <CreateRecipeTabNavigation 
            isMobile={isMobile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            recipeOrigin={recipeOrigin}
            isEditMode={isEditMode}
            isFromAI={isFromAI}
            onCardClick={onCardClick}
          />
        </div>
      )}

      {/* Inline Content - Only shown after import or in edit mode */}
      {showContentInline && (
        <div className="bg-white/50 backdrop-blur-sm rounded-none sm:rounded-lg shadow-none sm:shadow-md border-0 sm:border border-white/20">
          <CreateRecipeTabNavigation 
            isMobile={isMobile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            recipeOrigin={recipeOrigin}
            isEditMode={isEditMode}
            isFromAI={isFromAI}
            onCardClick={onCardClick}
          >
            <RecipeTabsContent
              isMobile={isMobile}
              recipeFormHook={recipeFormHook}
              recipeProcessingHook={recipeProcessingHook}
              onProcessText={onProcessText}
              onImportFromUrlWithImages={onImportFromUrlWithImages}
              onProcessImage={onProcessImage}
              onGenerateRecipe={onGenerateRecipe}
              onGenerateImage={onGenerateImage}
              onSelectWhatCanIMakeRecipe={onSelectWhatCanIMakeRecipe}
              recipeOrigin={recipeOrigin}
            />
          </CreateRecipeTabNavigation>
        </div>
      )}

      {/* Sheet for card-based selection */}
      {!showContentInline && onSheetClose && (
        <Sheet open={isSheetOpen} onOpenChange={onSheetClose}>
          <SheetContent 
            side={isMobile ? "bottom" : "right"}
            className={cn(
              isMobile 
                ? "h-[90vh] w-full bg-white p-0 overflow-hidden" 
                : activeTab === 'manual'
                  ? "w-full sm:max-w-3xl lg:max-w-5xl bg-white p-0 overflow-hidden"
                  : "w-full sm:max-w-2xl lg:max-w-4xl bg-white p-0 overflow-hidden"
            )}
          >
            <div className="flex flex-col h-full">
              <SheetHeader className="px-4 sm:px-6 py-3 bg-white border-b sticky top-0 z-10">
                <SheetTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F7F5F2] text-[#B85F49]"><>{(() => { const Icon = getTabInfo(activeTab).icon; return <Icon className="h-5 w-5" />; })()}</></span>
                  {getTabInfo(activeTab).label}
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <RecipeTabsContent
                    isMobile={isMobile}
                    recipeFormHook={recipeFormHook}
                    recipeProcessingHook={recipeProcessingHook}
                    onProcessText={onProcessText}
                    onImportFromUrlWithImages={onImportFromUrlWithImages}
                    onProcessImage={onProcessImage}
                    onGenerateRecipe={onGenerateRecipe}
                    onGenerateImage={onGenerateImage}
                    onSelectWhatCanIMakeRecipe={onSelectWhatCanIMakeRecipe}
                    recipeOrigin={recipeOrigin}
                  />
                </Tabs>
              </div>

              {/* Save section in Sheet for manual tab */}
              {activeTab === 'manual' && (
                <div className="border-t bg-white px-4 sm:px-6 py-4 sticky bottom-0">
                  <RecipeSaveSection
                    wasGenerated={status.wasGenerated}
                    isComplete={status.isComplete}
                    isProcessing={recipeProcessingHook.isProcessing}
                    onSave={onSave}
                    onCancel={() => {
                      onSheetClose(false);
                      onCancel();
                    }}
                    recipeOrigin={recipeOrigin}
                    isEditMode={isEditMode}
                    isSaving={isSaving}
                  />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Save section inline - Only shown after import */}
      {showContentInline && activeTab === 'manual' && (
        <RecipeSaveSection
          wasGenerated={status.wasGenerated}
          isComplete={status.isComplete}
          isProcessing={recipeProcessingHook.isProcessing}
          onSave={onSave}
          onCancel={onCancel}
          recipeOrigin={recipeOrigin}
          isEditMode={isEditMode}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
