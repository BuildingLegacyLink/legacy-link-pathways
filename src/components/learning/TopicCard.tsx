
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lock, Play } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  topic_id: string;
  level: string;
  sort_order: number;
  xp_value: number;
  questions: any[];
}

interface TopicCardProps {
  topic: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
  modules: Module[];
  userProgress: any[];
  currentLevel: string;
  isModuleUnlocked: (moduleId: string) => boolean;
  onStartQuiz: (module: Module) => void;
}

const TopicCard = ({ topic, modules, userProgress, currentLevel, isModuleUnlocked, onStartQuiz }: TopicCardProps) => {
  const topicModules = modules.filter(m => m.topic_id === topic.id);
  const completedModules = topicModules.filter(m => 
    userProgress.find(p => p.module_id === m.id && p.completed)
  );

  const getModuleStatus = (module: Module) => {
    const progress = userProgress.find(p => p.module_id === module.id);
    const unlocked = isModuleUnlocked(module.id);
    
    if (progress?.completed) return 'completed';
    if (unlocked) return 'unlocked';
    return 'locked';
  };

  // Sort modules: unlocked/completed first, then locked ones
  const sortedModules = [...topicModules].sort((a, b) => {
    const statusA = getModuleStatus(a);
    const statusB = getModuleStatus(b);
    
    // Priority: completed > unlocked > locked
    const priorityMap = { completed: 3, unlocked: 2, locked: 1 };
    const priorityDiff = priorityMap[statusB] - priorityMap[statusA];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same status, sort by sort_order
    return a.sort_order - b.sort_order;
  });

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{topic.icon}</span>
            <div>
              <h3 className="text-lg font-semibold">{topic.name}</h3>
              <p className="text-sm text-gray-600">{topic.description}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedModules.length} / {topicModules.length} modules</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${topicModules.length > 0 ? (completedModules.length / topicModules.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {sortedModules.map((module) => {
            const status = getModuleStatus(module);
            return (
              <div
                key={module.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  status === 'locked' 
                    ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                    : status === 'completed'
                      ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer'
                }`}
                onClick={() => status !== 'locked' && onStartQuiz(module)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {status === 'unlocked' && <Play className="h-5 w-5 text-blue-600" />}
                    {status === 'locked' && <Lock className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{module.name}</div>
                    <div className="text-xs text-gray-600">{module.description}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  +{module.xp_value} XP
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicCard;
