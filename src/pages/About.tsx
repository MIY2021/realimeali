
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
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              RealiMeali is designed to simplify meal planning and recipe management for households. 
              We believe that cooking and meal planning should be enjoyable, not stressful.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Easy recipe storage and organization</li>
              <li>Collaborative meal planning for households</li>
              <li>Automatic shopping list generation</li>
              <li>Recipe discovery and sharing</li>
              <li>AI-powered cooking assistance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-navy mb-4">Get in Touch</h2>
            <p className="text-muted-foreground">
              Have questions or suggestions? We'd love to hear from you! 
              Visit our <a href="/contact" className="text-terracotta hover:underline">contact page</a> or 
              send us <a href="/feedback" className="text-terracotta hover:underline">feedback</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
