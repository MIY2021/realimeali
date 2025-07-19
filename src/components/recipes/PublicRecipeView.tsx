
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Users, Heart, Share, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicRecipeShare } from "@/types";

interface PublicRecipeViewProps {
  recipe: PublicRecipeShare;
}

export const PublicRecipeView = ({ recipe }: PublicRecipeViewProps) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
              <p className="text-gray-600 mb-4">{recipe.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {recipe.prep_time + recipe.cook_time} mins
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{recipe.meal_type || 'Not specified'}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-terracotta mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="space-y-3">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-terracotta text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Shared by {recipe.shared_by_name} from {recipe.shared_by_household_name} • 
              Views: {recipe.view_count}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
