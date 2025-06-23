
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, Shield } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Financial Dashboard</h1>
          <p className="text-gray-600">Track your progress and build your legacy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Net Worth</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Goals Progress</p>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Legacy Score</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Ready to get started?</h3>
            <p className="text-gray-600 mb-6">Take our 5-minute quiz to build your personalized financial roadmap.</p>
            <button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-teal-600">
              Take the Quiz
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
