
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency';

interface TopSnapshotCardsProps {
  netWorth: number;
  monthlyCashFlow: number;
  financialScore: number;
}

const TopSnapshotCards = ({ netWorth, monthlyCashFlow, financialScore }: TopSnapshotCardsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Cash Flow</p>
              <p className={`text-3xl font-bold ${monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyCashFlow)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Financial Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(financialScore)}`}>
                {financialScore}/100
              </p>
            </div>
            <Target className={`h-8 w-8 ${getScoreColor(financialScore)}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopSnapshotCards;
