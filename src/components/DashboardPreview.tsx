
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, Shield, FileText, Trophy } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const DashboardPreview = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-[#08090a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            See Your Future Dashboard
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get a glimpse of what your personalized financial command center will look like
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-2xl dark:shadow-2xl dark:shadow-black/30 p-8 max-w-6xl mx-auto border border-gray-200/50 dark:border-gray-700/50">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Financial Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-300">Track your progress and build your legacy</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-black/30 transition-shadow dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Net Worth</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(75200)}</p>
                    <p className="text-xs text-green-600">+12% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-black/30 transition-shadow dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Cash Flow</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">+{formatCurrency(620)}</p>
                    <p className="text-xs text-green-600">Healthy surplus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-black/30 transition-shadow dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Active Goals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                    <p className="text-xs text-teal-600">Retirement • Home • Travel</p>
                  </div>
                </div>
              </CardContent>  
            </Card>

            <Card className="hover:shadow-lg dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-black/30 transition-shadow dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">XP Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">120</p>
                    <p className="text-xs text-purple-600">Level 2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50 dark:shadow-lg dark:shadow-black/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-green-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Secure Vault</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">Keep your important documents safe and organized</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>2 documents uploaded</span>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800/50 dark:border-gray-700/50 border border-gray-200/50 dark:shadow-lg dark:shadow-black/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Insights</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">AI-powered recommendations for your financial journey</p>
                <div className="text-sm text-blue-600 font-medium">
                  "Consider increasing your 401k contribution by 2%"
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
