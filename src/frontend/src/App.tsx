import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerRole } from './hooks/useCallerRole';
import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import QuestionManagement from './pages/admin/QuestionManagement';
import TakeQuiz from './pages/student/TakeQuiz';
import MyResults from './pages/student/MyResults';
import AccessDenied from './pages/AccessDenied';
import AppLayout from './components/layout/AppLayout';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { role, isLoading: roleLoading } = useGetCallerRole();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <Landing />;
  }

  if (roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileSetupDialog />
      <AppLayout />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    const identity = (context as any).identity;
    const role = (context as any).role;
    
    if (!identity) {
      return;
    }

    if (role === 'admin') {
      throw redirect({ to: '/admin' });
    } else if (role === 'user') {
      throw redirect({ to: '/student' });
    }
  },
  component: Landing,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const adminQuestionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/questions',
  component: QuestionManagement,
});

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  component: StudentDashboard,
});

const studentQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/quiz',
  component: TakeQuiz,
});

const studentResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/results',
  component: MyResults,
});

const accessDeniedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/access-denied',
  component: AccessDenied,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  adminQuestionsRoute,
  studentRoute,
  studentQuizRoute,
  studentResultsRoute,
  accessDeniedRoute,
]);

const router = createRouter({ 
  routeTree,
  context: {
    identity: undefined,
    role: undefined,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();
  const { role } = useGetCallerRole();

  return (
    <RouterProvider 
      router={router} 
      context={{ 
        identity, 
        role 
      }} 
    />
  );
}
