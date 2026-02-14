
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
                      "relative flex flex-col items-center justify-start p-4 md:p-5 rounded-[20px]",
                      "border-2 transition-all duration-200",
                      "min-h-[120px] md:min-h-[140px]",
                      "shadow-lg md:hover:shadow-xl md:hover:scale-[1.02]",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F5B82E]",
                      "md:hover:-translate-y-0.5",
                      "active:scale-[0.98]",
                      isActive
                        ? "border-[#F5B82E] shadow-xl bg-gradient-to-br from-[#F5B82E]/15 via-[#F5B82E]/10 to-white ring-2 ring-[#F5B82E]/30"
                        : "border-[#E8E8E8] bg-white shadow-md md:hover:border-[#F5B82E]/50 md:hover:bg-gradient-to-br md:hover:from-white md:hover:to-[#F5B82E]/5"
                    )}
                    aria-label={tab.label}
                    aria-pressed={isActive}
                  >
                    {/* Icon/Emoji with background circle */}
                    <div className={cn(
                      "mb-2 md:mb-3 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-200",
                      isActive 
                        ? "bg-[#F5B82E]/20 shadow-sm" 
                        : "bg-[#F5F5F5]"
                    )}>
                      <span className="text-3xl md:text-4xl" role="img" aria-hidden="true">
                        {tab.emoji}
                      </span>
                    </div>
                    
                    {/* Label */}
                    <h3 className={cn(
                      "font-semibold text-sm md:text-base mb-1 md:mb-2 text-center transition-colors",
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
                    
                    {/* Active indicator - more prominent */}
                    {isActive && (
                      <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[#F5B82E] shadow-sm ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        {/* Tab content must be inside Tabs so TabsContent has context (e.g. after URL import) */}
        {children}
      </Tabs>
    </div>
  );
}
