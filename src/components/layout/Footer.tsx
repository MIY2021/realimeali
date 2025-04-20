
import { UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-cream border-t py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <UtensilsCrossed className="h-5 w-5 text-terracotta" />
            <span className="text-lg font-bold text-navy">Family Food Feed</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 md:mb-0">
            <Link to="/recipes" className="text-navy hover:text-terracotta transition-colors">
              Recipes
            </Link>
            <Link to="/meal-planner" className="text-navy hover:text-terracotta transition-colors">
              Meal Planner
            </Link>
            <Link to="/login" className="text-navy hover:text-terracotta transition-colors">
              Login
            </Link>
          </nav>
          
          <div className="text-sm text-navy/60">
            © {new Date().getFullYear()} Family Food Feed
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
