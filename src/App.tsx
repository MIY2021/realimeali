
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import RecipesPage from "@/pages/RecipesPage";
import CategoryPage from "@/pages/CategoryPage";
import RecipeDetail from "@/pages/RecipeDetail";
import MealPlanner from "@/pages/MealPlanner";
import ShoppingList from "@/pages/ShoppingList";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RecipesProvider>
          <MealPlanProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/recipes" element={<RecipesPage />} />
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
                  <Route path="/category/:category" element={<CategoryPage />} />
                  <Route path="/meal-planner" element={<MealPlanner />} />
                  <Route path="/shopping-list" element={<ShoppingList />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </Router>
            <Toaster />
          </MealPlanProvider>
        </RecipesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
