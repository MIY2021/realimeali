
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Upload, Sparkles, Pencil, Camera } from "lucide-react";

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
  children: React.ReactNode;
}

const tabOptions: TabOption[] = [
  { 
    value: "url", 
    label: "From Website", 
    icon: Globe,
    description: "Import recipes directly from cooking websites with one click"
  },
  { 
    value: "image", 
    label: "From Photo", 
    icon: Upload,
    description: "Take a photo of a recipe card or cookbook page to extract the recipe"
  },
  { 
    value: "generate", 
    label: "AI Generate", 
    icon: Sparkles,
    description: "Describe what you want to cook and let AI create a complete recipe"
  },
  { 
    value: "text", 
    label: "Recipe Text", 
    icon: Pencil,
    description: "Paste a recipe from anywhere and our AI will format it perfectly"
  },
  { 
    value: "manual", 
    label: "Manual Entry", 
    icon: Camera,
    description: "Create your recipe from scratch with our guided form"
  },
];

export function CreateRecipeTabNavigation({
  isMobile,
  activeTab,
  setActiveTab,
  children
}: CreateRecipeTabNavigationProps) {
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
                    <activeTabOption.icon className="h-4 w-4" />
                    {activeTabOption.label}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      ) : (
        /* Desktop Tabs */
        <div className="mb-4 sm:mb-6">
          <TabsList className="grid w-full grid-cols-5 mb-3">
            {tabOptions.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="p-2">
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      )}

      {children}
    </Tabs>
  );
}
