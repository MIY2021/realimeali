import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HouseholdProvider } from "@/contexts/HouseholdContext";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import { HouseholdShoppingProvider } from "@/contexts/HouseholdShoppingContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Feedback from "@/pages/Feedback";
import RecipesPage from "@/pages/RecipesPage";
import FindRecipesPage from "@/pages/FindRecipesPage";
import CreateRecipePage from "@/pages/CreateRecipePage";
import RecipeDetail from "@/pages/RecipeDetail";
import PublicRecipe from "@/pages/PublicRecipe";
import MealPlanner from "@/pages/MealPlanner";
import ShoppingList from "@/pages/ShoppingList";
import CategoryPage from "@/pages/CategoryPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Settings from "@/pages/Settings";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <HouseholdProvider>
          <RecipesProvider>
            <MealPlanProvider>
              <HouseholdShoppingProvider>
                <TooltipProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/share/:slug" element={<PublicRecipe />} />
                      <Route path="/recipe/:slug/share" element={<PublicRecipe />} />
                      <Route path="/recipe/:slug" element={<PublicRecipe />} />
                      <Route path="/share/recipes/:publicShareId" element={<PublicRecipe />} />
                      <Route path="/recipe-meta/:publicShareId" element={<PublicRecipe />} />
                      <Route
                        path="/my-recipes"
                        element={
                          <ProtectedRoute>
                            <RecipesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/find-recipes"
                        element={
                          <ProtectedRoute>
                            <FindRecipesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-recipes/new"
                        element={
                          <ProtectedRoute>
                            <CreateRecipePage />
                          </ProtectedRoute>
                        }
                      />
                      {/* New slug-only route for recipes */}
                      <Route
                        path="/my-recipes/:slug"
                        element={
                          <ProtectedRoute>
                            <RecipeDetail />
                          </ProtectedRoute>
                        }
                      />
                      {/* Legacy route with ID for backward compatibility */}
                      <Route
                        path="/my-recipes/:id/:slug"
                        element={
                          <ProtectedRoute>
                            <RecipeDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/meal-planner"
                        element={
                          <ProtectedRoute>
                            <MealPlanner />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/shopping-list"
                        element={
                          <ProtectedRoute>
                            <ShoppingList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/category/:category"
                        element={
                          <ProtectedRoute>
                            <CategoryPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />
                      {/* Redirect old routes to new settings page */}
                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/household"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                  <Toaster />
                </TooltipProvider>
              </HouseholdShoppingProvider>
            </MealPlanProvider>
          </RecipesProvider>
        </HouseholdProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
