
import { Button } from '@/components/ui/button';
import { Star, Award, Trophy, Crown } from 'lucide-react';

interface LevelSelectorProps {
  currentLevel: string;
  selectedLevel: string;
  onLevelSelect: (level: string) => void;
}

const LevelSelector = ({ currentLevel, selectedLevel, onLevelSelect }: LevelSelectorProps) => {
  const levelHierarchy = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentLevelIndex = levelHierarchy.indexOf(currentLevel);
  
  // Only show levels up to and including the current level
  const availableLevels = levelHierarchy.slice(0, currentLevelIndex + 1);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <Star className="h-4 w-4" />;
      case 'intermediate': return <Award className="h-4 w-4" />;
      case 'advanced': return <Trophy className="h-4 w-4" />;
      case 'expert': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string, isSelected: boolean) => {
    const baseColors = {
      beginner: isSelected ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
      intermediate: isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      advanced: isSelected ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      expert: isSelected ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    };
    return baseColors[level] || baseColors.beginner;
  };

  if (availableLevels.length <= 1) {
    return null; // Don't show selector if only one level is available
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {availableLevels.map((level) => (
        <Button
          key={level}
          variant="outline"
          size="sm"
          className={`${getLevelColor(level, selectedLevel === level)} border-2 transition-all duration-200`}
          onClick={() => onLevelSelect(level)}
        >
          {getLevelIcon(level)}
          <span className="ml-2 capitalize">{level}</span>
        </Button>
      ))}
    </div>
  );
};

export default LevelSelector;
