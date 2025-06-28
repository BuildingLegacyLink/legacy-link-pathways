
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
import { Trophy, BookOpen, Target, Award } from 'lucide-react';

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

  // Calculate statistics
  const completedModules = userProgress?.filter(p => p.completed).length || 0;
  const totalModules = filteredModules.length;
  const averageScore = userProgress?.length ? 
    Math.round(userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length) : 0;
  const achievements = Math.floor(completedModules / 3); // Example achievement calculation

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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto bg-card border-border">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Sign In Required</h2>
              <p className="text-muted-foreground mb-6 font-light">
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your learning journey...</p>
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Learning Hub</h1>
              <p className="text-muted-foreground">Master personal finance through interactive lessons</p>
            </div>
            <div className="flex items-center space-x-4">
              <Trophy className="h-8 w-8 text-purple-400" />
              <div className="text-right">
                <div className="text-lg font-bold text-foreground capitalize">{userStats.currentLevel}</div>
                <div className="text-sm text-muted-foreground">{userStats.totalXP} XP</div>
              </div>
            </div>
          </div>

          {/* Progress Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-400">{completedModules}</div>
                    <div className="text-sm text-muted-foreground">Lessons Completed</div>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-pink-400">{averageScore}%</div>
                    <div className="text-sm text-muted-foreground">Quiz Average</div>
                  </div>
                  <Target className="h-8 w-8 text-pink-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-400">{achievements}</div>
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                  <Award className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <div className="mb-8">
            <LevelProgressBar 
              currentLevel={userStats.currentLevel}
              totalXP={userStats.totalXP}
              levelProgress={userStats.levelProgress}
              nextLevel={userStats.nextLevel}
              nextLevelXP={userStats.nextLevelXP}
            />
          </div>

          {/* Level Selector */}
          <div className="mb-12">
            <LevelSelector
              currentLevel={userStats.currentLevel}
              selectedLevel={selectedLevel}
              onLevelSelect={handleLevelSelect}
            />
          </div>

          {/* Topics Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Level Courses
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready for the Next Level?
              </h3>
              <p className="text-muted-foreground mb-6">
                Take a comprehensive test to advance faster through the levels.
              </p>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3"
                disabled={userStats.currentLevel === 'expert'}
              >
                {userStats.currentLevel === 'expert' ? 'All Levels Complete!' : 'Take Level Test'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Learn;
