
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
  };
  onComplete: (score: number, xpEarned: number) => void;
  onBack: () => void;
}

const QuizComponent = ({ module, onComplete, onBack }: QuizComponentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState<Set<number>>(new Set());
  const [missedQuestions, setMissedQuestions] = useState<number[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isReviewPhase, setIsReviewPhase] = useState(false);
  const [originalQuestionIndex, setOriginalQuestionIndex] = useState<number | null>(null);

  console.log('QuizComponent rendered with module:', module);
  console.log('Module questions:', module.questions);
  console.log('All questions state:', allQuestions);
  console.log('Current question index:', currentQuestionIndex);
  console.log('Correctly answered questions:', correctlyAnsweredQuestions);

  // Initialize questions on component mount
  useEffect(() => {
    console.log('Setting up questions from module:', module);
    if (module.questions && Array.isArray(module.questions) && module.questions.length > 0) {
      console.log('Setting allQuestions to:', module.questions);
      setAllQuestions([...module.questions]);
    } else {
      console.log('No valid questions found in module');
    }
  }, [module]);

  // Update original question index when moving through review questions
  useEffect(() => {
    if (isReviewPhase && missedQuestions.length > 0 && currentQuestionIndex < missedQuestions.length) {
      setOriginalQuestionIndex(missedQuestions[currentQuestionIndex]);
    } else {
      setOriginalQuestionIndex(null);
    }
  }, [currentQuestionIndex, isReviewPhase, missedQuestions]);

  // If no questions, show error message
  if (!allQuestions || allQuestions.length === 0) {
    console.log('Rendering no questions message');
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-4">
              This module doesn't have any questions yet. Please check back later.
            </p>
            <p className="text-sm text-gray-500">
              Module ID: {module.id}
            </p>
            <p className="text-sm text-gray-500">
              Questions data: {JSON.stringify(module.questions)}
            </p>
          </div>
          
          <Button onClick={onBack} className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
            Back to Topics
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = module.questions.length;
  const progress = (correctlyAnsweredQuestions.size / totalQuestions) * 100;

  console.log('Current question:', currentQuestion);
  console.log('Review phase:', isReviewPhase);
  console.log('Missed questions:', missedQuestions);
  console.log('Progress:', progress);

  if (!currentQuestion) {
    console.log('Current question is undefined, index:', currentQuestionIndex, 'questions length:', allQuestions.length);
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Question Loading Error</h2>
            <p className="text-gray-600 mb-4">
              Unable to load the current question. Please try again.
            </p>
            <p className="text-sm text-gray-500">
              Question index: {currentQuestionIndex}, Total questions: {allQuestions.length}
            </p>
          </div>
          
          <Button onClick={onBack} className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
            Back to Topics
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return; // Prevent selection during feedback
    console.log('Answer selected:', answerIndex, 'Correct answer:', currentQuestion.correctAnswer);
    
    setSelectedAnswer(answerIndex);
    
    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      // Track the original question index that was answered correctly
      const questionIndexToTrack = isReviewPhase && originalQuestionIndex !== null ? originalQuestionIndex : currentQuestionIndex;
      setCorrectlyAnsweredQuestions(prev => new Set([...prev, questionIndexToTrack]));
      setCorrectAnswers(prev => prev + 1);
      
      // Auto-advance after a short delay for correct answers
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      // Track missed question for review (use original index if in review phase)
      const questionIndexToTrack = isReviewPhase && originalQuestionIndex !== null ? originalQuestionIndex : currentQuestionIndex;
      if (!missedQuestions.includes(questionIndexToTrack)) {
        setMissedQuestions(prev => [...prev, questionIndexToTrack]);
      }
    }
  };

  const handleNext = () => {
    console.log('Moving to next question');
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Check if we need to review missed questions
      if (missedQuestions.length > 0) {
        console.log('Starting review phase with missed questions:', missedQuestions);
        // Start review phase with missed questions
        const missedQuestionObjects = missedQuestions.map(index => module.questions[index]);
        setAllQuestions(missedQuestionObjects);
        setCurrentQuestionIndex(0);
        setIsReviewPhase(true);
        
        // Clear missed questions for this round
        setMissedQuestions([]);
      } else {
        // Quiz complete - calculate final score
        console.log('Quiz complete, calculating score');
        const scorePercentage = Math.round((correctlyAnsweredQuestions.size / totalQuestions) * 100);
        const xpEarned = scorePercentage >= 70 ? module.xp_value : 0;
        
        onComplete(scorePercentage, xpEarned);
      }
    }
  };

  const getOptionClassName = (optionIndex: number) => {
    if (!showFeedback) {
      return selectedAnswer === optionIndex
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25';
    }

    // Show feedback colors
    if (optionIndex === currentQuestion.correctAnswer) {
      return 'border-green-500 bg-green-50'; // Correct answer is green
    }
    
    if (selectedAnswer === optionIndex && !isCorrect) {
      return 'border-red-500 bg-red-50'; // User's wrong answer is red
    }
    
    return 'border-gray-200'; // Other options remain neutral
  };

  const getRadioClassName = (optionIndex: number) => {
    if (!showFeedback) {
      return selectedAnswer === optionIndex ? 'border-blue-500 bg-blue-500' : 'border-gray-300';
    }

    if (optionIndex === currentQuestion.correctAnswer) {
      return 'border-green-500 bg-green-500';
    }
    
    if (selectedAnswer === optionIndex && !isCorrect) {
      return 'border-red-500 bg-red-500';
    }
    
    return 'border-gray-300';
  };

  console.log('Rendering quiz question:', currentQuestion.question);

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
            {isReviewPhase ? 'Review: ' : ''}Question {currentQuestionIndex + 1} of {allQuestions.length}
          </span>
          <span className="text-sm text-gray-500">
            {module.name} • +{module.xp_value} XP
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
            style={{width: `${progress}%`}}
          />
        </div>
        
        <div className="text-sm text-gray-600 text-center">
          {correctlyAnsweredQuestions.size} of {totalQuestions} questions answered correctly
        </div>
      </div>

      {/* Question */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${getOptionClassName(index)} ${
                  showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${getRadioClassName(index)}`}>
                    {(selectedAnswer === index || (showFeedback && index === currentQuestion.correctAnswer)) && 
                      <div className="w-2 h-2 bg-white rounded-full" />
                    }
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            {showFeedback && !isCorrect ? (
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600"
              >
                {currentQuestionIndex < allQuestions.length - 1 ? 'Next Question' : 
                 missedQuestions.length > 0 ? 'Review Missed Questions' : 'Finish Quiz'}
              </Button>
            ) : !showFeedback && (
              <div className="text-gray-500 text-sm">
                Select an answer to continue
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizComponent;
