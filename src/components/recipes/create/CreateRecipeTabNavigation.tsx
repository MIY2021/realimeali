
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Globe, Upload, Sparkles, Pencil, Camera, Star } from "lucide-react";
import { RecipeOrigin } from "./CreateRecipeContainer";
import { cn } from "@/lib/utils";

interface TabOption {
  value: string;
  label: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface CreateRecipeTabNavigationProps {
  isMobile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recipeOrigin: RecipeOrigin;
  children: React.ReactNode;
  isEditMode?: boolean;
  isFromAI?: boolean;
  onCardClick?: (tab: string) => void;
}

const baseTabOptions: TabOption[] = [
  { 
    value: "url", 
    label: "From Website", 
    emoji: "🌐",
    icon: Globe,
    description: "Import recipes from cooking websites instantly"
  },
  { 
    value: "image", 
    label: "From Photo", 
    emoji: "📸",
    icon: Upload,
    description: "Take a photo of a recipe card to extract all details"
  },
  { 
    value: "generate", 
    label: "Generate with AI", 
    emoji: "✨",
    icon: Star,
    description: "Describe your dish and AI creates the recipe"
  },
  { 
    value: "text", 
    label: "Recipe Text", 
    emoji: "📝",
    icon: Pencil,
    description: "Paste any recipe text and we'll format it perfectly"
  },
  { 
    value: "whatcanImake", 
    label: "What Can I Make?", 
    emoji: "🍽️",
    icon: Sparkles,
    description: "Enter your ingredients and discover recipe ideas"
  },
  { 
    value: "manual", 
    label: "Manual Entry", 
    emoji: "✍️",
    icon: Camera,
    description: "Build your recipe step by step with our easy form"
  },
];

export function CreateRecipeTabNavigation({
  isMobile,
  activeTab,
  setActiveTab,
  recipeOrigin,
  children,
  isEditMode = false,
  isFromAI = false,
  onCardClick
}: CreateRecipeTabNavigationProps) {
  
  // Generate dynamic tab options based on recipe origin and edit mode
  const getDynamicTabOptions = (): TabOption[] => {
    let tabOptions = [...baseTabOptions];
    
    // In edit mode, hide certain tabs and focus on manual editing
    if (isEditMode) {
      tabOptions = tabOptions.filter(tab => ['manual'].includes(tab.value));
      return tabOptions;
    }
    
    // Only update the manual tab if we're on it AND the origin is different AND it wasn't manually clicked
    if (activeTab === "manual" && recipeOrigin !== "manual") {
      const originalTab = baseTabOptions.find(tab => tab.value === recipeOrigin);
      if (originalTab) {
        const manualTabIndex = tabOptions.findIndex(tab => tab.value === "manual");
        if (manualTabIndex !== -1) {
          tabOptions[manualTabIndex] = {
            ...tabOptions[manualTabIndex],
            label: isFromAI ? `Manual Entry [AI Generated]` : `Manual Entry (${originalTab.label})`,
            emoji: "✍️",
            description: isFromAI ? `Edit your AI generated recipe manually` : `Edit your ${originalTab.label.toLowerCase()} recipe manually`
          };
        }
      }
    }
    
    return tabOptions;
  };

  const tabOptions = getDynamicTabOptions();
  
  // Hide tab navigation after recipe is imported (when on manual tab with a non-manual origin)
  const hideTabsAfterImport = activeTab === "manual" && recipeOrigin !== "manual" && !isEditMode;
  
  // Hide tab navigation entirely in edit mode
  const hideTabsInEditMode = isEditMode;

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Card Grid Navigation */}
        {!hideTabsAfterImport && !hideTabsInEditMode ? (
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {tabOptions.map((tab) => {
                const isActive = tab.value === activeTab;
                
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.value);
                      onCardClick?.(tab.value);
                    }}
                    className={cn(
                      "relative flex flex-col items-center justify-start p-4 md:p-5 rounded-[12px]",
                      "bg-white border-2 transition-all duration-200",
                      "min-h-[120px] md:min-h-[140px]",
                      "hover:shadow-md hover:scale-[1.02]",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F5B82E]",
                      isActive
                        ? "border-[#F5B82E] shadow-sm bg-[#F5B82E]/5"
                        : "border-[#E3E3E3] hover:border-[#F5B82E]/50"
                    )}
                    aria-label={tab.label}
                    aria-pressed={isActive}
                  >
                    {/* Icon/Emoji */}
                    <div className="mb-2 md:mb-3">
                      <span className="text-3xl md:text-4xl" role="img" aria-hidden="true">
                        {tab.emoji}
                      </span>
                    </div>
                    
                    {/* Label */}
                    <h3 className={cn(
                      "font-semibold text-sm md:text-base mb-1 md:mb-2 text-center",
                      isActive ? "text-[#1A1A1A]" : "text-[#1A1A1A]"
                    )}>
                      {tab.label}
                    </h3>
                    
                    {/* Description */}
                    <p className={cn(
                      "text-xs md:text-sm text-center leading-tight",
                      "text-[#6B6B6B] line-clamp-2"
                    )}>
                      {tab.description}
                    </p>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F5B82E]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </Tabs>
      
      {/* Content is now shown in Sheet, not inline */}
      {children}
    </div>
  );
}
