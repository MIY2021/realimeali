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
import { BulkImageRegenerationPanel } from "@/components/admin/BulkImageRegenerationPanel";
import { ThumbnailGenerationPanel } from "@/components/admin/ThumbnailGenerationPanel";
import { IngredientParsingPanel } from "@/components/admin/IngredientParsingPanel";
import { ProcessAllRecipesPanel } from "@/components/admin/ProcessAllRecipesPanel";
import { DrinkPairingBackfillPanel } from "@/components/admin/DrinkPairingBackfillPanel";
import { 
  User, 
  AlertCircle, 
  BarChart3, 
  MessageSquare, 
  Download, 
  Users,
  Bookmark,
  Wrench,
  Image,
  FileImage,
  RefreshCw,
  Wine,
  Sparkles
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Access Denied</h2>
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-terracotta/10">
            <User className="h-6 w-6 text-terracotta" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage recipes, users, feedback, and platform content
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-gray-200">
          <TabsList className={`w-full ${isMobile ? 'h-auto p-1' : 'h-12'} bg-transparent border-0 justify-start gap-1 overflow-x-auto`}>
            <TabsTrigger value="stats" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}>
              <BarChart3 className="h-4 w-4 flex-shrink-0" /><span className={isMobile ? 'hidden sm:inline' : ''}>Stats</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}>
              <MessageSquare className="h-4 w-4 flex-shrink-0" /><span className={isMobile ? 'hidden sm:inline' : ''}>Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="users" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}>
              <Users className="h-4 w-4 flex-shrink-0" /><span className={isMobile ? 'hidden sm:inline' : ''}>Users</span>
            </TabsTrigger>
            <TabsTrigger value="discover-recipes" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}>
              <Bookmark className="h-4 w-4 flex-shrink-0" /><span className={isMobile ? 'hidden sm:inline' : ''}>Discover Recipes</span>
            </TabsTrigger>
            <TabsTrigger value="export" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}>
              <Download className="h-4 w-4 flex-shrink-0" /><span className={isMobile ? 'hidden sm:inline' : ''}>Export</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2 py-1.5' : 'px-4 py-2'} data-[state=active]:bg-terracotta/10 data-[state=active]:text-terracotta data-[state=active]:border-b-2 data-[state=active]:border-terracotta rounded-t-lg border-b-2 border-transparent transition-all`}>
              <Wrench className="h-4 w-4 flex-shrink-0" /><span className={isMobile ? 'hidden sm:inline' : ''}>Tools</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stats" className={`space-y-6 mt-6 ${isMobile ? "space-y-3" : ""}`}><AdminStats /></TabsContent>

        <TabsContent value="feedback" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader className={isMobile ? "px-4 py-4" : ""}><div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-terracotta" /><CardTitle className={isMobile ? "text-lg" : ""}>Feedback & Suggestions</CardTitle></div><CardDescription className={isMobile ? "text-xs" : ""}>Manage user feedback, bug reports, and feature requests</CardDescription></CardHeader>
            <CardContent className={isMobile ? "px-4 pb-4" : ""}><FeedbackModerationPanel /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader className={isMobile ? "px-4 py-4" : ""}><div className="flex items-center gap-2"><Users className="h-5 w-5 text-terracotta" /><CardTitle className={isMobile ? "text-lg" : ""}>User Management</CardTitle></div><CardDescription className={isMobile ? "text-xs" : ""}>Manage user accounts and permissions</CardDescription></CardHeader>
            <CardContent className={isMobile ? "px-4 pb-4" : ""}><UserManagement /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover-recipes" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader className={isMobile ? "px-4 py-4" : ""}><div className="flex items-center gap-2"><Bookmark className="h-5 w-5 text-terracotta" /><CardTitle className={isMobile ? "text-lg" : ""}>Discover Recipes</CardTitle></div><CardDescription className={isMobile ? "text-xs" : ""}>Import and manage recipes in the curated collection</CardDescription></CardHeader>
            <CardContent className={`space-y-6 ${isMobile ? "px-4 pb-4" : ""}`}>
              <div><h3 className={`font-semibold text-navy mb-4 ${isMobile ? "text-base" : "text-lg"}`}>Import Recipes</h3><RecipeImportPanel /></div>
              <div className="border-t pt-6"><h3 className={`font-semibold text-navy mb-4 ${isMobile ? "text-base" : "text-lg"}`}>Manage Recipes</h3><ImportedRecipeManagementPanel /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader><div className="flex items-center gap-2"><Download className="h-5 w-5 text-terracotta" /><CardTitle>Recipe Export</CardTitle></div><CardDescription>Export recipe data from your accessible households</CardDescription></CardHeader>
            <CardContent><RecipeExportPanel /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader><div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-terracotta" /><CardTitle>Admin Tools</CardTitle></div><CardDescription>Manage images, process recipes, and perform batch operations</CardDescription></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="image-prompt">
                  <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100"><Image className="h-5 w-5 text-blue-600" /></div><div className="text-left"><div className="font-semibold">Image Generation Prompt</div><div className="text-sm text-muted-foreground font-normal">Configure AI prompt for recipe image generation</div></div></div></AccordionTrigger>
                  <AccordionContent><ImagePromptSettingsPanel /></AccordionContent>
                </AccordionItem>

                <AccordionItem value="bulk-image-regeneration">
                  <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-amber-100"><RefreshCw className="h-5 w-5 text-amber-600" /></div><div className="text-left"><div className="font-semibold">Regenerate Existing AI Images</div><div className="text-sm text-muted-foreground font-normal">Regenerate existing recipe images with the new photography system</div></div></div></AccordionTrigger>
                  <AccordionContent><BulkImageRegenerationPanel /></AccordionContent>
                </AccordionItem>

                <AccordionItem value="thumbnail-generation">
                  <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-100"><FileImage className="h-5 w-5 text-purple-600" /></div><div className="text-left"><div className="font-semibold">Thumbnail Generation</div><div className="text-sm text-muted-foreground font-normal">Generate optimized thumbnails for recipes</div></div></AccordionTrigger>
                  <AccordionContent><ThumbnailGenerationPanel /></AccordionContent>
                </AccordionItem>

                <AccordionItem value="ingredient-parsing">
                  <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-100"><Sparkles className="h-5 w-5 text-green-600" /></div><div className="text-left"><div className="font-semibold">Ingredient Parsing</div><div className="text-sm text-muted-foreground font-normal">Parse and categorize recipe ingredients using AI</div></div></AccordionTrigger>
                  <AccordionContent><IngredientParsingPanel /></AccordionContent>
                </AccordionItem>

                <AccordionItem value="process-recipes">
                  <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-orange-100"><RefreshCw className="h-5 w-5 text-orange-600" /></div><div className="text-left"><div className="font-semibold">Process All Recipes</div><div className="text-sm text-muted-foreground font-normal">Batch process recipes for categorization and analysis</div></div></div></AccordionTrigger>
                  <AccordionContent><ProcessAllRecipesPanel /></AccordionContent>
                </AccordionItem>

                <AccordionItem value="drink-pairing-backfill">
                  <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-rose-100"><Wine className="h-5 w-5 text-rose-600" /></div><div className="text-left"><div className="font-semibold">Drink Pairing Backfill</div><div className="text-sm text-muted-foreground font-normal">Generate Perfect Pairing suggestions for recipes missing drink pairings</div></div></AccordionTrigger>
                  <AccordionContent><DrinkPairingBackfillPanel /></AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
