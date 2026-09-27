
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Globe, Camera, Pencil, ChevronRight } from "lucide-react";
import { RecipeCardIcon, RealiChefIcon, MealIcon } from "@/components/icons/RealiMealiIcons";
import { RecipeOrigin } from "./CreateRecipeContainer";
import { cn } from "@/lib/utils";

interface TabOption {
  value: string;
  label: string;
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
    icon: Globe,
    description: "Paste a link and we’ll do the rest"
  },
  { 
    value: "image", 
    label: "From Photo", 
    icon: Camera,
    description: "Scan a recipe card with your camera"
  },
  { 
    value: "generate", 
    label: "Generate with AI", 
    icon: RealiChefIcon,
    description: "Tell RealiChef what you fancy"
  },
  { 
    value: "text", 
    label: "Recipe Text", 
    icon: RecipeCardIcon,
    description: "Paste recipe text and we’ll format it"
  },
  { 
    value: "whatcanImake", 
    label: "What Can I Make?", 
    icon: MealIcon,
    description: "Use what you already have"
  },
  { 
    value: "manual", 
    label: "Manual Entry", 
    icon: Pencil,
    description: "Build your recipe your way"
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
            label: isFromAI ? `Manual Entry · AI recipe` : `Manual Entry · ${originalTab.label}`,
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tabOptions.map((tab) => {
                const isActive = tab.value === activeTab;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.value);
                      onCardClick?.(tab.value);
                    }}
                    className={cn(
                      "group relative flex items-center gap-4 w-full text-left p-4 rounded-2xl",
                      "border bg-white transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-[#F5B82E]/40",
                      "active:scale-[0.99] md:hover:-translate-y-0.5 md:hover:shadow-md",
                      isActive
                        ? "border-[#F5B82E] bg-[#FFF9EA] shadow-sm"
                        : "border-gray-200 shadow-sm md:hover:border-[#F5B82E]/50"
                    )}
                    aria-label={tab.label}
                    aria-pressed={isActive}
                  >
                    <div className={cn(
                      "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center",
                      "transition-colors",
                      isActive ? "bg-[#F5B82E]/15 text-[#B85F49]" : "bg-[#F7F5F2] text-[#B85F49]"
                    )}>
                      <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[15px] text-[#1A1A1A] leading-tight">
                        {tab.label}
                      </h3>
                      <p className="mt-1 text-xs leading-snug text-[#6B6B6B] line-clamp-2">
                        {tab.description}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#B85F49]" />
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
