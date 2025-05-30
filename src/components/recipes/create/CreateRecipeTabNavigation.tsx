
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
  children
}: CreateRecipeTabNavigationProps) {
  
  // Generate dynamic tab options based on recipe origin
  const getDynamicTabOptions = (): TabOption[] => {
    const tabOptions = [...baseTabOptions];
    
    // If we're on the manual tab but the recipe origin is different, update the manual tab
    if (activeTab === "manual" && recipeOrigin !== "manual") {
      const originalTab = baseTabOptions.find(tab => tab.value === recipeOrigin);
      if (originalTab) {
        const manualTabIndex = tabOptions.findIndex(tab => tab.value === "manual");
        if (manualTabIndex !== -1) {
          tabOptions[manualTabIndex] = {
            ...tabOptions[manualTabIndex],
            label: originalTab.label,
            emoji: originalTab.emoji,
            icon: originalTab.icon,
            description: `Edit your ${originalTab.label.toLowerCase()} recipe`
          };
        }
      }
    }
    
    return tabOptions;
  };

  const tabOptions = getDynamicTabOptions();
  const activeTabOption = tabOptions.find(tab => tab.value === activeTab);

  return (
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
        /* Desktop Tabs */
        <div className="mb-4 sm:mb-6">
          <TabsList className="grid w-full grid-cols-5 mb-3">
            {tabOptions.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="p-2">
                <span className="mr-2">{tab.emoji}</span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      )}

      {children}
    </Tabs>
  );
}
