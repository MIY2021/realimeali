import { Mail } from "lucide-react";
import { useRealiChef } from "@/contexts/RealiChefContext";

export const AskRealiChefButton = () => {
  const { setIsOpen } = useRealiChef();
  
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="w-full bg-sage hover:bg-sage/90 text-white p-5 rounded-lg shadow-sm transition-colors mb-6 flex items-center justify-center gap-3"
    >
      <Mail className="h-6 w-6" />
      <span className="text-lg font-semibold">Ask RealiChef</span>
    </button>
  );
};