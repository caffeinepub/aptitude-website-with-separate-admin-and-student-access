import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerRole } from '../../hooks/useCallerRole';
import { useGetAllQuestions, useSubmitAnswers } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';
import type { Answer, Submission } from '../../backend';

export default function TakeQuiz() {
  const { isStudent, isLoading: roleLoading } = useGetCallerRole();
  const { data: questions = [], isLoading: questionsLoading } = useGetAllQuestions();
  const submitAnswers = useSubmitAnswers();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<Submission | null>(null);

  useEffect(() => {
    if (!roleLoading && !isStudent) {
      navigate({ to: '/access-denied' });
    }
  }, [isStudent, roleLoading, navigate]);

  if (roleLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!isStudent) {
    return null;
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
            <CardDescription>
              There are no questions available at the moment. Please check back later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/student' })}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, optionIndex: string) => {
    setAnswers(new Map(answers.set(questionId, optionIndex)));
  };

  const handleSubmit = async () => {
    const answerArray: Answer[] = Array.from(answers.entries()).map(([questionId, optionIndex]) => ({
      questionId: BigInt(questionId),
      selectedIndex: BigInt(optionIndex),
    }));

    try {
      const submission = await submitAnswers.mutateAsync(answerArray);
      setResult(submission);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit answers:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0);
  const answeredCount = answers.size;

  if (submitted && result) {
    const score = Number(result.score);
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Points Scored</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-3xl font-bold">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Percentage</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-3xl font-bold">{Number(result.questionCount)}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate({ to: '/student/results' })} className="flex-1">
                View All Results
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setResult(null);
                  setAnswers(new Map());
                }}
                className="flex-1"
              >
                Take Again
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Answer Review</CardTitle>
            <CardDescription>See which questions you got right</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question) => {
              const userAnswer = result.answers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer && userAnswer.selectedIndex === question.answerIndex;

              return (
                <div key={question.id.toString()} className="p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="font-medium">{question.questionText}</div>
                      <div className="text-sm text-muted-foreground">
                        Correct answer: {question.options[Number(question.answerIndex)]}
                      </div>
                      {userAnswer && (
                        <div className="text-sm">
                          Your answer: {question.options[Number(userAnswer.selectedIndex)]}
                        </div>
                      )}
                    </div>
                    <Badge variant={isCorrect ? 'default' : 'secondary'}>
                      {Number(question.points)} pts
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Take Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Answer all questions and submit to see your score
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {answeredCount} / {questions.length} answered
        </Badge>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id.toString()}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    Question {index + 1}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base text-foreground">
                    {question.questionText}
                  </CardDescription>
                </div>
                <div className="flex gap-2 shrink-0">
                  {question.topic && (
                    <Badge variant="outline">{question.topic}</Badge>
                  )}
                  <Badge>{Number(question.points)} pts</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers.get(question.id.toString()) || ''}
                onValueChange={(value) => handleAnswerChange(question.id.toString(), value)}
              >
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}-opt${optionIndex}`} />
                    <Label
                      htmlFor={`q${question.id}-opt${optionIndex}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="sticky bottom-4 border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {answeredCount === questions.length ? (
                <span className="text-green-600 font-medium">All questions answered!</span>
              ) : (
                <span>Please answer all questions before submitting</span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={answeredCount !== questions.length || submitAnswers.isPending}
              size="lg"
            >
              {submitAnswers.isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
