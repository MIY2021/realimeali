
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Upload, Sparkles, Pencil, Camera } from "lucide-react";
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
    label: "AI Generate", 
    emoji: "🤖",
    icon: Sparkles,
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
  isEditMode = false
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
            label: `Manual Entry (${originalTab.label})`,
            emoji: "✍️",
            description: `Edit your ${originalTab.label.toLowerCase()} recipe manually`
          };
        }
      }
    }
    
    return tabOptions;
  };

  const tabOptions = getDynamicTabOptions();
  const activeTabOption = tabOptions.find(tab => tab.value === activeTab);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile Dropdown */}
        {isMobile ? (
          <div className="mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {activeTabOption && (
                    <div className="flex items-center gap-2">
                      <span>{activeTabOption.emoji}</span>
                      {activeTabOption.label}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tabOptions.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center gap-2">
                      <span>{tab.emoji}</span>
                      {tab.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          /* Desktop Tabs - Fixed width to prevent layout shift */
          <div className="mb-4 sm:mb-6">
            <TabsList className={`grid w-full ${isEditMode ? 'grid-cols-1' : 'grid-cols-5'} mb-3 min-h-[40px]`}>
              {tabOptions.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="p-2 min-w-0 flex-1">
                  <span className="mr-2">{tab.emoji}</span>
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}

        {children}
      </Tabs>
    </div>
  );
}
