
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, TrendingUp, PieChart, AlertTriangle } from 'lucide-react';

const Tools = () => {
  const tools = [
    {
      icon: Calculator,
      title: 'Budget Calculator',
      description: 'Plan your monthly budget and track expenses',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Retirement Planner',
      description: 'See how much you need to save for retirement',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: PieChart,
      title: 'Investment Simulator',
      description: 'Model different investment strategies',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: AlertTriangle,
      title: 'What If? Scenarios',
      description: 'Plan for unexpected life events',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Tools</h1>
          <p className="text-gray-600">Smart calculators and simulators to plan your future</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mb-6`}>
                  <tool.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.title}</h3>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Try it now →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;
