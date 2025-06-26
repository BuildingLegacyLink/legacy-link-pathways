
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface SmartFitQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmartFitQuiz = ({ isOpen, onClose }: SmartFitQuizProps) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    q1: '',
    q2: [] as string[],
    q3: '',
    q4: ''
  });

  const questions = [
    {
      id: 'q1',
      title: 'When you think about improving your finances, which statement sounds most like you?',
      type: 'radio' as const,
      options: [
        { value: 'single', label: 'I just want help with one thing, like investing or budgeting', score: 1 },
        { value: 'full', label: 'I want help seeing the full picture (budgeting, saving, taxes, estate, etc.)', score: 3 },
        { value: 'learning', label: "I'm not sure yet — I'm open to learning what I might be missing", score: 2 }
      ]
    },
    {
      id: 'q2',
      title: 'Are you dealing with any of the following situations?',
      type: 'checkbox' as const,
      options: [
        { value: 'divorce', label: 'Divorce or separation', score: 0 },
        { value: 'inheritance', label: 'Inheriting a large sum of money', score: 0 },
        { value: 'business', label: 'Complex business ownership', score: 0 },
        { value: 'none', label: 'None of these', score: 2 }
      ]
    },
    {
      id: 'q3',
      title: 'Which best describes your approach to financial planning?',
      type: 'radio' as const,
      options: [
        { value: 'simple', label: "I'm looking for simple tools to solve one problem", score: 1 },
        { value: 'guided', label: 'I want a guided platform to help build a full plan over time', score: 3 },
        { value: 'beginner', label: "I've never done financial planning, but I want to get better at it", score: 3 },
        { value: 'handover', label: "I'd rather hand over control and have someone tell me what to do", score: 1 }
      ]
    },
    {
      id: 'q4',
      title: 'Would you prefer to start with a guided setup or go your own way?',
      type: 'radio' as const,
      options: [
        { value: 'guided', label: 'Show me the steps', score: 2 },
        { value: 'explore', label: "I'll explore on my own", score: 1 }
      ]
    }
  ];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRadioChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, value] };
      } else {
        return { ...prev, [questionId]: currentAnswers.filter(v => v !== value) };
      }
    });
  };

  const calculateResult = () => {
    let score = 0;
    
    // Calculate score based on answers
    const q1Answer = questions[0].options.find(opt => opt.value === answers.q1);
    if (q1Answer) score += q1Answer.score;

    const q2Answers = answers.q2;
    q2Answers.forEach(answer => {
      const option = questions[1].options.find(opt => opt.value === answer);
      if (option) score += option.score;
    });

    const q3Answer = questions[2].options.find(opt => opt.value === answers.q3);
    if (q3Answer) score += q3Answer.score;

    const q4Answer = questions[3].options.find(opt => opt.value === answers.q4);
    if (q4Answer) score += q4Answer.score;

    // Determine result based on score
    if (score >= 8) {
      // Ideal fit - route to guided setup
      navigate('/quiz');
    } else if (score >= 5) {
      // Good fit - show dashboard preview
      navigate('/dashboard');
    } else {
      // Might not be ideal - but still allow exploration
      navigate('/dashboard');
    }
    
    onClose();
  };

  const currentQ = questions[currentQuestion];
  const canProceed = currentQ.type === 'radio' 
    ? answers[currentQ.id as keyof typeof answers] 
    : (answers[currentQ.id as keyof typeof answers] as string[]).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Smart Fit Quiz</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm text-gray-500">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{currentQ.title}</h3>
              
              {currentQ.type === 'radio' ? (
                <RadioGroup 
                  value={answers[currentQ.id as keyof typeof answers] as string}
                  onValueChange={(value) => handleRadioChange(currentQ.id, value)}
                  className="space-y-3"
                >
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={option.value} id={`${currentQ.id}-${index}`} />
                      <Label htmlFor={`${currentQ.id}-${index}`} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={`${currentQ.id}-${index}`}
                        checked={(answers[currentQ.id as keyof typeof answers] as string[]).includes(option.value)}
                        onCheckedChange={(checked) => handleCheckboxChange(currentQ.id, option.value, checked as boolean)}
                      />
                      <Label htmlFor={`${currentQ.id}-${index}`} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
            >
              {currentQuestion === questions.length - 1 ? 'Get My Results' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartFitQuiz;
