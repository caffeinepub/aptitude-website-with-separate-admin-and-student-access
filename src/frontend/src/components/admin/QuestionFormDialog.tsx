import { useState, useEffect } from 'react';
import { useAddQuestion, useUpdateQuestion } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Plus, X } from 'lucide-react';
import type { Question } from '../../backend';

interface QuestionFormDialogProps {
  open: boolean;
  onClose: () => void;
  question?: Question | null;
}

export default function QuestionFormDialog({ open, onClose, question }: QuestionFormDialogProps) {
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [answerIndex, setAnswerIndex] = useState('0');
  const [points, setPoints] = useState('1');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (question) {
      setQuestionText(question.questionText);
      setOptions(question.options);
      setAnswerIndex(question.answerIndex.toString());
      setPoints(question.points.toString());
      setTopic(question.topic || '');
    } else {
      setQuestionText('');
      setOptions(['', '']);
      setAnswerIndex('0');
      setPoints('1');
      setTopic('');
    }
  }, [question, open]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (parseInt(answerIndex) === index) {
        setAnswerIndex('0');
      } else if (parseInt(answerIndex) > index) {
        setAnswerIndex((parseInt(answerIndex) - 1).toString());
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    const questionData: Question = {
      id: question?.id || BigInt(0),
      questionText: questionText.trim(),
      options: validOptions,
      answerIndex: BigInt(answerIndex),
      points: BigInt(points),
      topic: topic.trim() || undefined,
    };

    try {
      if (question) {
        await updateQuestion.mutateAsync(questionData);
      } else {
        await addQuestion.mutateAsync(questionData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question. Please try again.');
    }
  };

  const isPending = addQuestion.isPending || updateQuestion.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          <DialogDescription>
            {question ? 'Update the question details below.' : 'Create a new aptitude test question.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text *</Label>
            <Textarea
              id="questionText"
              placeholder="Enter the question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic (Optional)</Label>
            <Input
              id="topic"
              placeholder="e.g., Mathematics, Logical Reasoning"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Answer Options *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>

            <RadioGroup value={answerIndex} onValueChange={setAnswerIndex}>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1"
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Select the correct answer by clicking the radio button
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Points *</Label>
            <Input
              id="points"
              type="number"
              min="1"
              placeholder="Points for this question"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
