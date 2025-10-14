import { useState, useEffect } from "react";
import { Lightbulb, Sparkles, Mail, ChevronDown } from "lucide-react";
import { Recipe } from "@/types";
import { useRealiChef } from "@/contexts/RealiChefContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ChefsInsightCardProps {
  recipe: Recipe;
  recipeId: string;
}

export const ChefsInsightCard = ({ recipe, recipeId }: ChefsInsightCardProps) => {
  const [isAlcoholic, setIsAlcoholic] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { setIsOpen } = useRealiChef();

  // Load expanded state from localStorage
  useEffect(() => {
    const savedExpanded = localStorage.getItem(`chef-insight-expanded-${recipeId}`);
    if (savedExpanded !== null) {
      setIsExpanded(savedExpanded === "true");
    }
  }, [recipeId]);

  // Load drink preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem(`drink-preference-${recipeId}`);
    if (savedPreference !== null) {
      setIsAlcoholic(savedPreference === "true");
    }
  }, [recipeId]);

  const handleToggleExpand = (open: boolean) => {
    setIsExpanded(open);
    localStorage.setItem(`chef-insight-expanded-${recipeId}`, open.toString());
  };

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
    ? "Pairs beautifully with a crisp Sauvignon Blanc or light craft beer."
    : "Try sparkling water with fresh lemon or a fruit-infused iced tea.";

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={handleToggleExpand}
      className="rounded-3xl bg-[#FFF9F5] shadow-md hover:shadow-lg transition-shadow duration-300 mb-6 overflow-hidden"
    >
      <CollapsibleTrigger asChild>
        <button className="w-full p-4 sm:p-5 flex items-start justify-between hover:bg-gray-50/50 transition-colors duration-200 active:scale-[0.99] group">
          <div className="flex items-start gap-3 text-left">
            <div className="text-gray-700 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                <line x1="6" x2="18" y1="17" y2="17"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Chef's Insight</h2>
              <p className="text-sm text-gray-500 mt-0.5">Tips, pairings & chat</p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-300 ease-in-out flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-6">
          {/* Top Tip Section */}
          {hasValidTopTip && (
            <div className="flex items-start gap-3 animate-fade-in">
              <Lightbulb className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <p className="text-[15px] text-gray-700 leading-relaxed">{recipe.top_tip}</p>
            </div>
          )}

          {/* Perfect Pairing Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-600">Perfect Pairing</h3>
            </div>

            {/* Toggle Pills */}
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-250 ease-out ${
                  isAlcoholic
                    ? "bg-[#E07A5F]/90 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                Alcoholic
              </button>
              <button
                onClick={() => handleToggle(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-250 ease-out ${
                  !isAlcoholic
                    ? "bg-[#48A97D]/90 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                Non-Alcoholic
              </button>
            </div>

            {/* Suggestion Text with fade animation */}
            <div key={isAlcoholic ? "alcoholic" : "non-alcoholic"} className="animate-fade-in">
              <p className="text-[15px] text-gray-600 leading-relaxed mt-3">{drinkSuggestion}</p>
            </div>
          </div>

          {/* Ask RealiChef Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-600">Ask RealiChef</h3>
            </div>

            {/* Interactive input field */}
            <button
              onClick={handleAskRealiChef}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-left text-sm text-gray-500 placeholder:text-gray-400 shadow-sm hover:border-gray-300 hover:shadow-md focus:scale-[1.01] focus:shadow-lg transition-all duration-200"
            >
              Ask a question about this recipe...
            </button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
