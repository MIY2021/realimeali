
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";
import { useSimpleScrollMemory } from "@/hooks/useSimpleScrollMemory";
import { RealiChef } from "@/components/realichef/RealiChef";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Initialize simple scroll memory
  useSimpleScrollMemory();

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <main className="flex-1 w-full pb-16 md:pb-0" data-page-content>
        {children}
      </main>
      <BottomNavigation />
      <RealiChef />
    </div>
  );
};

export default Layout;
