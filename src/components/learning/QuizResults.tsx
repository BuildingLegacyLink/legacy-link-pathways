
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, RefreshCw } from 'lucide-react';

interface QuizResultsProps {
  module: {
    name: string;
    xp_value: number;
  };
  score: number;
  xpEarned: number;
  onRetry: () => void;
  onBackToTopics: () => void;
}

const QuizResults = ({ module, score, xpEarned, onRetry, onBackToTopics }: QuizResultsProps) => {
  const passed = score >= 70;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          {passed ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : (
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">😕</span>
            </div>
          )}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Module Complete!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-600 mb-4">
            You scored {score}% on {module.name}
          </p>
          
          <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
          
          {passed && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block mb-4">
              <Trophy className="h-4 w-4 inline mr-2" />
              +{xpEarned} XP Earned!
            </div>
          )}
          
          {!passed && (
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg inline-block mb-4">
              Need 70% to pass and earn XP
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          {!passed && (
            <Button
              onClick={onRetry}
              className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button
            onClick={onBackToTopics}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600"
          >
            {passed ? 'Continue Learning' : 'Back to Topics'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizResults;
