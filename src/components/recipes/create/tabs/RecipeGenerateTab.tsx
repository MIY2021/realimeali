
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Lightbulb, Coins, Star } from "lucide-react";
import { useState, useEffect } from "react";

interface RecipeGenerateTabProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  isProcessing: boolean;
  onGenerate: () => void;
  stylePreferences: string[];
  setStylePreferences: (preferences: string[]) => void;
}

const funnyMessages = [
  "Channeling my inner Gordon Ramsay...",
  "Consulting the recipe gods...",
  "Asking Jamie Oliver for advice...",
  "Whispering sweet nothings to the ingredients...",
  "Calculating the perfect pinch of salt...",
  "Having a heated debate with my cookbook...",
  "Convincing the onions not to make you cry...",
  "Teaching the garlic some new moves...",
  "Negotiating with stubborn spices...",
  "Making sure the recipe doesn't burn...",
  "Channeling chef vibes from the food network...",
  "Asking Julia Child for her blessing...",
  "Convincing the herbs to behave...",
  "Making friends with the measuring cups...",
  "Having a heart-to-heart with the oven...",
  "Persuading the pasta to be al dente...",
  "Bribing the sauce to taste amazing...",
  "Teaching the vegetables some manners...",
  "Consulting my grandmother's spirit...",
  "Making sure this doesn't end in disaster...",
  "Channeling MasterChef energy...",
  "Asking the food gods for mercy...",
  "Convincing the timer to be patient...",
  "Having a philosophical chat with the ingredients...",
  "Making sure everything plays nicely together...",
  "Summoning the spirit of fine dining...",
  "Teaching the recipe some life lessons...",
  "Negotiating peace between flavors...",
  "Making sure this won't require a fire extinguisher...",
  "Consulting the ancient art of not burning things..."
];

export function RecipeGenerateTab({ 
  aiPrompt, 
  setAiPrompt, 
  isProcessing, 
  onGenerate,
  stylePreferences,
  setStylePreferences
}: RecipeGenerateTabProps) {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * funnyMessages.length);
      setCurrentMessage(randomIndex);
    }, 2500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Describe Your Recipe</label>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Tell us what kind of recipe you want to create - ingredients you have, cuisine type, dietary requirements, etc..."
          className="w-full h-24 sm:h-32 p-3 sm:p-4 border rounded-lg resize-none text-sm sm:text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Recipe Style</label>
        <ToggleGroup 
          type="multiple" 
          value={stylePreferences}
          onValueChange={setStylePreferences}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full"
        >
          <ToggleGroupItem 
            value="quick-easy" 
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent"
          >
            <Lightbulb className="h-4 w-4" />
            <span className="font-medium">Quick & Easy</span>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="cheap-cheerful" 
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent"
          >
            <Coins className="h-4 w-4" />
            <span className="font-medium">Cheap & Cheerful</span>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="michelin-star" 
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent"
          >
            <Star className="h-4 w-4" />
            <span className="font-medium">Michelin Star</span>
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-xs text-muted-foreground mt-2">
          Select one or more styles to customize your recipe generation
        </p>
      </div>

      <Button 
        onClick={onGenerate} 
        disabled={isProcessing || !aiPrompt.trim()}
        className={`
          w-full h-11 sm:h-10 
          transition-all duration-300 ease-in-out
          ${isProcessing ? 'scale-95' : 'hover:scale-105'}
          shadow-lg hover:shadow-xl
          ${isProcessing ? 'animate-pulse' : ''}
        `}
      >
        {isProcessing ? (
          <>
            <svg 
              className="h-4 w-4 animate-spin mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            <span className="animate-fade-in">
              Creating Recipe...
            </span>
          </>
        ) : (
          "Create Recipe with AI"
        )}
      </Button>

      {isProcessing && (
        <div className="flex items-center gap-3 text-left mt-4">
          <div className="cooking-chef">
            👨‍🍳
          </div>
          <p className="text-sm text-muted-foreground animate-fade-in">
            {funnyMessages[currentMessage]}
          </p>
        </div>
      )}
      
      <style>{`
        .cooking-chef {
          animation: cook 1.5s ease-in-out infinite alternate;
          font-size: 18px;
        }
        
        @keyframes cook {
          0% {
            transform: translateY(0px) rotate(-3deg);
          }
          100% {
            transform: translateY(-6px) rotate(3deg);
          }
        }
      `}</style>
    </div>
  );
}
