
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UtensilsCrossed, Search, CalendarDays, ListChecks, Users, Lightbulb, Share, Heart } from "lucide-react";
import { useEffect } from "react";

export default function About() {
  useDocumentTitle("About RealiMeali");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-terracotta/5 to-sage/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-terracotta to-terracotta/80 rounded-full">
                <UtensilsCrossed className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-navy to-terracotta bg-clip-text text-transparent">
                RealiMeali
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your complete meal planning companion that transforms the daily "what's for dinner?" struggle into an organized, collaborative, and enjoyable cooking experience.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-sage/10 to-terracotta/10 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <UtensilsCrossed className="h-6 w-6 text-terracotta" />
              <h2 className="text-2xl font-bold text-navy">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              RealiMeali brings together recipe management, meal planning, and grocery shopping into one seamless platform, 
              eliminating stress and making home cooking accessible and efficient for households of all sizes.
            </p>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow h-full">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-gradient-to-br from-terracotta/20 to-terracotta/10 p-4 mr-4">
                    <UtensilsCrossed className="h-8 w-8 text-terracotta" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy">My Recipes</h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0"></div>
                    <p>Store and organize your favorite recipes in one centralized location</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0"></div>
                    <p>Import from websites, photos, text, or generate with AI</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0"></div>
                    <p>Smart categorization by cuisine, difficulty, and dietary preferences</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow h-full">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-gradient-to-br from-sage/20 to-sage/10 p-4 mr-4">
                    <Search className="h-8 w-8 text-sage" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy">Find Recipes</h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-sage rounded-full mt-2 flex-shrink-0"></div>
                    <p>Discover recipes shared by the RealiMeali community</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-sage rounded-full mt-2 flex-shrink-0"></div>
                    <p>Curated collection of high-quality, moderated recipes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-sage rounded-full mt-2 flex-shrink-0"></div>
                    <p>Advanced search and filtering by preferences</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow h-full">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-gradient-to-br from-navy/20 to-navy/10 p-4 mr-4">
                    <CalendarDays className="h-8 w-8 text-navy" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy">Meal Planner</h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-navy rounded-full mt-2 flex-shrink-0"></div>
                    <p>Visual calendar for planning meals up to 2 weeks ahead</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-navy rounded-full mt-2 flex-shrink-0"></div>
                    <p>Drag & drop simplicity with leftover management</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-navy rounded-full mt-2 flex-shrink-0"></div>
                    <p>Household collaboration and approval workflows</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow h-full">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-gradient-to-br from-terracotta/20 to-terracotta/10 p-4 mr-4">
                    <ListChecks className="h-8 w-8 text-terracotta" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy">Shopping List</h3>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0"></div>
                    <p>Automatically generated from your meal plans</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0"></div>
                    <p>Smart consolidation and store section organization</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0"></div>
                    <p>Interactive checking for efficient shopping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Capabilities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">Advanced Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-terracotta/5 to-white p-6 rounded-xl border">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-terracotta/10 p-3 mr-3">
                  <Users className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="text-lg font-bold text-navy">Household Management</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multi-user collaboration</li>
                <li>• Shared recipe collections</li>
                <li>• Approval workflows</li>
                <li>• Role-based permissions</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-sage/5 to-white p-6 rounded-xl border">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-sage/10 p-3 mr-3">
                  <Lightbulb className="h-6 w-6 text-sage" />
                </div>
                <h3 className="text-lg font-bold text-navy">AI-Powered</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Recipe generation</li>
                <li>• Image recognition</li>
                <li>• Smart parsing</li>
                <li>• Auto-categorization</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-navy/5 to-white p-6 rounded-xl border">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-navy/10 p-3 mr-3">
                  <Share className="h-6 w-6 text-navy" />
                </div>
                <h3 className="text-lg font-bold text-navy">Integration & Sharing</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Website integration</li>
                <li>• Community sharing</li>
                <li>• Public recipe links</li>
                <li>• Cross-platform access</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">Why Choose RealiMeali?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-terracotta/10 to-terracotta/5 p-6 rounded-full w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <UtensilsCrossed className="h-8 w-8 text-terracotta mx-auto mt-2" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Save Time</h3>
              <p className="text-sm text-muted-foreground">Eliminate daily cooking decisions and streamline grocery shopping</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-sage/10 to-sage/5 p-6 rounded-full w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-8 w-8 text-sage mx-auto mt-2" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Reduce Waste</h3>
              <p className="text-sm text-muted-foreground">Plan exact portions and use ingredients efficiently</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-navy/10 to-navy/5 p-6 rounded-full w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-8 w-8 text-navy mx-auto mt-2" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Stay Organized</h3>
              <p className="text-sm text-muted-foreground">Central hub for all your cooking needs with smart organization</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-terracotta/10 to-terracotta/5 p-6 rounded-full w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-terracotta mx-auto mt-2" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Collaborate</h3>
              <p className="text-sm text-muted-foreground">Share responsibilities and build collections together</p>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">Perfect For</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg border">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-terracotta rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-navy">Busy Families</h4>
                    <p className="text-sm text-muted-foreground">Streamline meal planning and reduce daily cooking stress</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-sage rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-navy">Meal Prep Enthusiasts</h4>
                    <p className="text-sm text-muted-foreground">Organize bulk cooking sessions and track portions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-navy rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-navy">Recipe Collectors</h4>
                    <p className="text-sm text-muted-foreground">Digitize and organize physical recipe collections</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-terracotta rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-navy">Health-Conscious Cooks</h4>
                    <p className="text-sm text-muted-foreground">Plan balanced meals and track dietary preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-sage rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-navy">Roommates & Couples</h4>
                    <p className="text-sm text-muted-foreground">Collaborate on planning and share cooking responsibilities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-navy rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-navy">Anyone Who Cooks</h4>
                    <p className="text-sm text-muted-foreground">From occasional cooks to culinary enthusiasts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-terracotta/10 via-sage/5 to-navy/10 rounded-2xl p-12 border">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="h-8 w-8 text-terracotta" />
              <h2 className="text-2xl font-bold text-navy">The RealiMeali Promise</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              RealiMeali transforms the often stressful task of meal planning into an organized, collaborative, 
              and enjoyable experience. We're committed to making home cooking more accessible, efficient, 
              and fun for everyone—because great meals bring people together.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
