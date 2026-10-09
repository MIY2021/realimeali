
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";
import { useSimpleScrollMemory } from "@/hooks/useSimpleScrollMemory";
import { RealiChef } from "@/components/realichef/RealiChef";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Initialize simple scroll memory
  useSimpleScrollMemory();
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 w-full pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0" data-page-content>
        {children}
      </main>
      {user && !isLoading && <BottomNavigation />}
      {user && !isLoading && <RealiChef />}
    </div>
  );
};

export default Layout;
