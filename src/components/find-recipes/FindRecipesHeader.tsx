import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export const FindRecipesHeader = () => {
  return (
    <PageHeader
      icon={Search}
      title="Find Recipes"
      description="Discover amazing recipes shared by RealiMeali users as community inspiration."
    />
  );
};
