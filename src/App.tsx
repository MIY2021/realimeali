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
import { ThemeProvider } from "next-themes";

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
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-recipes" element={<RecipesPage />} />
            <Route path="/my-recipes/new" element={<CreateRecipePage />} />
            <Route path="/create-recipe" element={<CreateRecipePage />} />
            <Route path="/my-recipes/:slug/edit" element={<EditRecipePage />} />
            <Route path="/my-recipes/:slug" element={<RecipeDetail />} />
            <Route path="/discover-recipes" element={<DiscoverRecipesPage />} />
            <Route path="/discover-recipes/:id" element={<ImportedRecipeDetailPage />} />
            <Route path="/meal-planner" element={<MealPlanner />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
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
      <ThemeProvider 
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        themes={['light', 'dark', 'black']}
        storageKey="realimeali-theme"
        disableTransitionOnChange={false}
      >
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
