import { Link, useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/useCallerRole';
import { useAuth } from '../../hooks/useAuth';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { GraduationCap, LayoutDashboard, FileQuestion, ClipboardList, BarChart3, User, LogOut } from 'lucide-react';

export default function RoleNavigation() {
  const { isAdmin, isStudent } = useGetCallerRole();
  const { logout } = useAuth();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <GraduationCap className="h-6 w-6" />
              <span>AptitudeHub</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {isAdmin && (
                <>
                  <Link to="/admin">
                    <Button variant="ghost" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/admin/questions">
                    <Button variant="ghost" className="gap-2">
                      <FileQuestion className="h-4 w-4" />
                      Questions
                    </Button>
                  </Link>
                </>
              )}
              
              {isStudent && (
                <>
                  <Link to="/student">
                    <Button variant="ghost" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/student/quiz">
                    <Button variant="ghost" className="gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Take Quiz
                    </Button>
                  </Link>
                  <Link to="/student/results">
                    <Button variant="ghost" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      My Results
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{userProfile?.name || 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userProfile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? 'Administrator' : isStudent ? 'Student' : 'Guest'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
