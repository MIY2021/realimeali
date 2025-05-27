
import { ReactNode } from "react";
import Header from "./Header";
import CustomFooter from "./CustomFooter";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-cream overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      <CustomFooter />
      <Toaster />
    </div>
  );
};

export default Layout;
