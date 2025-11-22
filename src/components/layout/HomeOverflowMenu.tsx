import { useState } from "react";
import { Settings, LayoutDashboard, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HomeOverflowMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HomeOverflowMenu = ({ isOpen, onOpenChange }: HomeOverflowMenuProps) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

  const handleLogoutClick = () => {
    onOpenChange(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    signOut();
  };

  const menuItems = [
    {
      icon: Settings,
      label: "Settings",
      to: "/settings",
      show: true,
    },
    {
      icon: Mail,
      label: "Report a Bug",
      to: "/feedback",
      show: true,
    },
    {
      icon: LayoutDashboard,
      label: "Admin Dashboard",
      to: "/admin",
      show: isAdmin,
    },
  ];

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-[#FDF8F3] rounded-t-[20px] border-t border-[#E5E7EB]">
          <DrawerHeader className="text-left border-b border-[#E5E7EB] pb-4">
            <DrawerTitle className="text-[#2C3E50] font-semibold">Menu</DrawerTitle>
          </DrawerHeader>
          
          <div className="flex flex-col p-4 space-y-2">
            {menuItems.map((item) => 
              item.show ? (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-[#F5B82E]/10 active:bg-[#F5B82E]/20 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-[#2C3E50] mr-3" />
                  <span className="text-[#2C3E50] font-medium">{item.label}</span>
                </Link>
              ) : null
            )}
            
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-[#F5B82E]/10 active:bg-[#F5B82E]/20 transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-[#2C3E50] mr-3" />
              <span className="text-[#2C3E50] font-medium">Logout</span>
            </button>
          </div>

          <DrawerClose className="absolute top-4 right-4">
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of RealiMeali?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your recipes and meal plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Yes, log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
