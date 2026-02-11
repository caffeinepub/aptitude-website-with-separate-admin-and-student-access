import { Outlet } from '@tanstack/react-router';
import RoleNavigation from './RoleNavigation';
import InitializeAdminAccessBanner from '../admin/InitializeAdminAccessBanner';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <RoleNavigation />
      <main className="container mx-auto px-4 py-8">
        <InitializeAdminAccessBanner />
        <Outlet />
      </main>
    </div>
  );
}
