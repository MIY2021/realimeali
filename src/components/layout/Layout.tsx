
import { ReactNode } from "react";
import Header from "./Header";
import CustomFooter from "./CustomFooter";
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
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full pt-16 pb-16 md:pb-0" data-page-content>
        {children}
      </main>
      <CustomFooter />
      <BottomNavigation />
      <RealiChef />
    </div>
  );
};

export default Layout;
