
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
import { User, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminDashboard = () => {
  useDocumentTitle("Admin Dashboard");
  const { isAdmin, isLoading } = useAdminCheck();
  const [activeTab, setActiveTab] = useState("moderation");
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
    <div className={`container mx-auto ${isMobile ? 'px-2 py-4' : 'px-4 py-8'}`}>
      <div className={`mb-${isMobile ? '6' : '8'}`}>
        <div className="flex items-center gap-2 mb-2">
          <User className="h-6 w-6 text-terracotta" />
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-navy`}>Admin Dashboard</h1>
        </div>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          Manage recipes, users, feedback, and platform content
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-4' : 'grid-cols-6'}`}>
          <TabsTrigger value="feedback" className={`${isMobile ? 'text-xs px-1' : ''}`}>
            {isMobile ? 'Feedback' : 'Feedback & Suggestions'}
          </TabsTrigger>
          <TabsTrigger value="import" className={`${isMobile ? 'text-xs px-1' : ''}`}>
            {isMobile ? 'Import' : 'Import'}
          </TabsTrigger>
          <TabsTrigger value="manage" className={`${isMobile ? 'text-xs px-1' : ''}`}>
            {isMobile ? 'Manage' : 'Manage Recipes'}
          </TabsTrigger>
          <TabsTrigger value="export" className={`${isMobile ? 'text-xs px-1' : ''}`}>
            {isMobile ? 'Export' : 'Export'}
          </TabsTrigger>
          {isMobile && (
            <>
              <TabsTrigger value="stats" className="text-xs px-1">Stats</TabsTrigger>
              <TabsTrigger value="users" className="text-xs px-1">Users</TabsTrigger>
            </>
          )}
          {!isMobile && (
            <>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </>
          )}
        </TabsList>


        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader className={`${isMobile ? 'px-4 py-4' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>Feedback & Suggestions</CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : ''}`}>
                Manage user feedback, bug reports, and feature requests
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'px-4 pb-4' : ''}`}>
              <FeedbackModerationPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <AdminStats />
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader className={`${isMobile ? 'px-4 py-4' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>Recipe Import</CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : ''}`}>
                Import high-quality recipes to the curated collection
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'px-4 pb-4' : ''}`}>
              <RecipeImportPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <ImportedRecipeManagementPanel />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader className={`${isMobile ? 'px-4 py-4' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>Recipe Export</CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : ''}`}>
                Export recipe data from your accessible households
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'px-4 pb-4' : ''}`}>
              <RecipeExportPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className={`${isMobile ? 'px-4 py-4' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>User Management</CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : ''}`}>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'px-4 pb-4' : ''}`}>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
