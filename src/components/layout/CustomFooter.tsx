
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedbackDialog } from '@/components/FeedbackDialog';

const CustomFooter = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="w-full bg-cream border-t py-4">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <div className="mb-4 md:mb-0">
              <p>© 2025 RealiMeali. All rights reserved.</p>
            </div>
            <nav className="flex gap-6">
              <Link to="/meal-planner" className="hover:text-terracotta transition-colors">
                Meal Planner
              </Link>
              <Link to="/recipes" className="hover:text-terracotta transition-colors">
                Recipes
              </Link>
              <Link to="/shopping-list" className="hover:text-terracotta transition-colors">
                Shopping List
              </Link>
              <button 
                onClick={() => setFeedbackOpen(true)}
                className="hover:text-terracotta transition-colors"
              >
                Feedback
              </button>
            </nav>
          </div>
        </div>
      </footer>
      
      <FeedbackDialog 
        open={feedbackOpen} 
        onClose={() => setFeedbackOpen(false)} 
      />
    </>
  );
};

export default CustomFooter;
