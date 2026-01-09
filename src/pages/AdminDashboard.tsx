
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAdminCheck } from "@/hooks/useAdminCheck";

import { AdminStats } from "@/components/admin/AdminStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { FeedbackModerationPanel } from "@/components/admin/FeedbackModerationPanel";
import { RecipeExportPanel } from "@/components/admin/RecipeExportPanel";
import { RecipeImportPanel } from "@/components/admin/RecipeImportPanel";
import { ImportedRecipeManagementPanel } from "@/components/admin/ImportedRecipeManagementPanel";
import { ImagePromptSettingsPanel } from "@/components/admin/ImagePromptSettingsPanel";
import { ThumbnailGenerationPanel } from "@/components/admin/ThumbnailGenerationPanel";
import { IngredientParsingPanel } from "@/components/admin/IngredientParsingPanel";
import { ProcessAllRecipesPanel } from "@/components/admin/ProcessAllRecipesPanel";
import { CleanedNamesBackfillPanel } from "@/components/admin/CleanedNamesBackfillPanel";
import { 
  User, 
  AlertCircle, 
  BarChart3, 
  MessageSquare, 
  Download, 
  Settings, 
  Users,
  Bookmark,
  Wrench
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminDashboard = () => {
  useDocumentTitle("Admin Dashboard");
  const { isAdmin, isLoading } = useAdminCheck();
  const [activeTab, setActiveTab] = useState("stats");
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking admin permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`container max-w-7xl mx-auto ${isMobile ? 'px-2 py-4' : 'px-4 py-8'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-terracotta/10">
            <User className="h-6 w-6 text-terracotta" />
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-navy`}>Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage recipes, users, feedback, and platform content
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Improved Tab Navigation */}
        <div className="border-b border-gray-200">
          <TabsList className={`w-full ${isMobile ? 'h-auto p-1' : 'h-12'} bg-transparent border-0 justify-start gap-1 overflow-x-auto`}>
            <TabsTrigger 
              value="stats" 
              className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'hidden sm:inline' : ''}>Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'hidden sm:inline' : ''}>Feedback</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}
            >
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'hidden sm:inline' : ''}>Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="discover-recipes" 
              className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}
            >
              <Bookmark className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'hidden sm:inline' : ''}>Discover Recipes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}
            >
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'hidden sm:inline' : ''}>Export</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}
            >
              <Wrench className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'hidden sm:inline' : ''}>Tools</span>
            </TabsTrigger>
          </TabsList>
        </div>


        {/* Stats Tab - Overview */}
        <TabsContent value="stats" className="space-y-6 mt-6">
          <AdminStats />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-terracotta" />
                <CardTitle>Feedback & Suggestions</CardTitle>
              </div>
              <CardDescription>
                Manage user feedback, bug reports, and feature requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackModerationPanel />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-terracotta" />
                <CardTitle>User Management</CardTitle>
              </div>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discover Recipes Tab - Merged Manage and Import */}
        <TabsContent value="discover-recipes" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-terracotta" />
                <CardTitle>Discover Recipes</CardTitle>
              </div>
              <CardDescription>
                Import and manage recipes in the curated collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-navy mb-4">Import Recipes</h3>
                <RecipeImportPanel />
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-navy mb-4">Manage Recipes</h3>
                <ImportedRecipeManagementPanel />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-terracotta" />
                <CardTitle>Recipe Export</CardTitle>
              </div>
              <CardDescription>
                Export recipe data from your accessible households
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecipeExportPanel />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab - Organized with sections */}
        <TabsContent value="tools" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-terracotta" />
                Image & Media Tools
              </h3>
              <div className="space-y-4">
                <ImagePromptSettingsPanel />
                <ThumbnailGenerationPanel />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-terracotta" />
                Recipe Processing Tools
              </h3>
              <div className="space-y-4">
                <IngredientParsingPanel />
                <ProcessAllRecipesPanel />
                <CleanedNamesBackfillPanel />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
