import React, { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { HouseholdProvider } from "@/contexts/HouseholdContext";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import { MealPlanApprovalProvider } from "@/contexts/MealPlanApprovalContext";
import { HouseholdShoppingProvider } from "@/contexts/HouseholdShoppingContext";
import { RealiChefProvider } from "@/contexts/RealiChefContext";
import { useParallelDataLoader } from "@/hooks/useParallelDataLoader";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AchievementListener } from "@/components/achievements/AchievementListener";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Eager load: Home page (most visited)
import Index from "@/pages/Index";

// Lazy load: All other pages (code splitting)
const Login = lazy(() => import("@/pages/Login"));
const Settings = lazy(() => import("@/pages/Settings"));
const RecipesPage = lazy(() => import("@/pages/RecipesPage"));
const CreateRecipePage = lazy(() => import("@/pages/CreateRecipePage"));
const EditRecipePage = lazy(() => import("@/pages/EditRecipePage"));
const RecipeDetail = lazy(() => import("@/pages/RecipeDetail"));
const MealPlanner = lazy(() => import("@/pages/MealPlanner"));
const ShoppingList = lazy(() => import("@/pages/ShoppingList"));
const DiscoverRecipesPage = lazy(() => import("@/pages/DiscoverRecipesPage"));
const ImportedRecipeDetailPage = lazy(() => import("@/pages/ImportedRecipeDetailPage"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AchievementsPage = lazy(() => import("@/pages/AchievementsPage"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const Contact = lazy(() => import("@/pages/Contact"));
const About = lazy(() => import("@/pages/About"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function AppContent() {
  // Coordinate parallel loading of recipes and meal plans
  useParallelDataLoader();
  return (
    <div className="App">
      <AchievementListener />
      <Layout>
        <Suspense fallback={
          <div className="min-h-screen flex flex-col">
            <div className="h-16" />
            <div className="flex-1 container max-w-7xl py-6 px-4">
              <div className="h-8 w-48 mb-6 bg-muted animate-pulse rounded" />
              <div className="space-y-4">
                <div className="h-12 w-full bg-muted animate-pulse rounded" />
                <div className="h-64 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-16 md:h-0" />
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/my-recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
            <Route path="/my-recipes/new" element={<ProtectedRoute><CreateRecipePage /></ProtectedRoute>} />
            <Route path="/create-recipe" element={<ProtectedRoute><CreateRecipePage /></ProtectedRoute>} />
            <Route path="/my-recipes/:slug/edit" element={<ProtectedRoute><EditRecipePage /></ProtectedRoute>} />
            <Route path="/my-recipes/:slug" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
            <Route path="/discover-recipes" element={<ProtectedRoute><DiscoverRecipesPage /></ProtectedRoute>} />
            <Route path="/discover-recipes/:id" element={<ProtectedRoute><ImportedRecipeDetailPage /></ProtectedRoute>} />
            <Route path="/meal-planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
            <Route path="/shopping-list" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Layout>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <HouseholdProvider>
              <RecipesProvider>
                <MealPlanProvider>
                  <MealPlanApprovalProvider>
                    <HouseholdShoppingProvider>
                      <RealiChefProvider>
                        <AppContent />
                      </RealiChefProvider>
                    </HouseholdShoppingProvider>
                  </MealPlanApprovalProvider>
                </MealPlanProvider>
              </RecipesProvider>
            </HouseholdProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
