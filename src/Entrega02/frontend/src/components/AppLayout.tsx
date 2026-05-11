import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav />
      <main className="md:ml-52 min-h-screen p-6 max-md:pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
