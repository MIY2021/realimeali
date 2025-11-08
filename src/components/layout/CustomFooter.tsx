import React from 'react';
import { Link } from 'react-router-dom';

const CustomFooter = () => {
  return (
    <footer className="w-full bg-surface border-t py-6">
      <div className="container">
        <div className="flex flex-col space-y-6">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">© 2025 RealiMeali. All rights reserved.</p>
          </div>
          
          {/* Navigation Links - Organized by category */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            {/* Main Features */}
            <div className="space-y-3">
              <h4 className="font-medium text-navy text-xs uppercase tracking-wide">Features</h4>
              <nav className="flex flex-col space-y-2">
                <Link to="/meal-planner" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Meal Planner
                </Link>
                <Link to="/my-recipes" className="text-muted-foreground hover:text-terracotta transition-colors">
                  My Recipes
                </Link>
                <Link to="/find-recipes" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Find Recipes
                </Link>
                <Link to="/shopping-list" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Shopping List
                </Link>
              </nav>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="font-medium text-navy text-xs uppercase tracking-wide">Company</h4>
              <nav className="flex flex-col space-y-2">
                <Link to="/about" className="text-muted-foreground hover:text-terracotta transition-colors">
                  About
                </Link>
                <Link to="/contact" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Contact
                </Link>
                <Link to="/feedback" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Feedback
                </Link>
              </nav>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="font-medium text-navy text-xs uppercase tracking-wide">Legal</h4>
              <nav className="flex flex-col space-y-2">
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Terms of Service
                </Link>
              </nav>
            </div>

            {/* Account (only visible on larger screens, or combined with Legal on mobile) */}
            <div className="space-y-3 col-span-2 md:col-span-1">
              <h4 className="font-medium text-navy text-xs uppercase tracking-wide md:block hidden">Account</h4>
              <nav className="flex flex-col space-y-2 md:block hidden">
                <Link to="/settings" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Settings
                </Link>
              </nav>
              
              {/* On mobile, show settings link under Legal */}
              <div className="md:hidden">
                <Link to="/settings" className="text-muted-foreground hover:text-terracotta transition-colors">
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
