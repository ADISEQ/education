import { Outlet } from "react-router";
import Sidebar from "../components/ui/sidebar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
