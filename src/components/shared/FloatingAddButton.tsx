import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingAddButtonProps {
  onClick: () => void;
  ariaLabel: string;
}

export function FloatingAddButton({ onClick, ariaLabel }: FloatingAddButtonProps) {
  return (
    <Button
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 h-14 w-14 rounded-full bg-[#F5B82E] hover:bg-[#F5B82E]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-40 p-0"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
