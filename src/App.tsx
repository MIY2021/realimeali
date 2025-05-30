
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HouseholdProvider } from "@/contexts/HouseholdContext";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import { HouseholdShoppingProvider } from "@/contexts/HouseholdShoppingContext";
import Layout from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import Index from "@/pages/Index";
import About from "@/pages/About";
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
import Account from "@/pages/Account";
import Household from "@/pages/Household";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
                      <Route
                        path="/my-recipes/:slug"
                        element={
                          <ProtectedRoute>
                            <RecipeDetail />
                          </ProtectedRoute>
                        }
                      />
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
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <Account />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/household"
                        element={
                          <ProtectedRoute>
                            <Household />
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
                  <Sonner 
                    visibleToasts={1}
                    position="bottom-right"
                    duration={4000}
                    closeButton
                  />
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
