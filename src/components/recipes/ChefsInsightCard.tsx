import { useState, useEffect } from "react";
import { Lightbulb, Sparkles, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Recipe } from "@/types";
import { useRealiChef } from "@/contexts/RealiChefContext";

interface ChefsInsightCardProps {
  recipe: Recipe;
  recipeId: string;
}

export const ChefsInsightCard = ({ recipe, recipeId }: ChefsInsightCardProps) => {
  const [isAlcoholic, setIsAlcoholic] = useState(true);
  const { setIsOpen } = useRealiChef();

  // Load drink preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem(`drink-preference-${recipeId}`);
    if (savedPreference !== null) {
      setIsAlcoholic(savedPreference === "true");
    }
  }, [recipeId]);

  const handleToggle = (alcoholic: boolean) => {
    setIsAlcoholic(alcoholic);
    localStorage.setItem(`drink-preference-${recipeId}`, alcoholic.toString());
  };

  const handleAskRealiChef = () => {
    setIsOpen(true);
  };

  // Check if we should show the top tip
  const hasValidTopTip = recipe.top_tip && 
    recipe.top_tip !== "No top tip available for this recipe." &&
    recipe.top_tip.trim() !== "";

  const drinkSuggestion = isAlcoholic
    ? "A crisp white wine or light beer pairs beautifully with this dish."
    : "Try sparkling water with fresh lemon or a fruit-infused iced tea.";

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-sage/10 bg-gradient-to-br from-amber-50/50 via-green-50/30 to-sage-50/40 shadow-lg shadow-sage/10 animate-fade-in mb-6">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">👨‍🍳</span>
          <h2 className="text-2xl font-semibold text-gray-800">Chef's Insight</h2>
        </div>

        {/* Top Tip Section */}
        {hasValidTopTip && (
          <>
            <div className="bg-amber-50/50 border border-amber-200/30 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 leading-relaxed">{recipe.top_tip}</p>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-sage/20 to-transparent my-6" />
          </>
        )}

        {/* Drink Pairing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sage" />
            <h3 className="text-lg font-semibold text-gray-800">Perfect Pairing</h3>
          </div>

          {/* Toggle Pills */}
          <div className="flex gap-2">
            <button
              onClick={() => handleToggle(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                isAlcoholic
                  ? "bg-sage text-white shadow-md"
                  : "bg-white border border-sage/30 text-gray-700 hover:border-sage/50"
              }`}
            >
              🍷 Alcoholic
            </button>
            <button
              onClick={() => handleToggle(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                !isAlcoholic
                  ? "bg-sage text-white shadow-md"
                  : "bg-white border border-sage/30 text-gray-700 hover:border-sage/50"
              }`}
            >
              💧 Non-Alcoholic
            </button>
          </div>

          {/* Suggestion Text with fade animation */}
          <div key={isAlcoholic ? "alcoholic" : "non-alcoholic"} className="animate-fade-in">
            <p className="text-gray-700 leading-relaxed pl-1">{drinkSuggestion}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-sage/20 to-transparent my-6" />

        {/* Ask RealiChef Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-sage" />
            <h3 className="text-lg font-semibold text-gray-800">Ask RealiChef</h3>
          </div>

          {/* Interactive input pill */}
          <button
            onClick={handleAskRealiChef}
            className="w-full bg-white border-2 border-sage/20 hover:border-sage/40 rounded-full px-5 py-3 text-left text-gray-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            Ask a question about this recipe...
          </button>
        </div>
      </div>
    </Card>
  );
};
