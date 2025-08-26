
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export function FindRecipesContent() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string, url: string) => {
    setSelectedOption(option);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const recipeOptions = [
    {
      id: 'allrecipes',
      name: 'AllRecipes',
      description: 'Discover thousands of tested recipes with ratings and reviews',
      url: 'https://www.allrecipes.com/',
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      id: 'bbc-good-food',
      name: 'BBC Good Food',
      description: 'British recipes and cooking inspiration from the BBC',
      url: 'https://www.bbcgoodfood.com/',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'food-network',
      name: 'Food Network',
      description: 'Celebrity chef recipes and cooking shows',
      url: 'https://www.foodnetwork.com/recipes',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      id: 'epicurious',
      name: 'Epicurious',
      description: 'Gourmet recipes and cooking techniques from food experts',
      url: 'https://www.epicurious.com/',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      id: 'taste-of-home',
      name: 'Taste of Home',
      description: 'Family-friendly recipes and comfort food classics',
      url: 'https://www.tasteofhome.com/recipes/',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'serious-eats',
      name: 'Serious Eats',
      description: 'Science-based cooking with detailed recipe testing',
      url: 'https://www.seriouseats.com/',
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-navy mb-2">Find Recipe Inspiration</h2>
        <p className="text-muted-foreground">
          Explore popular recipe websites to discover new dishes and cooking ideas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipeOptions.map((option) => (
          <Card 
            key={option.id} 
            className={`cursor-pointer transition-all duration-200 ${option.color}`}
            onClick={() => handleOptionSelect(option.id, option.url)}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {option.name}
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {option.description}
              </p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionSelect(option.id, option.url);
                }}
              >
                Visit {option.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Once you find a recipe you like, you can come back to RealiMeali 
          and add it to your collection using our "Create Recipe" feature!
        </p>
      </div>
    </div>
  );
}
