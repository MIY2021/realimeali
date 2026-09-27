import { Plus } from "lucide-react";
import { MealPlanIcon, RealiChefIcon, RandomRecipeIcon } from "@/components/icons/RealiMealiIcons";
import { Link, useNavigate } from "react-router-dom";
import { useRealiChef } from "@/contexts/RealiChefContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { toast } from "sonner";
import { useRecipeShuffle } from "@/hooks/useRecipeShuffle";
import { RecipeShuffleDialog } from "./RecipeShuffleDialog";

export const QuickActions = () => {
  const { setIsOpen } = useRealiChef();
  const { recipes } = useRecipes();
  const navigate = useNavigate();
  
  const { 
    isOpen: shuffleOpen, 
    setIsOpen: setShuffleOpen, 
    phase, 
    selectedRecipe, 
    shuffleCards, 
    startShuffle 
  } = useRecipeShuffle(recipes);

  const handleRandomRecipe = () => {
    if (!recipes || recipes.length === 0) {
      toast.error("No recipes available");
      return;
    }
    startShuffle();
  };

  const actions = [
    {
      title: "Add Recipe",
      icon: Plus,
      href: "/create-recipe",
      type: "navigation" as const,
      iconBg: "bg-sage",
      iconColor: "text-white",
    },
    {
      title: "Plan Meals",
      icon: MealPlanIcon,
      href: "/meal-planner",
      type: "navigation" as const,
      iconBg: "bg-terracotta",
      iconColor: "text-white",
    },
    {
      title: "AI Chef",
      icon: RealiChefIcon,
      type: "modal" as const,
      onClick: () => setIsOpen(true),
      iconBg: "bg-[#8B6BAE]",
      iconColor: "text-white",
    },
    {
      title: "Random Recipe",
      icon: RandomRecipeIcon,
      type: "modal" as const,
      onClick: handleRandomRecipe,
      iconBg: "bg-[#D96C4F]",
      iconColor: "text-white",
    },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.type === 'modal' && action.onClick) {
      action.onClick();
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const content = (
              <div
                className="
                  bg-white
                  rounded-3xl p-6
                  flex flex-col items-center justify-center gap-4
                  shadow-md border border-gray-100
                  transition-all duration-300
                  hover:shadow-xl hover:-translate-y-1
                  active:scale-[0.98]
                  cursor-pointer
                  min-h-[120px]
                  relative overflow-hidden
                  group
                "
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.iconBg.replace('bg-', 'from-')}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className={`${action.iconBg} rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <action.icon className={`h-7 w-7 ${action.iconColor}`} />
                </div>
                <span className="text-sm font-bold text-gray-900 text-center leading-tight relative z-10">
                  {action.title}
                </span>
              </div>
            );

            return action.type === 'navigation' ? (
              <Link key={action.title} to={action.href!}>
                {content}
              </Link>
            ) : (
              <div key={action.title} onClick={() => handleActionClick(action)}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      <RecipeShuffleDialog
        isOpen={shuffleOpen}
        onOpenChange={setShuffleOpen}
        phase={phase}
        selectedRecipe={selectedRecipe}
        shuffleCards={shuffleCards}
        onViewRecipe={() => {
          if (selectedRecipe) {
            setShuffleOpen();
            navigate(`/my-recipes/${selectedRecipe.id}`);
          }
        }}
        onShuffleAgain={startShuffle}
      />
    </>
  );
};
