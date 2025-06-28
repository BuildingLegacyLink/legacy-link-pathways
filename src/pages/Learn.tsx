
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import LevelProgressBar from '@/components/learning/LevelProgressBar';
import LevelSelector from '@/components/learning/LevelSelector';
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
    isLoading,
    refetchProgress
  } = useLearningProgress();

  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<{ score: number; xpEarned: number } | null>(null);

  const userStats = calculateUserStats();
  const [selectedLevel, setSelectedLevel] = useState<string>(userStats.currentLevel);

  // Update selected level when user advances automatically
  useEffect(() => {
    setSelectedLevel(userStats.currentLevel);
  }, [userStats.currentLevel]);

  // Filter modules and topics based on selected level
  const filteredModules = modules.filter(module => module.level === selectedLevel);
  const filteredTopics = topics.filter(topic => 
    filteredModules.some(module => module.topic_id === topic.id)
  );

  const handleStartQuiz = (module: any) => {
    console.log('Starting quiz for module:', module);
    setSelectedModule(module);
    setShowResults(false);
    setQuizResults(null);
  };

  const handleQuizComplete = (score: number, xpEarned: number) => {
    console.log('Quiz completed:', { score, xpEarned });
    setQuizResults({ score, xpEarned });
    setShowResults(true);
  };

  const handleRetryQuiz = () => {
    setShowResults(false);
    setQuizResults(null);
  };

  const handleBackToTopics = async () => {
    // Save progress when user clicks "Continue Learning" from results
    if (selectedModule && quizResults && quizResults.score === 100) {
      console.log('Saving completed module progress...');
      try {
        await new Promise<void>((resolve, reject) => {
          updateProgress({
            moduleId: selectedModule.id,
            score: quizResults.score,
            xpEarned: quizResults.xpEarned,
            completed: true
          }, {
            onSuccess: () => {
              console.log('Progress saved successfully');
              resolve();
            },
            onError: (error) => {
              console.error('Failed to save progress:', error);
              reject(error);
            }
          });
        });
        
        // Force refresh to update UI
        console.log('Refreshing progress data...');
        await refetchProgress();
        console.log('Progress refreshed, returning to topics');
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
    
    setSelectedModule(null);
    setShowResults(false);
    setQuizResults(null);
  };

  const handleLevelSelect = (level: string) => {
    console.log('Level selected:', level);
    setSelectedLevel(level);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#08090a]">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-[#08090a] flex items-center justify-center">
          <Card className="max-w-md mx-auto bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">Sign In Required</h2>
              <p className="text-gray-300 mb-6 font-light">
                Please sign in to access your personalized learning experience and track your progress.
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#08090a]">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-[#08090a] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading your learning journey...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Current state:', { selectedModule, showResults, quizResults });

  // Show quiz results
  if (showResults && selectedModule && quizResults) {
    console.log('Rendering quiz results');
    return (
      <div className="min-h-screen bg-white dark:bg-[#08090a]">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-[#08090a] p-6">
          <QuizResults
            module={selectedModule}
            score={quizResults.score}
            xpEarned={quizResults.xpEarned}
            onRetry={handleRetryQuiz}
            onBackToTopics={handleBackToTopics}
          />
        </div>
      </div>
    );
  }

  // Show quiz component
  if (selectedModule && !showResults) {
    console.log('Rendering quiz component for module:', selectedModule);
    return (
      <div className="min-h-screen bg-white dark:bg-[#08090a]">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-[#08090a] p-6">
          <QuizComponent
            module={selectedModule}
            onComplete={handleQuizComplete}
            onBack={handleBackToTopics}
          />
        </div>
      </div>
    );
  }

  // Main learning page
  console.log('Rendering main learning page');
  return (
    <div className="min-h-screen bg-white dark:bg-[#08090a]">
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-[#08090a]">
        <div className="container mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-semibold text-white mb-6">
              Learn Smart, 
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Level Up</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Master personal finance through interactive lessons and quizzes. Progress through levels to unlock advanced topics.
            </p>
          </div>

          {/* User Progress */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="bg-gray-800/50 border-gray-700/50 shadow-2xl">
              <CardContent className="p-8">
                <LevelProgressBar 
                  currentLevel={userStats.currentLevel}
                  totalXP={userStats.totalXP}
                  levelProgress={userStats.levelProgress}
                  nextLevel={userStats.nextLevel}
                  nextLevelXP={userStats.nextLevelXP}
                />
              </CardContent>
            </Card>
          </div>

          {/* Level Selector */}
          <div className="max-w-4xl mx-auto mb-12">
            <LevelSelector
              currentLevel={userStats.currentLevel}
              selectedLevel={selectedLevel}
              onLevelSelect={handleLevelSelect}
            />
          </div>

          {/* Topics Grid */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-semibold text-white mb-12 text-center">
              Learning Topics
              <span className="text-gray-400 font-light ml-2">({selectedLevel} level)</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTopics.map((topic) => {
                const topicModules = filteredModules.filter(m => m.topic_id === topic.id);
                return (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    modules={topicModules}
                    userProgress={userProgress || []}
                    currentLevel={selectedLevel}
                    onStartQuiz={handleStartQuiz}
                    isModuleUnlocked={isModuleUnlocked}
                  />
                );
              })}
            </div>
          </div>

          {/* Test Out Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/20 shadow-2xl">
              <CardContent className="p-12 text-center">
                <h3 className="text-3xl font-semibold text-white mb-6">
                  Ready for the Next Level?
                </h3>
                <p className="text-gray-300 mb-8 text-lg font-light">
                  Think you've mastered {userStats.currentLevel} level? Take a comprehensive test to advance faster.
                </p>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 text-lg font-medium"
                  disabled={userStats.currentLevel === 'expert'}
                >
                  {userStats.currentLevel === 'expert' ? 'You\'ve Mastered All Levels!' : 'Take Level Test'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
