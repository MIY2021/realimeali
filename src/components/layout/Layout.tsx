
import { ReactNode } from "react";
import Header from "./Header";
import CustomFooter from "./CustomFooter";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-cream overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <CustomFooter />
    </div>
  );
};

export default Layout;
