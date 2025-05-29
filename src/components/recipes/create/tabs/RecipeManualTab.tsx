import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RecipeFormData } from "@/hooks/useRecipeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { RecipeComplexityLevel, RecipeCuisine, RecipeDietLifestyle, RecipeMealType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { slugify } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  instructions: z.string().optional(),
  mealType: z.string().optional(),
  cuisine: z.string().optional(),
  dietLifestyle: z.array(z.string()).optional(),
  complexityLevel: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),
  image: z.string().optional(),
});

interface RecipeManualTabProps {
  setNewRecipe: (recipe: RecipeFormData) => void;
}

export const RecipeManualTab: React.FC<RecipeManualTabProps> = ({ setNewRecipe }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { createRecipe } = useRecipes();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: "",
      instructions: "",
      mealType: "",
      cuisine: "",
      dietLifestyle: [],
      complexityLevel: "",
      prepTime: "",
      cookTime: "",
      servings: "",
      image: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !currentHousehold) {
      toast({
        title: "You must be logged in to create a recipe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newSlug = slugify(values.title);
      const recipeData = {
        ...values,
        ingredients: values.ingredients?.split("\n") || [],
        instructions: values.instructions?.split("\n") || [],
        prepTime: parseInt(values.prepTime || "0"),
        cookTime: parseInt(values.cookTime || "0"),
        servings: parseInt(values.servings || "1"),
        mealType: values.mealType as RecipeMealType | undefined,
        cuisine: values.cuisine as RecipeCuisine | undefined,
        complexityLevel: values.complexityLevel as RecipeComplexityLevel | undefined,
        dietLifestyle: values.dietLifestyle as RecipeDietLifestyle[] | undefined,
        slug: newSlug
      };

      await createRecipe(recipeData);

      toast({
        title: "Success!",
        description: "Recipe created.",
      });
      navigate('/my-recipes');
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Recipe Title" {...field} />
                </FormControl>
                <FormDescription>
                  What is your recipe called?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A short description of the recipe"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Give people a hint of what this recipe is all about!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="prepTime"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Prep Time (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="15" {...field} />
                  </FormControl>
                  <FormDescription>
                    How long does it take to prepare?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cookTime"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Cook Time (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="20" {...field} />
                  </FormControl>
                  <FormDescription>
                    How long does it take to cook?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Servings</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="4" {...field} />
                  </FormControl>
                  <FormDescription>
                    How many servings does this recipe make?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to an image of your recipe.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="ingredients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ingredients</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List ingredients, one per line"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  List all ingredients, one per line.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write instructions, one per line"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Write all instructions, one per line.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Meal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snacks">Snacks</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    What type of meal is this?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cuisine"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Cuisine</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cuisine" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    What cuisine is this recipe?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="dietLifestyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diet & Lifestyle</FormLabel>
                <MultiSelect
                  options={[
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "vegan", label: "Vegan" },
                    { value: "gluten_free", label: "Gluten-Free" },
                    { value: "dairy_free", label: "Dairy-Free" },
                    { value: "high_protein", label: "High Protein" },
                    { value: "kid_friendly", label: "Kid Friendly" },
                    { value: "pescatarian", label: "Pescatarian" },
                    { value: "low_carb_keto", label: "Low Carb/Keto" },
                    { value: "paleo", label: "Paleo" },
                    { value: "diabetic_friendly", label: "Diabetic Friendly" },
                    { value: "budget_meals", label: "Budget Meals" },
                    { value: "pregnancy_safe", label: "Pregnancy Safe" },
                  ]}
                  onChange={field.onChange}
                  value={field.value}
                />
                <FormDescription>
                  Select any dietary or lifestyle considerations.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complexityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complexity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a complexity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="difficult">Difficult</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How difficult is this recipe to make?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <Button
          type="submit"
          className="w-full bg-terracotta hover:bg-terracotta/90"
          disabled={isLoading}
        >
          {isLoading ? "Creating Recipe..." : "Create Recipe"}
        </Button>
      </form>
    </div>
  );
};
