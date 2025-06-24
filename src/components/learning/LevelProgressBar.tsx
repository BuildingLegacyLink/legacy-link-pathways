
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Award, Trophy, Crown } from 'lucide-react';

interface LevelProgressBarProps {
  currentLevel: string;
  totalXP: number;
  levelProgress: number;
  nextLevel?: string;
  nextLevelXP?: number;
}

const LevelProgressBar = ({ currentLevel, totalXP, levelProgress, nextLevel, nextLevelXP }: LevelProgressBarProps) => {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <Star className="h-5 w-5" />;
      case 'intermediate': return <Award className="h-5 w-5" />;
      case 'advanced': return <Trophy className="h-5 w-5" />;
      case 'expert': return <Crown className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'from-green-500 to-green-600';
      case 'intermediate': return 'from-blue-500 to-blue-600';
      case 'advanced': return 'from-purple-500 to-purple-600';
      case 'expert': return 'from-orange-500 to-orange-600';
      default: return 'from-green-500 to-green-600';
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getLevelColor(currentLevel)} rounded-lg flex items-center justify-center text-white`}>
              {getLevelIcon(currentLevel)}
            </div>
            <div>
              <h2 className="text-xl font-bold capitalize">{currentLevel} Level</h2>
              <p className="text-gray-600">You're on your {currentLevel} journey!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalXP} XP</div>
            <div className="text-sm text-gray-500">Total earned</div>
          </div>
        </div>
        
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextLevel}</span>
              <span>{totalXP} / {nextLevelXP} XP</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <p className="text-sm text-gray-600 text-center">
              Complete modules and earn XP to unlock the next level!
            </p>
          </div>
        )}
        
        {!nextLevel && (
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600 mb-2">🎉 Expert Level Achieved!</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LevelProgressBar;
