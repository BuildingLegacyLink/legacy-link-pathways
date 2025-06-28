
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
    <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        {nextLevel && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Progress to {nextLevel}</span>
              <span className="text-gray-400 text-sm">{totalXP} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(levelProgress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              Complete modules and earn XP to unlock the next level!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LevelProgressBar;
