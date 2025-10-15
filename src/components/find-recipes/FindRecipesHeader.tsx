import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export const FindRecipesHeader = () => {
  return (
    <PageHeader
      icon={
        <Search 
          className="h-6 w-6 sm:h-7 sm:w-7" 
          style={{ color: '#F5B82E', stroke: '#F5B82E' }}
          aria-hidden="true"
        />
      }
      title="Find Recipes"
      description="Discover amazing recipes shared by RealiMeali users as community inspiration."
    />
  );
};
