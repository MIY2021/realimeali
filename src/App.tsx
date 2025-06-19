
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Settings from "@/pages/Settings";
import RecipesPage from "@/pages/RecipesPage";
import RecipeDetail from "@/pages/RecipeDetail";
import MealPlanner from "@/pages/MealPlanner";
import ShoppingList from "@/pages/ShoppingList";
import { AuthProvider } from "@/contexts/AuthContext";
import { HouseholdProvider } from "@/contexts/HouseholdContext";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import { MealPlanApprovalProvider } from "@/contexts/MealPlanApprovalContext";
import { HouseholdShoppingProvider } from "@/contexts/HouseholdShoppingContext";
import { Toaster } from "@/components/ui/toaster";

import { RealiChefProvider } from "@/contexts/RealiChefContext";
import { RealiChef } from "@/components/realichef/RealiChef";
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-recipes" element={<RecipesPage />} />
          <Route path="/my-recipes/:slug" element={<RecipeDetail />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Routes>
      </Layout>
      {user && <RealiChef />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <HouseholdProvider>
            <MealPlanProvider>
              <RecipesProvider>
                <MealPlanApprovalProvider>
                  <HouseholdShoppingProvider>
                    <RealiChefProvider>
                      <AppContent />
                    </RealiChefProvider>
                  </HouseholdShoppingProvider>
                </MealPlanApprovalProvider>
              </RecipesProvider>
            </MealPlanProvider>
          </HouseholdProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
