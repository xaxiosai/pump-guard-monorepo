import { Outlet } from "react-router-dom";
import Navbar from "~/components/layout/Navbar";
import RecentSearchTabs from "~/components/layout/RecentSearchTabs";
import Footer from "~/components/layout/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <RecentSearchTabs />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
