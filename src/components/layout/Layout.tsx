
import { Outlet } from "react-router-dom";
import Header from "./Header";
import CustomFooter from "./CustomFooter";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <CustomFooter />
    </div>
  );
};

export default Layout;
