import { Link, useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/useCallerRole';
import { useGetAllQuestions, useGetMySubmissions } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ClipboardList, BarChart3, Trophy, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';

export default function StudentDashboard() {
  const { isStudent, isLoading } = useGetCallerRole();
  const { data: questions = [] } = useGetAllQuestions();
  const { data: submissions = [] } = useGetMySubmissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isStudent) {
      navigate({ to: '/access-denied' });
    }
  }, [isStudent, isLoading, navigate]);

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

  if (!isStudent) {
    return null;
  }

  const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0);
  const bestScore = submissions.length > 0 
    ? Math.max(...submissions.map(s => Number(s.score)))
    : 0;
  const averageScore = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + Number(s.score), 0) / submissions.length
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and take aptitude quizzes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Questions</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total points: {totalPoints}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPoints > 0 ? `${Math.round((bestScore / totalPoints) * 100)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attempts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {submissions.length > 0 ? Math.round(averageScore) : 0} points
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Take a Quiz</CardTitle>
            <CardDescription>
              Test your aptitude skills with available questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length > 0 ? (
              <Link to="/student/quiz">
                <Button className="w-full gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Start Quiz
                </Button>
              </Link>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No questions available yet. Check back later!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Results</CardTitle>
            <CardDescription>
              Review your past quiz submissions and scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/student/results">
              <Button variant="outline" className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                My Results
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
