import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { LogIn, LogOut } from 'lucide-react';

export default function LoginButton() {
  const { login, logout, loginStatus, isAuthenticated } = useAuth();

  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Signing in...' : isAuthenticated ? 'Sign Out' : 'Sign In';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await logout();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      className="gap-2"
    >
      {isAuthenticated ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
      {text}
    </Button>
  );
}
