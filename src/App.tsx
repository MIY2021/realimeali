import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import RecipesPage from "@/pages/RecipesPage";
import RecipeDetail from "@/pages/RecipeDetail";
import NewRecipe from "@/pages/NewRecipe";
import EditRecipe from "@/pages/EditRecipe";
import FindRecipes from "@/pages/FindRecipes";
import MealPlanner from "@/pages/MealPlanner";
import ShoppingList from "@/pages/ShoppingList";
import Admin from "@/pages/Admin";
import Household from "@/pages/Household";
import { AuthProvider } from "@/contexts/AuthContext";
import { HouseholdProvider } from "@/contexts/HouseholdContext";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import { MealPlanApprovalProvider } from "@/contexts/MealPlanApprovalContext";
import { HouseholdShoppingProvider } from "@/contexts/HouseholdShoppingContext";
import { Toaster } from "@/components/ui/toaster";

import { RealiChefProvider } from "@/contexts/RealiChefContext";
import { RealiChef } from "@/components/realichef/RealiChef";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HouseholdProvider>
          <MealPlanProvider>
            <RecipesProvider>
              <MealPlanApprovalProvider>
                <HouseholdShoppingProvider>
                  <RealiChefProvider>
                    <BrowserRouter>
                      <div className="App">
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/household" element={<Household />} />
                            <Route path="/my-recipes" element={<RecipesPage />} />
                            <Route path="/my-recipes/new" element={<NewRecipe />} />
                            <Route path="/my-recipes/:slug" element={<RecipeDetail />} />
                            <Route path="/my-recipes/:id/edit" element={<EditRecipe />} />
                            <Route path="/find-recipes" element={<FindRecipes />} />
                            <Route path="/meal-planner" element={<MealPlanner />} />
                            <Route path="/shopping-list" element={<ShoppingList />} />
                            <Route path="/admin" element={<Admin />} />
                          </Routes>
                        </Layout>
                        <RealiChef />
                        <Toaster />
                      </div>
                    </BrowserRouter>
                  </RealiChefProvider>
                </HouseholdShoppingProvider>
              </MealPlanApprovalProvider>
            </RecipesProvider>
          </MealPlanProvider>
        </HouseholdProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
