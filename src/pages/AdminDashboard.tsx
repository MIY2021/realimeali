
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { RecipeModerationPanel } from "@/components/admin/RecipeModerationPanel";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { Shield, AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  useDocumentTitle("Admin Dashboard");
  const { isAdmin, isLoading } = useAdminCheck();
  const [activeTab, setActiveTab] = useState("moderation");

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
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-terracotta" />
          <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage recipes, users, and platform content
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="moderation">Recipe Moderation</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Recipe Moderation</CardTitle>
              <CardDescription>
                Review and moderate community recipe submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecipeModerationPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <AdminStats />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
