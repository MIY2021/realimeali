
import React from 'react';
import { Link } from 'react-router-dom';

const CustomFooter = () => {
  return (
    <footer className="w-full bg-cream border-t py-4">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">
            <p>© 2025 RealiMeali. All rights reserved.</p>
          </div>
          <nav className="flex gap-6">
            <Link to="/about" className="hover:text-terracotta transition-colors">
              About
            </Link>
            <Link to="/meal-planner" className="hover:text-terracotta transition-colors">
              Meal Planner
            </Link>
            <Link to="/my-recipes" className="hover:text-terracotta transition-colors">
              Recipes
            </Link>
            <Link to="/shopping-list" className="hover:text-terracotta transition-colors">
              Shopping List
            </Link>
            <Link to="/privacy-policy" className="hover:text-terracotta transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-terracotta transition-colors">
              Terms of Service
            </Link>
            <Link to="/feedback" className="hover:text-terracotta transition-colors">
              Feedback
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
