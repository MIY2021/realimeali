import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotificationBell = () => {
  return (
    <Button variant="ghost" size="sm" className="relative p-2">
      <Bell className="h-5 w-5 text-navy" />
      <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">2</span>
      </span>
      <span className="sr-only">Notifications</span>
    </Button>
  );
};
