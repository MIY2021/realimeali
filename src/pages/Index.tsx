
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UtensilsCrossed, 
  CalendarDays, 
  ListChecks,
  Search,
  Users,
  Brain,
  Clock,
  Trash2,
  FolderOpen,
  UserCheck
} from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LoginPromptDialog } from "@/components/auth/LoginPromptDialog";
import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  useDocumentTitle("RealiMeali | All-in-one meal planning");
  const { showPrompt, promptTrigger, triggerPromptOnFeatureClick, closePrompt } = useLoginPrompt();
  const { user } = useAuth();

  const handleFeatureClick = (e: React.MouseEvent, path: string) => {
    if (!user) {
      e.preventDefault();
      const promptShown = triggerPromptOnFeatureClick();
      if (!promptShown) {
        window.location.href = path;
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[85vh]">
      {/* Enhanced Hero Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-cream -mt-16 pt-24 md:pt-28 lg:pt-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-navy sm:text-4xl md:text-5xl lg:text-6xl">
              Welcome to RealiMeali
            </h1>
            <p className="mx-auto max-w-[800px] text-lg md:text-xl text-muted-foreground">
              Transform meal planning from a chore into an enjoyable experience. Save time, reduce food waste, and simplify your cooking life with our comprehensive meal planning solution.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-sage font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Save Hours Weekly
              </span>
              <span className="flex items-center gap-1">
                <Trash2 className="w-4 h-4" />
                Reduce Food Waste
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Household Collaboration
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About RealiMeali Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-navy">
              Your Complete Meal Planning Ecosystem
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RealiMeali is more than just a recipe app—it's a comprehensive meal planning and recipe management system designed to solve the everyday challenges of cooking for yourself and your family. From recipe chaos to shopping list confusion, we've got you covered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto">
                  <FolderOpen className="w-6 h-6 text-terracotta" />
                </div>
                <h3 className="font-semibold text-navy">Organize Everything</h3>
                <p className="text-sm text-muted-foreground">Keep all your recipes, meal plans, and shopping lists in one organized place</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 text-sage" />
                </div>
                <h3 className="font-semibold text-navy">Smart Planning</h3>
                <p className="text-sm text-muted-foreground">AI-powered features help you plan smarter and cook more efficiently</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-semibold text-navy">Family Friendly</h3>
                <p className="text-sm text-muted-foreground">Collaborate with household members and streamline family meal planning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
              Everything You Need for Effortless Meal Planning
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four powerful tools working together to revolutionize how you plan, shop, and cook meals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="rounded-full bg-terracotta/10 p-4 w-16 h-16 mx-auto mb-4">
                  <UtensilsCrossed className="h-8 w-8 text-terracotta" />
                </div>
                <CardTitle className="text-xl text-navy">My Recipes</CardTitle>
                <CardDescription className="text-center">
                  Your personal recipe collection with intelligent organization and easy import from any website, text, or photo
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                  <li>• Import from any recipe website</li>
                  <li>• AI-powered text and image parsing</li>
                  <li>• Smart categorization and tagging</li>
                  <li>• Favorite and rating system</li>
                </ul>
                {user ? (
                  <Button className="w-full" asChild>
                    <Link to="/my-recipes">View My Recipes</Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={(e) => handleFeatureClick(e, "/my-recipes")}
                  >
                    View My Recipes
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="rounded-full bg-sage/10 p-4 w-16 h-16 mx-auto mb-4">
                  <Search className="h-8 w-8 text-sage" />
                </div>
                <CardTitle className="text-xl text-navy">Find Recipes</CardTitle>
                <CardDescription className="text-center">
                  Discover thousands of community-shared recipes and external recipe databases with advanced filtering
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                  <li>• Community recipe sharing</li>
                  <li>• Integration with MealDB & Spoonacular</li>
                  <li>• Advanced search and filters</li>
                  <li>• Dietary restriction support</li>
                </ul>
                {user ? (
                  <Button className="w-full" asChild>
                    <Link to="/find-recipes">Discover Recipes</Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={(e) => handleFeatureClick(e, "/find-recipes")}
                  >
                    Discover Recipes
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="rounded-full bg-sage/10 p-4 w-16 h-16 mx-auto mb-4">
                  <CalendarDays className="h-8 w-8 text-sage" />
                </div>
                <CardTitle className="text-xl text-navy">Meal Planner</CardTitle>
                <CardDescription className="text-center">
                  Visual drag-and-drop meal planning with household collaboration and approval workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                  <li>• Intuitive drag-and-drop interface</li>
                  <li>• Weekly and monthly planning views</li>
                  <li>• Household member collaboration</li>
                  <li>• Meal approval system</li>
                </ul>
                {user ? (
                  <Button className="w-full" asChild>
                    <Link to="/meal-planner">Go to Planner</Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={(e) => handleFeatureClick(e, "/meal-planner")}
                  >
                    Go to Planner
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="rounded-full bg-navy/10 p-4 w-16 h-16 mx-auto mb-4">
                  <ListChecks className="h-8 w-8 text-navy" />
                </div>
                <CardTitle className="text-xl text-navy">Shopping List</CardTitle>
                <CardDescription className="text-center">
                  Automatically generated shopping lists with intelligent ingredient consolidation and household sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                  <li>• Auto-generate from meal plans</li>
                  <li>• Smart ingredient consolidation</li>
                  <li>• Categorized by store sections</li>
                  <li>• Real-time household sync</li>
                </ul>
                {user ? (
                  <Button className="w-full" asChild>
                    <Link to="/shopping-list">View Shopping List</Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={(e) => handleFeatureClick(e, "/shopping-list")}
                  >
                    View Shopping List
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
              Advanced Features for Modern Households
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-terracotta/10 p-3">
                    <Users className="h-6 w-6 text-terracotta" />
                  </div>
                  <CardTitle className="text-xl text-navy">Household Management</CardTitle>
                </div>
                <CardDescription>
                  Create and manage households with multiple members, share meal plans, and collaborate on shopping lists. Perfect for families, roommates, or anyone sharing meal responsibilities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-sage/10 p-3">
                    <Brain className="h-6 w-6 text-sage" />
                  </div>
                  <CardTitle className="text-xl text-navy">AI-Powered Features</CardTitle>
                </div>
                <CardDescription>
                  Leverage artificial intelligence for recipe parsing from text and images, automatic ingredient categorization, and smart meal suggestions based on your preferences and dietary needs.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8 md:py-12 bg-cream">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
              Transform Your Cooking Experience
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how RealiMeali can revolutionize your kitchen workflow and make meal planning a joy rather than a chore
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-terracotta" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Save Time</h3>
              <p className="text-sm text-muted-foreground">
                Reduce meal planning time from hours to minutes with smart automation and intuitive workflows
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-sage" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Reduce Waste</h3>
              <p className="text-sm text-muted-foreground">
                Smart ingredient consolidation and leftover tracking help minimize food waste and save money
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto">
                <FolderOpen className="w-8 h-8 text-navy" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Better Organization</h3>
              <p className="text-sm text-muted-foreground">
                Keep all your recipes, plans, and lists organized and accessible from anywhere, anytime
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-butter/50 rounded-full flex items-center justify-center mx-auto">
                <UserCheck className="w-8 h-8 text-navy" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Enhanced Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Share meal planning responsibilities with household members and coordinate cooking efforts
              </p>
            </div>
          </div>
        </div>
      </section>

      <LoginPromptDialog 
        isOpen={showPrompt}
        onClose={closePrompt}
        trigger={promptTrigger}
      />
    </div>
  );
}
