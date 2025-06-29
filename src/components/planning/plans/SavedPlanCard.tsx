
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SavedPlanCardProps {
  plan: {
    id: string;
    name: string;
    projected_retirement_savings: number;
    assets_last_until_age: number;
    current_savings_rate: number;
    status: string;
  };
  onOpenPlan: (planId: string) => void;
}

const SavedPlanCard = ({ plan, onOpenPlan }: SavedPlanCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const isOnTrack = status === 'on_track';
    return (
      <Badge 
        variant={isOnTrack ? "default" : "destructive"}
        className={isOnTrack ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isOnTrack ? "On Track" : "Needs Attention"}
      </Badge>
    );
  };

  return (
    <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50 dark:shadow-lg dark:shadow-black/20 hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900 dark:text-white">{plan.name}</CardTitle>
          {getStatusBadge(plan.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Projected Retirement:</span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(plan.projected_retirement_savings)}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Assets Last Until:</span>
            <div className="font-semibold text-gray-900 dark:text-white">Age {plan.assets_last_until_age}</div>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current Savings Rate:</span>
          <div className="font-semibold text-gray-900 dark:text-white">{plan.current_savings_rate.toFixed(1)}%</div>
        </div>
        <Button 
          onClick={() => onOpenPlan(plan.id)}
          className="w-full mt-4 bg-green-600 hover:bg-green-700"
        >
          Open Plan
        </Button>
      </CardContent>
    </Card>
  );
};

export default SavedPlanCard;
