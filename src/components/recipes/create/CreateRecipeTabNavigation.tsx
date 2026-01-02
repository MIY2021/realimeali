
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Upload, Sparkles, Pencil, Camera, Star } from "lucide-react";
import { RecipeOrigin } from "./CreateRecipeContainer";

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
}

const baseTabOptions: TabOption[] = [
  { 
    value: "url", 
    label: "From Website", 
    emoji: "🌐",
    icon: Globe,
    description: "Import recipes directly from cooking websites with one click"
  },
  { 
    value: "image", 
    label: "From Photo", 
    emoji: "📸",
    icon: Upload,
    description: "Take a photo of a recipe card or cookbook page to extract the recipe"
  },
  { 
    value: "generate", 
    label: "Generate with AI", 
    emoji: "✨",
    icon: Star,
    description: "Describe what you want to cook and let AI create a complete recipe"
  },
  { 
    value: "text", 
    label: "Recipe Text", 
    emoji: "📝",
    icon: Pencil,
    description: "Paste a recipe from anywhere and our AI will format it perfectly"
  },
  { 
    value: "whatcanImake", 
    label: "What Can I Make?", 
    emoji: "🍽️",
    icon: Sparkles,
    description: "Tell us your ingredients and get personalized recipe suggestions"
  },
  { 
    value: "manual", 
    label: "Manual Entry", 
    emoji: "✍️",
    icon: Camera,
    description: "Create your recipe from scratch with our guided form"
  },
];

export function CreateRecipeTabNavigation({
  isMobile,
  activeTab,
  setActiveTab,
  recipeOrigin,
  children,
  isEditMode = false,
  isFromAI = false
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
  const activeTabOption = tabOptions.find(tab => tab.value === activeTab);
  
  // Hide tab navigation after recipe is imported (when on manual tab with a non-manual origin)
  const hideTabsAfterImport = activeTab === "manual" && recipeOrigin !== "manual" && !isEditMode;

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile Dropdown */}
        {!hideTabsAfterImport && isMobile ? (
          <div className="mb-6">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-12 rounded-[12px] border border-[#E3E3E3] bg-white shadow-sm">
                <SelectValue>
                  {activeTabOption && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{activeTabOption.emoji}</span>
                      <span className="font-medium">{activeTabOption.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E3E3E3] shadow-lg rounded-[12px]">
                {tabOptions.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value} className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : !hideTabsAfterImport ? (
          /* Desktop Tabs */
          <div className="mb-6">
            <TabsList className={`grid w-full ${isEditMode ? 'grid-cols-1' : 'grid-cols-6'} mb-4 bg-white/50 p-1 rounded-[12px] border border-[#E3E3E3]`}>
              {tabOptions.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="p-3 min-w-0 flex-1 rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span className="mr-2">{tab.emoji}</span>
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        ) : null}

        {children}
      </Tabs>
    </div>
  );
}
