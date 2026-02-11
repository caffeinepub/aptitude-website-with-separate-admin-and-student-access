import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCheckAdminExists, useClaimInitialAdmin } from '../../hooks/useAdminBootstrap';
import { useGetCallerRole } from '../../hooks/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export default function InitializeAdminAccessBanner() {
  const { identity } = useInternetIdentity();
  const { data: adminExists, isLoading: checkingAdmin } = useCheckAdminExists();
  const { role, isFetched: roleFetched } = useGetCallerRole();
  const claimAdmin = useClaimInitialAdmin();
  const navigate = useNavigate();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [userToken, setUserToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showTokenForm, setShowTokenForm] = useState(false);

  // Only show banner if:
  // 1. User is authenticated
  // 2. Admin check is complete and no admin exists
  // 3. User role is fetched and user is not already admin
  const shouldShowBanner = 
    !!identity && 
    !checkingAdmin && 
    roleFetched && 
    adminExists === false && 
    role !== 'admin';

  if (!shouldShowBanner) {
    return null;
  }

  const handleInitializeClick = () => {
    setError(null);
    setShowTokenForm(true);
  };

  const handleConfirmClick = () => {
    if (!adminToken.trim() || !userToken.trim()) {
      setError('Please enter both tokens');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleClaimAdmin = async () => {
    setShowConfirmDialog(false);
    setError(null);

    try {
      await claimAdmin.mutateAsync({ adminToken, userProvidedToken: userToken });
      // On success, navigate to admin dashboard
      navigate({ to: '/admin' });
    } catch (err: any) {
      console.error('Failed to claim admin:', err);
      
      // Check for specific error messages
      const errorMessage = err?.message || String(err);
      
      if (errorMessage.includes('already') || errorMessage.includes('initialized')) {
        setError('Admin initialization is already complete. Another user has claimed the admin role.');
      } else if (errorMessage.includes('token') || errorMessage.includes('match')) {
        setError('Invalid tokens provided. Please check your tokens and try again.');
      } else if (errorMessage.includes('Anonymous')) {
        setError('You must be logged in to claim admin access.');
      } else {
        setError('Failed to initialize admin access. Please try again.');
      }
      
      setShowTokenForm(false);
      setAdminToken('');
      setUserToken('');
    }
  };

  return (
    <>
      <Card className="mb-6 border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <CardTitle className="text-xl">Initialize Admin Access</CardTitle>
              <CardDescription className="mt-2">
                No administrator has been set up yet. As the first user, you can claim admin access to manage questions and platform settings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showTokenForm ? (
            <Button 
              onClick={handleInitializeClick}
              disabled={claimAdmin.isPending}
              className="w-full sm:w-auto"
            >
              <Shield className="mr-2 h-4 w-4" />
              Initialize Admin Access
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminToken">Admin Token</Label>
                <Input
                  id="adminToken"
                  type="password"
                  placeholder="Enter admin token"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  disabled={claimAdmin.isPending}
                />
                <p className="text-sm text-muted-foreground">
                  This token will be used to secure admin operations.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userToken">Confirm Token</Label>
                <Input
                  id="userToken"
                  type="password"
                  placeholder="Re-enter admin token"
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                  disabled={claimAdmin.isPending}
                />
                <p className="text-sm text-muted-foreground">
                  Please enter the same token again to confirm.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmClick}
                  disabled={claimAdmin.isPending || !adminToken.trim() || !userToken.trim()}
                >
                  {claimAdmin.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm & Initialize
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTokenForm(false);
                    setAdminToken('');
                    setUserToken('');
                    setError(null);
                  }}
                  disabled={claimAdmin.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Admin Initialization</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to claim administrator access for this platform. This action will grant you full control over questions, user management, and platform settings.
              <br /><br />
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClaimAdmin}>
              Yes, Initialize Admin Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
