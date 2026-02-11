import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/useCallerRole';
import { useGetMySubmissions, useGetAllQuestions } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';

export default function MyResults() {
  const { isStudent, isLoading: roleLoading } = useGetCallerRole();
  const { data: submissions = [], isLoading: submissionsLoading } = useGetMySubmissions();
  const { data: questions = [] } = useGetAllQuestions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && !isStudent) {
      navigate({ to: '/access-denied' });
    }
  }, [isStudent, roleLoading, navigate]);

  if (roleLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
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
        <h1 className="text-3xl font-bold tracking-tight">My Results</h1>
        <p className="text-muted-foreground mt-2">
          View your quiz submission history and performance
        </p>
      </div>

      {submissions.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Quiz submissions
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
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageScore)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPoints > 0 ? `${Math.round((averageScore / totalPoints) * 100)}%` : '0%'} average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>
            {submissions.length === 0 
              ? 'No submissions yet. Take a quiz to see your results here.'
              : `${submissions.length} ${submissions.length === 1 ? 'submission' : 'submissions'}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't taken any quizzes yet.
              </p>
              <Button onClick={() => navigate({ to: '/student/quiz' })}>
                Take Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, index) => {
                const score = Number(submission.score);
                const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                        #{submissions.length - index}
                      </div>
                      <div>
                        <div className="font-medium">
                          Quiz Attempt {submissions.length - index}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Number(submission.questionCount)} questions answered
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{score}</div>
                        <div className="text-xs text-muted-foreground">
                          {percentage}%
                        </div>
                      </div>
                      <Badge variant={percentage >= 70 ? 'default' : 'secondary'}>
                        {percentage >= 90 ? 'Excellent' : percentage >= 70 ? 'Good' : percentage >= 50 ? 'Fair' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
