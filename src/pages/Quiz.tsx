
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const questions = [
    {
      id: 'age',
      title: "What's your current age?",
      type: 'age' as const,
      required: true
    },
    {
      id: 'income',
      title: "What's your approximate annual income?",
      type: 'radio' as const,
      options: [
        { value: 'under-30k', label: 'Under $30,000' },
        { value: '30k-50k', label: '$30,000 - $50,000' },
        { value: '50k-75k', label: '$50,000 - $75,000' },
        { value: '75k-100k', label: '$75,000 - $100,000' },
        { value: 'over-100k', label: 'Over $100,000' }
      ],
      required: true
    },
    {
      id: 'goals',
      title: "What are your primary financial goals? (Select all that apply)",
      type: 'checkbox' as const,
      options: [
        { value: 'emergency-fund', label: 'Build an emergency fund' },
        { value: 'debt-payoff', label: 'Pay off debt' },
        { value: 'save-house', label: 'Save for a house' },
        { value: 'retirement', label: 'Plan for retirement' },
        { value: 'invest', label: 'Start investing' },
        { value: 'other', label: 'Other financial goals' }
      ],
      required: true
    },
    {
      id: 'experience',
      title: "How would you describe your financial planning experience?",
      type: 'radio' as const,
      options: [
        { value: 'beginner', label: "I'm just getting started" },
        { value: 'some-knowledge', label: 'I know the basics but want to learn more' },
        { value: 'intermediate', label: 'I have some experience but need guidance' },
        { value: 'advanced', label: 'I have good knowledge but want a comprehensive plan' }
      ],
      required: true
    },
    {
      id: 'timeline',
      title: "When do you want to achieve your main financial goals?",
      type: 'radio' as const,
      options: [
        { value: '1-year', label: 'Within 1 year' },
        { value: '1-3-years', label: '1-3 years' },
        { value: '3-5-years', label: '3-5 years' },
        { value: '5-10-years', label: '5-10 years' },
        { value: 'over-10-years', label: 'More than 10 years' }
      ],
      required: true
    }
  ];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete - redirect to dashboard
      console.log('Quiz completed with answers:', answers);
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAgeChange = (value: string) => {
    const age = parseInt(value);
    if (!isNaN(age) && age >= 18 && age <= 100) {
      setAnswers(prev => ({ ...prev, age: age }));
    } else if (value === '') {
      setAnswers(prev => ({ ...prev, age: undefined }));
    }
  };

  const handleRadioChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, value] };
      } else {
        return { ...prev, [questionId]: currentAnswers.filter((v: string) => v !== value) };
      }
    });
  };

  const currentQ = questions[currentQuestion];
  const progressPercentage = Math.round(((currentQuestion + 1) / questions.length) * 100);

  const canProceed = () => {
    const answer = answers[currentQ.id];
    if (currentQ.type === 'age') {
      return answer && answer >= 18 && answer <= 100;
    }
    if (currentQ.type === 'radio') {
      return !!answer;
    }
    if (currentQ.type === 'checkbox') {
      return answer && answer.length > 0;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Build Your Financial Roadmap
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Answer a few questions to get your personalized financial plan
          </p>
          <div className="flex items-center justify-center text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>Takes about 5 minutes</span>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Question Content */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {currentQ.title}
            </h2>

            {/* Age Input */}
            {currentQ.type === 'age' && (
              <div className="mb-8">
                <Label htmlFor="age-input" className="text-base font-medium text-gray-700 mb-3 block">
                  Enter your age
                </Label>
                <Input
                  id="age-input"
                  type="number"
                  min="18"
                  max="100"
                  value={answers.age || ''}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  placeholder="e.g., 25"
                  className="text-lg p-4 max-w-xs"
                />
                {answers.age && (answers.age < 18 || answers.age > 100) && (
                  <p className="text-red-500 text-sm mt-2">Please enter an age between 18 and 100</p>
                )}
              </div>
            )}

            {/* Radio Options */}
            {currentQ.type === 'radio' && (
              <div className="grid grid-cols-1 gap-4 mb-8">
                {currentQ.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleRadioChange(currentQ.id, option.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      answers[currentQ.id] === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Checkbox Options */}
            {currentQ.type === 'checkbox' && (
              <div className="grid grid-cols-1 gap-4 mb-8">
                {currentQ.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQ.id]?.includes(option.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={answers[currentQ.id]?.includes(option.value) || false}
                      onChange={(e) => handleCheckboxChange(currentQ.id, option.value, e.target.checked)}
                      className="sr-only"
                    />
                    <span className="block">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

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
                disabled={!canProceed()}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              >
                {currentQuestion === questions.length - 1 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
