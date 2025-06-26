
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEffect } from "react";

export default function About() {
  useDocumentTitle("About | RealiMeali");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-navy mb-6">About RealiMeali</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              RealiMeali was born from the everyday struggle of meal planning and cooking for busy households. 
              We understand that deciding "what's for dinner?" shouldn't be a daily stress, and that cooking 
              together should bring families closer, not create chaos.
            </p>
            <p className="text-muted-foreground">
              Our platform combines the convenience of digital recipe management with the warmth of 
              home cooking, making it easier for households to plan, cook, and enjoy meals together.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">What Makes Us Different</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Household-Centered</h3>
                <p className="text-muted-foreground text-sm">
                  Unlike individual recipe apps, RealiMeali is built for households. Share recipes, 
                  plan meals together, and coordinate cooking responsibilities with your family.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Smart Meal Planning</h3>
                <p className="text-muted-foreground text-sm">
                  Our intelligent meal planner considers your household's preferences, dietary needs, 
                  and schedule to suggest the perfect meals for each day.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Automated Shopping Lists</h3>
                <p className="text-muted-foreground text-sm">
                  Generate comprehensive shopping lists from your meal plans, with smart ingredient 
                  consolidation and categorization to make grocery shopping efficient.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">AI-Powered Assistant</h3>
                <p className="text-muted-foreground text-sm">
                  RealiChef, our AI cooking assistant, helps you with recipe suggestions, cooking tips, 
                  ingredient substitutions, and answers all your culinary questions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Our Features</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Recipe Management:</strong> Store, organize, and access your favorite recipes from anywhere</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Collaborative Meal Planning:</strong> Plan meals together with household members and get approval for weekly menus</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Smart Shopping Lists:</strong> Automatically generate and organize shopping lists from your meal plans</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Recipe Discovery:</strong> Find new recipes from our community and discover meals that match your taste</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Cooking Assistance:</strong> Get help from RealiChef AI for cooking tips, substitutions, and recipe guidance</span>
              </li>
              <li className="flex items-start">
                <span className="text-terracotta mr-2">•</span>
                <span><strong>Leftover Management:</strong> Track and plan meals using leftovers to reduce food waste</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-4">
              RealiMeali is more than just a meal planning app – it's a community of home cooks who 
              believe that good food brings people together. Whether you're cooking for two or ten, 
              we're here to make your kitchen adventures more enjoyable and less stressful.
            </p>
            <div className="bg-cream p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-navy mb-3">Get Started Today</h3>
              <p className="text-muted-foreground mb-4">
                Ready to transform your meal planning experience? Create your household and start 
                building your recipe collection today.
              </p>
              <div className="flex gap-4">
                <a href="/contact" className="text-terracotta hover:underline font-medium">
                  Contact Us
                </a>
                <a href="/feedback" className="text-terracotta hover:underline font-medium">
                  Share Feedback
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
