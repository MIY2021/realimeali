
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UtensilsCrossed, Search, CalendarDays, ListChecks, Users, Brain, Share2 } from "lucide-react";

export default function About() {
  useDocumentTitle("About RealiMeali");

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">
            RealiMeali: Your Complete Meal Planning Companion
          </h1>
          <p className="text-lg text-muted-foreground">
            RealiMeali is a comprehensive, all-in-one meal planning and recipe management system designed to simplify cooking and make meal preparation stress-free for households of all sizes.
          </p>
        </div>

        {/* What is RealiMeali */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy mb-4">What is RealiMeali?</h2>
          <p className="text-muted-foreground leading-relaxed">
            RealiMeali is a web-based application that brings together recipe management, meal planning, and grocery shopping into one seamless platform. Built for both individual users and households, it eliminates the daily "what's for dinner?" struggle by providing intelligent tools to plan, organize, and execute your meals efficiently.
          </p>
        </section>

        {/* Core Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy mb-6">Core Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-terracotta/10 p-3 mr-4">
                  <UtensilsCrossed className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="text-xl font-bold text-navy">🍳 My Recipes</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Personal Recipe Collection: Store and organize your favorite recipes in one centralized location</li>
                <li>• Multiple Import Methods: Add recipes by importing from websites, taking photos, copying text, manual entry, or AI generation</li>
                <li>• Smart Organization: Categorize recipes by cuisine, difficulty, dietary restrictions, and custom tags</li>
                <li>• Visual Management: Upload or generate AI-created recipe images</li>
                <li>• Detailed Information: Track prep time, cook time, servings, ingredients, and step-by-step instructions</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-sage/10 p-3 mr-4">
                  <Search className="h-6 w-6 text-sage" />
                </div>
                <h3 className="text-xl font-bold text-navy">🔍 Find Recipes</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Community Recipe Sharing: Discover recipes shared by other RealiMeali users</li>
                <li>• Curated Collection: Access moderated, high-quality recipes from the community</li>
                <li>• Save to Collection: Easily add discovered recipes to your personal collection</li>
                <li>• Search and Filter: Find recipes by cuisine, category, cooking time, and dietary preferences</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-sage/10 p-3 mr-4">
                  <CalendarDays className="h-6 w-6 text-sage" />
                </div>
                <h3 className="text-xl font-bold text-navy">📅 Meal Planner</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Weekly Planning: Visual calendar interface for planning meals up to 2 weeks in advance</li>
                <li>• Drag & Drop Simplicity: Easily move recipes between days and meal types</li>
                <li>• Leftover Management: Track and plan leftover portions to reduce food waste</li>
                <li>• Household Collaboration: Share meal plans with family members</li>
                <li>• Flexible Scheduling: Plan for breakfast, lunch, dinner, and snacks</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-navy/10 p-3 mr-4">
                  <ListChecks className="h-6 w-6 text-navy" />
                </div>
                <h3 className="text-xl font-bold text-navy">🛒 Shopping List</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Automatic Generation: Create shopping lists directly from your meal plans</li>
                <li>• Smart Consolidation: Automatically combines similar ingredients</li>
                <li>• Category Organization: Ingredients grouped by store sections for efficient shopping</li>
                <li>• Interactive Checking: Mark items as purchased with a simple tap</li>
                <li>• Week-by-Week Lists: Generate lists for specific weeks</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Advanced Capabilities */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy mb-6">Advanced Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-terracotta/10 p-3 mr-4">
                  <Users className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="text-lg font-bold text-navy">🏠 Household Management</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multi-User Support</li>
                <li>• Shared Recipe Collections</li>
                <li>• Collaborative Planning</li>
                <li>• Approval Workflows</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-sage/10 p-3 mr-4">
                  <Brain className="h-6 w-6 text-sage" />
                </div>
                <h3 className="text-lg font-bold text-navy">🤖 AI-Powered Features</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Recipe Generation</li>
                <li>• Image Recognition</li>
                <li>• Smart Parsing</li>
                <li>• Image Generation</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-navy/10 p-3 mr-4">
                  <Share2 className="h-6 w-6 text-navy" />
                </div>
                <h3 className="text-lg font-bold text-navy">🔗 Integration & Sharing</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Website Integration</li>
                <li>• Community Contributions</li>
                <li>• Public Recipe Sharing</li>
                <li>• Cross-Platform Access</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Who Is RealiMeali For */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy mb-6">Who Is RealiMeali For?</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="mb-2"><strong>Busy Families:</strong> Streamline meal planning and reduce the stress of daily cooking decisions</p>
                <p className="mb-2"><strong>Meal Prep Enthusiasts:</strong> Organize bulk cooking sessions and track portions</p>
                <p className="mb-2"><strong>Recipe Collectors:</strong> Digitize and organize physical recipe collections</p>
                <p className="mb-2"><strong>Cooking Beginners:</strong> Access guided recipes with clear instructions and timing</p>
              </div>
              <div>
                <p className="mb-2"><strong>Health-Conscious Cooks:</strong> Plan balanced meals and track dietary preferences</p>
                <p className="mb-2"><strong>Roommates & Couples:</strong> Collaborate on meal planning and share cooking responsibilities</p>
                <p className="mb-2"><strong>Anyone Who Cooks:</strong> From occasional cooks to culinary enthusiasts</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy mb-6">Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-bold text-terracotta mb-3">Save Time</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• No more daily "what's for dinner?" decisions</li>
                <li>• Streamlined grocery shopping</li>
                <li>• Quick recipe imports</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-bold text-sage mb-3">Reduce Food Waste</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Plan exact portions</li>
                <li>• Use ingredients efficiently</li>
                <li>• Smart inventory awareness</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-bold text-navy mb-3">Improve Organization</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Central hub for cooking</li>
                <li>• Visual meal planning</li>
                <li>• Searchable recipe database</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-bold text-terracotta mb-3">Enhance Collaboration</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Share responsibilities</li>
                <li>• Get input and approval</li>
                <li>• Build shared collections</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-muted-foreground leading-relaxed">
            RealiMeali transforms the often stressful task of meal planning into an organized, collaborative, and enjoyable experience, making home cooking more accessible and efficient for everyone.
          </p>
        </section>
      </div>
    </div>
  );
}
