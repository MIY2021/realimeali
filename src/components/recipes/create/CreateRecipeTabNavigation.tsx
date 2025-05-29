
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Upload, Sparkles, Pencil, Camera } from "lucide-react";

interface TabOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CreateRecipeTabNavigationProps {
  isMobile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const tabOptions: TabOption[] = [
  { value: "text", label: "Recipe Text", icon: Pencil },
  { value: "url", label: "From Website", icon: Globe },
  { value: "image", label: "From Photo", icon: Upload },
  { value: "generate", label: "AI Generate", icon: Sparkles },
  { value: "manual", label: "Manual Entry", icon: Camera },
];

export function CreateRecipeTabNavigation({
  isMobile,
  activeTab,
  setActiveTab,
  children
}: CreateRecipeTabNavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Mobile Dropdown */}
      {isMobile ? (
        <div className="mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {tabOptions.find(tab => tab.value === activeTab)?.label}
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
        <TabsList className="grid w-full grid-cols-5 mb-4 sm:mb-6">
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
      )}

      {children}
    </Tabs>
  );
}
