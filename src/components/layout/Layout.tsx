
import { ReactNode } from "react";
import Header from "./Header";
import CustomFooter from "./CustomFooter";
import BottomNavigation from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full pt-16 pb-16 md:pb-0">
        {children}
      </main>
      <CustomFooter />
      <BottomNavigation />
    </div>
  );
};

export default Layout;
