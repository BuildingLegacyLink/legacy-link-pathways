
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useAuth } from '@/hooks/useAuth';
import LevelProgressBar from '@/components/learning/LevelProgressBar';
import TopicCard from '@/components/learning/TopicCard';
import QuizComponent from '@/components/learning/QuizComponent';
import QuizResults from '@/components/learning/QuizResults';

const Learn = () => {
  const { user } = useAuth();
  const { 
    topics, 
    modules, 
    userProgress, 
    updateProgress, 
    calculateUserStats, 
    isModuleUnlocked, 
    isLoading 
  } = useLearningProgress();

  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<{ score: number; xpEarned: number } | null>(null);

  const userStats = calculateUserStats();

  const handleStartQuiz = (module: any) => {
    console.log('Starting quiz for module:', module);
    setSelectedModule(module);
    setShowResults(false);
    setQuizResults(null);
  };

  const handleQuizComplete = async (score: number, xpEarned: number) => {
    console.log('Quiz completed:', { score, xpEarned });
    setQuizResults({ score, xpEarned });
    setShowResults(true);
    
    // Update progress in database
    if (selectedModule) {
      try {
        await updateProgress({
          moduleId: selectedModule.id,
          score,
          xpEarned,
          completed: score >= 70
        });
        
        // Show success message
        if (score >= 70) {
          console.log(`Module completed! +${xpEarned} XP earned`);
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const handleRetryQuiz = () => {
    setShowResults(false);
    setQuizResults(null);
  };

  const handleBackToTopics = () => {
    setSelectedModule(null);
    setShowResults(false);
    setQuizResults(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access your personalized learning experience and track your progress.
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  // Show quiz results
  if (showResults && selectedModule && quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-6">
        <QuizResults
          module={selectedModule}
          score={quizResults.score}
          xpEarned={quizResults.xpEarned}
          onRetry={handleRetryQuiz}
          onBackToTopics={handleBackToTopics}
        />
      </div>
    );
  }

  // Show quiz component
  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-6">
        <QuizComponent
          module={selectedModule}
          onComplete={handleQuizComplete}
          onBack={handleBackToTopics}
        />
      </div>
    );
  }

  // Main learning page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Financial Learning Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master personal finance through interactive lessons and quizzes. 
            Progress through levels to unlock advanced topics.
          </p>
        </div>

        {/* User Progress */}
        <div className="max-w-4xl mx-auto mb-12">
          <LevelProgressBar 
            currentLevel={userStats.currentLevel}
            totalXP={userStats.totalXP}
            levelProgress={userStats.levelProgress}
            nextLevel={userStats.nextLevel}
            nextLevelXP={userStats.nextLevelXP}
          />
        </div>

        {/* Topics Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Learning Topics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => {
              const topicModules = modules.filter(m => m.topic_id === topic.id);
              return (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  modules={topicModules}
                  userProgress={userProgress || []}
                  currentLevel={userStats.currentLevel}
                  onStartQuiz={handleStartQuiz}
                  isModuleUnlocked={isModuleUnlocked}
                />
              );
            })}
          </div>
        </div>

        {/* Test Out Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready for the Next Level?
              </h3>
              <p className="text-gray-600 mb-6">
                Think you've mastered {userStats.currentLevel} level? Take a comprehensive test to advance to the next level faster.
              </p>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 text-lg"
                disabled={userStats.currentLevel === 'expert'}
              >
                {userStats.currentLevel === 'expert' ? 'You\'ve Mastered All Levels!' : 'Take Level Test'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Learn;
