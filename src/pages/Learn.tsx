
import { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target } from 'lucide-react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import LevelProgressBar from '@/components/learning/LevelProgressBar';
import TopicCard from '@/components/learning/TopicCard';
import QuizComponent from '@/components/learning/QuizComponent';
import QuizResults from '@/components/learning/QuizResults';

const Learn = () => {
  const {
    userProgress = [],
    topics,
    modules,
    updateProgress,
    calculateUserStats,
    isModuleUnlocked,
    isLoading
  } = useLearningProgress();

  const [selectedModule, setSelectedModule] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizXP, setQuizXP] = useState(0);

  const { currentLevel, totalXP, levelProgress, nextLevel, nextLevelXP } = calculateUserStats();

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setShowResults(false);
  };

  const handleQuizComplete = (score: number, xpEarned: number) => {
    setQuizScore(score);
    setQuizXP(xpEarned);
    setShowResults(true);
    
    if (selectedModule) {
      updateProgress({
        moduleId: selectedModule.id,
        score,
        xpEarned,
        completed: score >= 70
      });
    }
  };

  const handleRetryQuiz = () => {
    setShowResults(false);
  };

  const handleBackToTopics = () => {
    setSelectedModule(null);
    setShowResults(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading your learning progress...</div>
        </div>
      </div>
    );
  }

  // Show quiz results
  if (selectedModule && showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizResults
            module={selectedModule}
            score={quizScore}
            xpEarned={quizXP}
            onRetry={handleRetryQuiz}
            onBackToTopics={handleBackToTopics}
          />
        </div>
      </div>
    );
  }

  // Show quiz
  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizComponent
            module={selectedModule}
            onComplete={handleQuizComplete}
            onBack={handleBackToTopics}
          />
        </div>
      </div>
    );
  }

  // Main learning dashboard
  const currentLevelTopics = topics.filter(topic => {
    const topicModules = modules.filter(m => m.topic_id === topic.id && m.level === currentLevel);
    return topicModules.length > 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Learning Journey</h1>
          <p className="text-gray-600">Master personal finance through interactive modules and earn XP</p>
        </div>

        {/* Level Progress Bar */}
        <LevelProgressBar
          currentLevel={currentLevel}
          totalXP={totalXP}
          levelProgress={levelProgress}
          nextLevel={nextLevel}
          nextLevelXP={nextLevelXP}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalXP}</div>
              <div className="text-sm text-gray-600">Total XP Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userProgress.filter(p => p.completed).length}
              </div>
              <div className="text-sm text-gray-600">Modules Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2 capitalize">{currentLevel}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Level Topics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold capitalize">{currentLevel} Level Topics</h2>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">{currentLevelTopics.length} topics available</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentLevelTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                modules={modules.filter(m => m.level === currentLevel)}
                userProgress={userProgress}
                isModuleUnlocked={isModuleUnlocked}
                onModuleClick={handleModuleClick}
              />
            ))}
          </div>
        </div>

        {/* Test Out Section */}
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready for the Next Level?</h3>
            <p className="text-gray-600 mb-6">
              Think you already know the {currentLevel} material? Test out of individual topics to advance faster.
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white"
              onClick={() => {
                // TODO: Implement test-out functionality
                console.log('Test out feature coming soon!');
              }}
            >
              Take Topic Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learn;
