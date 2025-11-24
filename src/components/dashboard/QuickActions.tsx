import { Plus, Calendar, Sparkles, Shuffle } from "lucide-react";
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
      iconBg: "bg-emerald-500",
      iconColor: "text-white",
    },
    {
      title: "Plan Meals",
      icon: Calendar,
      href: "/meal-planner",
      type: "navigation" as const,
      iconBg: "bg-blue-500",
      iconColor: "text-white",
    },
    {
      title: "AI Chef",
      icon: Sparkles,
      type: "modal" as const,
      onClick: () => setIsOpen(true),
      iconBg: "bg-purple-500",
      iconColor: "text-white",
    },
    {
      title: "Random Recipe",
      icon: Shuffle,
      type: "modal" as const,
      onClick: handleRandomRecipe,
      iconBg: "bg-red-500",
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
          <h2 className="text-xl font-extrabold">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const content = (
              <div
                className="
                  bg-white
                  rounded-3xl p-5
                  flex flex-col items-center justify-center gap-3
                  shadow-sm
                  transition-all duration-200
                  hover:shadow-md
                  active:scale-95
                  cursor-pointer
                  min-h-[100px]
                "
              >
                <div className={`${action.iconBg} rounded-full p-3 shadow-sm`}>
                  <action.icon className={`h-7 w-7 ${action.iconColor}`} />
                </div>
                <span className="text-sm font-semibold text-gray-900 text-center leading-tight">
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
