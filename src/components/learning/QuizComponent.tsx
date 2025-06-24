
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizComponentProps {
  module: {
    id: string;
    name: string;
    description: string;
    xp_value: number;
    questions: Question[];
    icon?: string;
  };
  onComplete: (score: number, xpEarned: number) => void;
  onBack: () => void;
}

const QuizComponent = ({ module, onComplete, onBack }: QuizComponentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionsToRetry, setQuestionsToRetry] = useState<number[]>([]);
  const [questionQueue, setQuestionQueue] = useState<number[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Initialize question queue with all questions
    setQuestionQueue(Array.from({ length: module.questions.length }, (_, i) => i));
  }, [module.questions.length]);

  // If no questions, show error message
  if (!module.questions || module.questions.length === 0) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-4">
              This module doesn't have any questions yet. Please check back later.
            </p>
          </div>
          
          <Button onClick={onBack} className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
            Back to Topics
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = module.questions[questionQueue[currentQuestionIndex]];
  const progress = ((currentQuestionIndex + 1) / questionQueue.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const questionIndex = questionQueue[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      // Add this question to retry queue if not already there
      if (!questionsToRetry.includes(questionIndex)) {
        setQuestionsToRetry(prev => [...prev, questionIndex]);
        // Add to end of current queue for retry
        setQuestionQueue(prev => [...prev, questionIndex]);
      }
    } else {
      // Mark as correctly answered
      setAnsweredQuestions(prev => new Set([...prev, questionIndex]));
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    if (currentQuestionIndex < questionQueue.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz complete - calculate score based on unique questions answered correctly
      const totalUniqueQuestions = module.questions.length;
      const correctAnswers = answeredQuestions.size;
      const scorePercentage = Math.round((correctAnswers / totalUniqueQuestions) * 100);
      const xpEarned = scorePercentage >= 70 ? module.xp_value : 0;
      
      onComplete(scorePercentage, xpEarned);
    }
  };

  if (showFeedback) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            {isCorrect ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-2">
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </h2>
            {!isCorrect && (
              <p className="text-gray-600 mb-4">
                The correct answer was: <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
              </p>
            )}
            <p className="text-gray-600">
              {isCorrect 
                ? 'Great job! Keep up the good work.' 
                : 'Don\'t worry, you\'ll see this question again to practice.'}
            </p>
          </div>
          
          <Button onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
            {currentQuestionIndex < questionQueue.length - 1 ? 'Continue' : 'Finish Quiz'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Topics
        </button>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questionQueue.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((progress / 100) * module.xp_value)}/{module.xp_value} XP
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
            style={{width: `${progress}%`}}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`px-8 py-2 rounded-lg ${
                selectedAnswer !== null
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizComponent;
