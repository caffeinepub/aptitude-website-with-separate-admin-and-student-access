import { Link, useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/useCallerRole';
import { useGetAllQuestions } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileQuestion, BarChart3, Users, Plus } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useGetCallerRole();
  const { data: questions = [] } = useGetAllQuestions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: '/access-denied' });
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage questions and monitor the aptitude testing platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active in question bank
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(questions.map(q => q.topic).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Different categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.reduce((sum, q) => sum + Number(q.points), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum possible score
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Question Management</CardTitle>
            <CardDescription>
              Create, edit, and organize aptitude test questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/questions">
              <Button className="w-full gap-2">
                <FileQuestion className="h-4 w-4" />
                Manage Questions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/questions">
              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add New Question
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
