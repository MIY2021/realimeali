
import React from 'react';
import { Link } from 'react-router-dom';

const CustomFooter = () => {
  return (
    <footer className="w-full bg-cream border-t py-4">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">
            <p>© 2023 RealiMeali. All rights reserved.</p>
          </div>
          <nav className="flex gap-6">
            <Link to="/recipes" className="hover:text-terracotta transition-colors">
              Recipes
            </Link>
            <Link to="/meal-planner" className="hover:text-terracotta transition-colors">
              Meal Planner
            </Link>
            <Link to="/shopping-list" className="hover:text-terracotta transition-colors">
              Shopping List
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
