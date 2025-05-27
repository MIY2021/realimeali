
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuIndicatorProps {
  onClick: () => void;
  isMenuOpen: boolean;
}

export const MobileMenuIndicator = ({ onClick, isMenuOpen }: MobileMenuIndicatorProps) => {
  if (isMenuOpen) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="fixed right-0 top-[66.67vh] z-40 md:hidden -translate-y-1/2 bg-terracotta/80 hover:bg-terracotta text-white rounded-l-lg rounded-r-none px-2 py-3 shadow-lg backdrop-blur-sm hover:animate-none transition-all duration-300"
      aria-label="Open mobile menu"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
};
