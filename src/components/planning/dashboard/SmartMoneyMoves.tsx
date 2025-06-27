
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, PiggyBank, Users, X } from 'lucide-react';
import { useState } from 'react';

const SmartMoneyMoves = () => {
  const [dismissedCards, setDismissedCards] = useState<string[]>([]);

  const moneyMoves = [
    {
      id: 'emergency-fund',
      title: 'Start an Emergency Fund',
      description: 'Build 3-6 months of expenses for unexpected situations.',
      icon: Shield,
      action: 'Get Started',
      color: 'bg-blue-50 border-blue-200 dark:bg-gray-900 dark:border-gray-800',
      iconColor: 'text-blue-600',
    },
    {
      id: 'roth-ira',
      title: 'Open a Roth IRA',
      description: 'Start saving for retirement with tax-free growth.',
      icon: PiggyBank,
      action: 'Learn More',
      color: 'bg-green-50 border-green-200 dark:bg-gray-900 dark:border-gray-800',
      iconColor: 'text-green-600',
    },
    {
      id: 'beneficiaries',
      title: 'Add Beneficiaries',
      description: 'Ensure your assets are protected and properly designated.',
      icon: Users,
      action: 'Add Now',
      color: 'bg-purple-50 border-purple-200 dark:bg-gray-900 dark:border-gray-800',
      iconColor: 'text-purple-600',
    },
  ];

  const visibleMoves = moneyMoves.filter(move => !dismissedCards.includes(move.id));

  const dismissCard = (cardId: string) => {
    setDismissedCards([...dismissedCards, cardId]);
  };

  if (visibleMoves.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">💡 Smart Money Moves</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMoves.map((move) => (
          <Card key={move.id} className={`${move.color} hover:shadow-lg transition-shadow relative`}>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-black/50"
              onClick={() => dismissCard(move.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <move.icon className={`h-8 w-8 ${move.iconColor}`} />
                <CardTitle className="text-lg dark:text-white">{move.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{move.description}</p>
              <Button variant="outline" className="w-full">
                {move.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmartMoneyMoves;
