import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldAlert, Home } from 'lucide-react';
import { useGetCallerRole } from '../hooks/useCallerRole';

export default function AccessDenied() {
  const { isAdmin, isStudent } = useGetCallerRole();

  const redirectPath = isAdmin ? '/admin' : isStudent ? '/student' : '/';
  const redirectLabel = isAdmin ? 'Admin Dashboard' : isStudent ? 'Student Dashboard' : 'Home';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link to={redirectPath}>
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Go to {redirectLabel}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
