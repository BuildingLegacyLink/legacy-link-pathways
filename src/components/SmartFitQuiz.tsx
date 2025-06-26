
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
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState<'good-fit' | 'not-fit'>('good-fit');
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
        { value: 'single', label: 'I just want help with one thing, like investing or budgeting' },
        { value: 'full', label: 'I want help seeing the full picture (budgeting, saving, taxes, estate, etc.)' },
        { value: 'learning', label: "I'm not sure yet — I'm open to learning what I might be missing" }
      ]
    },
    {
      id: 'q2',
      title: 'Are you dealing with any of the following situations?',
      type: 'checkbox' as const,
      options: [
        { value: 'divorce', label: 'Divorce or separation' },
        { value: 'inheritance', label: 'Inheriting a large sum of money' },
        { value: 'business', label: 'Complex business ownership' },
        { value: 'none', label: 'None of these' }
      ]
    },
    {
      id: 'q3',
      title: 'Which best describes your approach to financial planning?',
      type: 'radio' as const,
      options: [
        { value: 'simple', label: "I'm looking for simple tools to solve one problem" },
        { value: 'guided', label: 'I want a guided platform to help build a full plan over time' },
        { value: 'beginner', label: "I've never done financial planning, but I want to get better at it" },
        { value: 'handover', label: "I'd rather hand over control and have someone tell me what to do" }
      ]
    },
    {
      id: 'q4',
      title: 'Would you prefer to start with a guided setup or go your own way?',
      type: 'radio' as const,
      options: [
        { value: 'guided', label: 'Show me the steps' },
        { value: 'explore', label: "I'll explore on my own" }
      ]
    }
  ];

  const checkForEarlyExit = () => {
    // Check after Q2 and Q3
    if (currentQuestion === 1) { // After Q2
      const hasComplexSituation = answers.q2.some(answer => 
        ['divorce', 'inheritance', 'business'].includes(answer)
      );
      if (hasComplexSituation) {
        setResultType('not-fit');
        setShowResult(true);
        return true;
      }
    }
    
    if (currentQuestion === 2) { // After Q3
      const wantsHandover = answers.q3 === 'handover';
      const hasComplexSituation = answers.q2.some(answer => 
        ['divorce', 'inheritance', 'business'].includes(answer)
      );
      
      if (wantsHandover || hasComplexSituation) {
        setResultType('not-fit');
        setShowResult(true);
        return true;
      }
    }
    
    return false;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const shouldExit = checkForEarlyExit();
      if (!shouldExit) {
        setCurrentQuestion(currentQuestion + 1);
      }
    } else {
      // Final question - show good fit result
      setResultType('good-fit');
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
      setCurrentQuestion(currentQuestion === 3 ? 2 : currentQuestion); // Go back to appropriate question
    } else if (currentQuestion > 0) {
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
        // If selecting "none", clear other options
        if (value === 'none') {
          return { ...prev, [questionId]: ['none'] };
        }
        // If selecting other options, remove "none"
        const filteredAnswers = currentAnswers.filter(a => a !== 'none');
        return { ...prev, [questionId]: [...filteredAnswers, value] };
      } else {
        return { ...prev, [questionId]: currentAnswers.filter(v => v !== value) };
      }
    });
  };

  const handleGuidedSetup = () => {
    navigate('/quiz');
    onClose();
  };

  const handleExploreOwn = () => {
    navigate('/dashboard');
    onClose();
  };

  const handleExploreAnyway = () => {
    navigate('/dashboard');
    onClose();
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setShowResult(false);
    setAnswers({ q1: '', q2: [], q3: '', q4: '' });
  };

  if (showResult) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Quiz Results</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                {resultType === 'good-fit' ? (
                  <>
                    <h3 className="text-2xl font-bold text-green-600 mb-4">
                      Legacy Link is a great fit for your goals!
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      We'll help you build a complete, personalized financial plan — one step at a time.
                    </p>
                    <div className="space-y-3">
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 text-lg"
                        onClick={handleGuidedSetup}
                      >
                        Start Guided Setup
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <button 
                        onClick={handleExploreOwn}
                        className="w-full text-gray-600 hover:text-gray-800 underline text-lg transition-colors"
                      >
                        Explore On Your Own
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">
                      Not the Best Fit
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      It seems like you might have complex financial needs or are looking for a fully managed solution.
                      <br /><br />
                      Legacy Link is designed for people who want to take control of their finances in a simple, guided way.
                      <br /><br />
                      We might not be the best fit for your situation right now — but you're still welcome to explore the platform and learn more.
                    </p>
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 text-lg"
                      onClick={handleExploreAnyway}
                    >
                      Explore Anyway
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quiz
              </Button>
              <Button 
                variant="outline"
                onClick={resetQuiz}
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
