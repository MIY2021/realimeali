import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { HouseholdProvider } from './contexts/HouseholdContext';
import { RecipesProvider } from './contexts/RecipesContext';
import { MealPlanProvider } from './contexts/MealPlanContext';
import { MealPlanApprovalProvider } from './contexts/MealPlanApprovalContext';
import { HouseholdShoppingProvider } from './contexts/HouseholdShoppingContext';
import Layout from './components/layout/Layout';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MealPlanner from './pages/MealPlanner';
import RecipesPage from './pages/RecipesPage';
import CreateRecipePage from './pages/CreateRecipePage';
import RecipeDetail from './pages/RecipeDetail';
import FindRecipesPage from './pages/FindRecipesPage';
import ShoppingList from './pages/ShoppingList';
import Settings from './pages/Settings';
import About from './pages/About';
import Feedback from './pages/Feedback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import PublicRecipe from './pages/PublicRecipe';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Contact from "@/pages/Contact";

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <HouseholdProvider>
          <RecipesProvider>
            <MealPlanProvider>
              <MealPlanApprovalProvider>
                <HouseholdShoppingProvider>
                  <BrowserRouter>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/meal-planner" element={<MealPlanner />} />
                        <Route path="/my-recipes" element={<RecipesPage />} />
                        <Route path="/my-recipes/new" element={<CreateRecipePage />} />
                        <Route path="/my-recipes/:id" element={<RecipeDetail />} />
                        <Route path="/find-recipes" element={<FindRecipesPage />} />
                        <Route path="/shopping-list" element={<ShoppingList />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/feedback" element={<Feedback />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/recipes/shared/:shareId" element={<PublicRecipe />} />
                        <Route path="/admin" element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </BrowserRouter>
                </HouseholdShoppingProvider>
              </MealPlanApprovalProvider>
            </MealPlanProvider>
          </RecipesProvider>
        </HouseholdProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
