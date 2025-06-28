
import { Recipe, Household } from '@/types';

export interface PageMetaData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  keywords?: string;
}

export class MetaTagUtils {
  private static readonly BASE_URL = 'https://realimeali.com';
  private static readonly DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center';

  static generateRecipeMetaTags(recipe: Recipe, isPublic = false): PageMetaData {
    const recipeTitle = `${recipe.title} | RealiMeali`;
    const cookTime = recipe.cook_time > 0 ? `Cook: ${recipe.cook_time}min` : '';
    const prepTime = recipe.prep_time > 0 ? `Prep: ${recipe.prep_time}min` : '';
    const servings = `Serves: ${recipe.servings}`;
    const ingredientsCount = recipe.ingredients?.length || 0;
    
    const timeInfo = [prepTime, cookTime, servings].filter(Boolean).join(', ');
    const ingredientsInfo = ingredientsCount > 0 ? `${ingredientsCount} ingredients` : '';
    
    let description = recipe.description || `A delicious ${recipe.meal_type || 'recipe'} recipe`;
    if (timeInfo || ingredientsInfo) {
      const details = [timeInfo, ingredientsInfo].filter(Boolean).join(' | ');
      description = `${description}. ${details}`;
    }

    // Limit description for social media
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    const keywords = [
      'recipe', 'cooking', 'food',
      recipe.meal_type,
      recipe.cuisine_region,
      ...(recipe.diet_lifestyle || [])
    ].filter(Boolean).join(', ');

    return {
      title: recipeTitle,
      description,
      image: recipe.image || this.DEFAULT_IMAGE,
      type: 'article',
      keywords,
      url: isPublic ? undefined : `${this.BASE_URL}/my-recipes/${recipe.slug || recipe.id}`
    };
  }

  static generateHomeMetaTags(): PageMetaData {
    return {
      title: 'RealiMeali | All-in-one meal planning',
      description: 'Your all-in-one meal planning and recipe management system. Plan meals, manage recipes, and generate shopping lists effortlessly.',
      image: this.DEFAULT_IMAGE,
      type: 'website',
      keywords: 'meal planning, recipe management, shopping list, cooking, food, kitchen, meal prep',
      url: this.BASE_URL
    };
  }

  static generateMyRecipesMetaTags(recipeCount: number, household?: Household): PageMetaData {
    const householdText = household ? ` for ${household.name}` : '';
    const description = recipeCount > 0 
      ? `Browse and manage your collection of ${recipeCount} recipes${householdText}. Create, edit, and organize your favorite dishes.`
      : `Start building your recipe collection${householdText}. Add your favorite recipes and organize them for easy meal planning.`;

    return {
      title: `My Recipes${householdText} | RealiMeali`,
      description,
      type: 'website',
      keywords: 'my recipes, recipe collection, cooking, meal planning',
      url: `${this.BASE_URL}/my-recipes`
    };
  }

  static generateMealPlannerMetaTags(household?: Household): PageMetaData {
    const householdText = household ? ` for ${household.name}` : '';
    return {
      title: `Meal Planner${householdText} | RealiMeali`,
      description: `Plan your weekly meals with ease${householdText}. Organize breakfast, lunch, and dinner for the entire week and never wonder what's for dinner again.`,
      type: 'website',
      keywords: 'meal planning, weekly meals, meal prep, dinner planning',
      url: `${this.BASE_URL}/meal-planner`
    };
  }

  static generateShoppingListMetaTags(itemCount: number, household?: Household): PageMetaData {
    const householdText = household ? ` for ${household.name}` : '';
    const description = itemCount > 0 
      ? `Manage your shopping list with ${itemCount} items${householdText}. Generated from your meal plans for efficient grocery shopping.`
      : `Create and manage your shopping lists${householdText}. Generate lists automatically from your meal plans or create custom lists.`;

    return {
      title: `Shopping List${householdText} | RealiMeali`,
      description,
      type: 'website',
      keywords: 'shopping list, grocery list, meal planning, shopping',
      url: `${this.BASE_URL}/shopping-list`
    };
  }

  static generateFindRecipesMetaTags(): PageMetaData {
    return {
      title: 'Find Recipes | RealiMeali',
      description: 'Discover thousands of recipes from our community. Find new dishes to try, explore different cuisines, and expand your cooking repertoire.',
      type: 'website',
      keywords: 'find recipes, discover recipes, recipe search, cooking inspiration',
      url: `${this.BASE_URL}/find-recipes`
    };
  }

  static generatePublicRecipeMetaTags(recipe: any): PageMetaData {
    const title = `${recipe.title} Recipe | RealiMeali`;
    const sharedByText = recipe.shared_by_name ? ` shared by ${recipe.shared_by_name}` : '';
    
    let description = recipe.description || `A delicious recipe${sharedByText}`;
    if (Array.isArray(description)) {
      description = description.join(' ');
    }
    
    const recipeInfo = `Prep: ${recipe.prep_time}min, Cook: ${recipe.cook_time}min, Serves: ${recipe.servings}`;
    description = `${description}. ${recipeInfo}`;
    
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    return {
      title,
      description,
      image: recipe.image || this.DEFAULT_IMAGE,
      type: 'article',
      author: recipe.shared_by_name,
      keywords: 'recipe, cooking, food, shared recipe',
      url: `${this.BASE_URL}/share/${recipe.slug || recipe.public_share_id}`
    };
  }

  static generateStaticPageMetaTags(pageName: string, customDescription?: string): PageMetaData {
    const titles: { [key: string]: string } = {
      about: 'About RealiMeali | All-in-one meal planning',
      contact: 'Contact Us | RealiMeali',
      'privacy-policy': 'Privacy Policy | RealiMeali',
      'terms-of-service': 'Terms of Service | RealiMeali',
      feedback: 'Feedback | RealiMeali',
      settings: 'Settings | RealiMeali'
    };

    const descriptions: { [key: string]: string } = {
      about: 'Learn about RealiMeali, the all-in-one meal planning and recipe management system designed to make cooking easier and more enjoyable.',
      contact: 'Get in touch with the RealiMeali team. We\'d love to hear your feedback, questions, or suggestions.',
      'privacy-policy': 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
      'terms-of-service': 'Review our terms of service to understand the rules and guidelines for using RealiMeali.',
      feedback: 'Share your feedback and help us improve RealiMeali. Your suggestions help us make the app better for everyone.',
      settings: 'Manage your RealiMeali account settings, preferences, and household configuration.'
    };

    return {
      title: titles[pageName] || `${pageName} | RealiMeali`,
      description: customDescription || descriptions[pageName] || 'RealiMeali - Your all-in-one meal planning and recipe management system.',
      type: 'website',
      url: `${this.BASE_URL}/${pageName}`
    };
  }
}
