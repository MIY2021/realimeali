
import { useParams } from "react-router-dom";
import { PublicRecipeView } from "@/components/recipes/PublicRecipeView";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PublicRecipeShare } from "@/types";

// Mock recipe data for now
const mockRecipe: PublicRecipeShare = {
  public_share_id: "abc123",
  original_recipe_id: "recipe-123",
  shared_by_user_id: "user-123",
  shared_by_name: "John Doe",
  shared_by_household_name: "The Doe Family",
  title: "Classic Pasta Carbonara",
  description: "A traditional Italian pasta dish with eggs, cheese, pancetta, and pepper.",
  ingredients: [
    "400g spaghetti",
    "200g pancetta or guanciale",
    "4 large eggs",
    "100g pecorino romano cheese",
    "Black pepper",
    "Salt"
  ],
  instructions: [
    "Bring a large pot of salted water to boil and cook spaghetti until al dente.",
    "In a large pan, cook pancetta until crispy.",
    "In a bowl, whisk together eggs and grated cheese.",
    "Drain pasta, reserving some pasta water.",
    "Quickly toss hot pasta with pancetta, then remove from heat.",
    "Add egg mixture, tossing quickly to create a creamy sauce.",
    "Add pasta water if needed to loosen the sauce.",
    "Season with black pepper and serve immediately."
  ],
  prep_time: 10,
  cook_time: 15,
  servings: 4,
  image: "https://example.com/carbonara.jpg",
  expires_at: "2025-06-01T00:00:00Z",
  created_at: "2025-01-01T00:00:00Z",
  meal_type: "dinner",
  original_household_id: "household-123",
  view_count: 127
};

export default function PublicRecipe() {
  const { shareId } = useParams<{ shareId: string }>();
  
  useDocumentTitle(`${mockRecipe.title} | RealiMeali`);

  return <PublicRecipeView recipe={mockRecipe} />;
}
