
import { Button } from "@/components/ui/button";
import { ArrowRight, Glasses, BookOpen, Eye } from "lucide-react";
import { useState, useEffect } from "react";

interface RecipeUrlTabProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
  isProcessing: boolean;
  onImportWithImages: () => void;
}

const funnyMessages = [
  { icon: "🤓", text: "Putting on reading glasses..." },
  { icon: "📖", text: "Carefully reading the recipe..." },
  { icon: "🔍", text: "Squinting at the small print..." },
  { icon: "👓", text: "Adjusting glasses for better vision..." },
  { icon: "📚", text: "Deciphering the chef's handwriting..." },
  { icon: "🧐", text: "Analyzing every ingredient..." },
  { icon: "📝", text: "Taking notes like a food critic..." },
  { icon: "🕵️", text: "Investigating cooking secrets..." },
  { icon: "📄", text: "Reading between the lines..." },
  { icon: "✨", text: "Adding some magic to the recipe..." },
];

export function RecipeUrlTab({ 
  recipeUrl, 
  setRecipeUrl, 
  isProcessing, 
  onImportWithImages
}: RecipeUrlTabProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showGlasses, setShowGlasses] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      setShowGlasses(true);
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % funnyMessages.length);
      }, 1500);
      
      return () => clearInterval(interval);
    } else {
      setShowGlasses(false);
      setCurrentMessageIndex(0);
    }
  }, [isProcessing]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className={`transition-all duration-500 ${showGlasses ? 'scale-110' : 'scale-100'}`}>
          <Glasses className={`h-16 w-16 mx-auto mb-4 transition-all duration-700 ${
            isProcessing ? 'text-blue-500 animate-pulse' : 'text-gray-400'
          }`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import from Website</h2>
        <p className="text-gray-600">
          I'll grab the recipe details and find the photos for you automatically!
        </p>
      </div>

      {isProcessing && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-dashed border-blue-200 animate-fade-in">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl animate-bounce">
              {funnyMessages[currentMessageIndex].icon}
            </span>
            <div className="text-lg font-medium text-gray-700 animate-pulse">
              {funnyMessages[currentMessageIndex].text}
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"
                 style={{ width: `${((currentMessageIndex + 1) / funnyMessages.length) * 100}%` }}>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Website URL
          </label>
          <input
            type="url"
            value={recipeUrl}
            onChange={(e) => setRecipeUrl(e.target.value)}
            placeholder="https://www.allrecipes.com/recipe/simple-pasta/"
            className="w-full p-4 border-2 rounded-xl text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            disabled={isProcessing}
          />
        </div>
        
        <Button 
          onClick={onImportWithImages} 
          disabled={isProcessing || !recipeUrl.trim()}
          className="w-full flex items-center justify-center gap-3 h-12 text-lg font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Reading Recipe...
            </>
          ) : (
            <>
              <ArrowRight className="h-5 w-5" />
              Import Recipe & Find Images
            </>
          )}
        </Button>

        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 mt-0.5 text-blue-500" />
            <p>
              <strong>How it works:</strong> I'll extract the recipe details and switch to Manual Entry 
              where you can select the best images and edit any details before saving.
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          💡 Works with popular sites like AllRecipes, Food Network, BBC Good Food, and many more!
        </div>
      </div>
    </div>
  );
}
