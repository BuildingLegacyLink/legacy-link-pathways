
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
  
  // Show all levels up to and including the current level
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

  if (availableLevels.length <= 1) {
    return null; // Don't show selector if only one level is available
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      <div className="text-sm text-muted-foreground mb-2 w-full text-center">
        Switch between unlocked levels:
      </div>
      {availableLevels.map((level) => {
        const isSelected = selectedLevel === level;
        return (
          <Button
            key={level}
            variant={isSelected ? "default" : "outline"}
            size="default"
            className={`
              min-w-[120px] h-12 transition-all duration-200 font-medium
              ${isSelected 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md' 
                : 'bg-card hover:bg-accent text-foreground border-2 border-border hover:border-primary/20'
              }
            `}
            onClick={() => onLevelSelect(level)}
          >
            {getLevelIcon(level)}
            <span className="ml-2 capitalize">{level}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default LevelSelector;
