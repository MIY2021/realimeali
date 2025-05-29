
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateRecipeTabNavigationProps {
  isMobile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function CreateRecipeTabNavigation({
  isMobile,
  activeTab,
  setActiveTab,
  children
}: CreateRecipeTabNavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="text">Text</TabsTrigger>
        <TabsTrigger value="url">URL</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
        <TabsTrigger value="generate">Generate</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
