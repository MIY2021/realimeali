
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HouseholdProvider } from "@/contexts/HouseholdContext";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import { HouseholdShoppingProvider } from "@/contexts/HouseholdShoppingContext";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import RecipesPage from "@/pages/RecipesPage";
import RecipeDetail from "@/pages/RecipeDetail";
import MealPlanner from "@/pages/MealPlanner";
import ShoppingList from "@/pages/ShoppingList";
import CategoryPage from "@/pages/CategoryPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Account from "@/pages/Account";
import Household from "@/pages/Household";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <HouseholdProvider>
          <RecipesProvider>
            <MealPlanProvider>
              <HouseholdShoppingProvider>
                <TooltipProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route
                        path="/recipes"
                        element={
                          <ProtectedRoute>
                            <RecipesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/recipes/:id"
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                  <Toaster />
                  <Sonner />
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
