import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DrinkPairingCardProps {
  recipeId: string;
}

export const DrinkPairingCard = ({ recipeId }: DrinkPairingCardProps) => {
  const [isAlcoholic, setIsAlcoholic] = useState(true);
  
  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`recipe-drink-preference-${recipeId}`);
    if (saved !== null) {
      setIsAlcoholic(saved === 'alcoholic');
    }
  }, [recipeId]);
  
  const handleToggle = (alcoholic: boolean) => {
    setIsAlcoholic(alcoholic);
    localStorage.setItem(
      `recipe-drink-preference-${recipeId}`,
      alcoholic ? 'alcoholic' : 'non-alcoholic'
    );
  };
  
  const suggestion = isAlcoholic
    ? "Pairs well with a crisp Sauvignon Blanc."
    : "Pairs well with sparkling water with lemon.";
  
  return (
    <Card className="mb-6 shadow-sm border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-terracotta mb-4">Drink Pairing</h3>
        
        {/* Toggle buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={isAlcoholic ? "default" : "outline"}
            onClick={() => handleToggle(true)}
            className={`flex-1 rounded-full ${
              isAlcoholic 
                ? 'bg-gray-900 text-white hover:bg-gray-800' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Alcoholic
          </Button>
          <Button
            variant={!isAlcoholic ? "default" : "outline"}
            onClick={() => handleToggle(false)}
            className={`flex-1 rounded-full ${
              !isAlcoholic 
                ? 'bg-gray-900 text-white hover:bg-gray-800' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Non-Alcoholic
          </Button>
        </div>
        
        {/* Icon and suggestion */}
        <div className="flex items-center gap-3 text-gray-700">
          <Sparkles className="h-6 w-6 text-terracotta flex-shrink-0" />
          <p className="text-sm">{suggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
};