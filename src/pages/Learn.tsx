
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, Clock, CheckCircle, Target, TrendingUp, DollarSign, PieChart, Shield, Calculator } from 'lucide-react';
import { useState } from 'react';

const Learn = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedModule, setSelectedModule] = useState(null);

  const sidebarItems = [
    { id: 'goals', name: 'Goals', icon: Target, active: true },
    { id: 'networth', name: 'Net Worth', icon: TrendingUp },
    { id: 'income', name: 'Income', icon: DollarSign },
    { id: 'expenses', name: 'Expenses & Taxes', icon: Calculator },
    { id: 'savings', name: 'Savings', icon: PieChart },
    { id: 'allocation', name: 'Asset Allocation', icon: TrendingUp },
    { id: 'insurance', name: 'Insurance', icon: Shield }
  ];

  const modules = [
    {
      id: 1,
      title: 'Emergency Fund Basics',
      category: 'Core Foundations',
      description: 'Learn why you need 3-6 months of expenses saved',
      xp: 50,
      completed: false,
      questions: 5,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      title: 'Understanding Credit Scores',
      category: 'Core Foundations', 
      description: 'Master the factors that affect your credit',
      xp: 75,
      completed: true,
      questions: 8,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      title: 'Roth vs Traditional IRA',
      category: 'Growth & Legacy Planning',
      description: 'Choose the right retirement account for you',
      xp: 100,
      completed: false,
      questions: 10,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 4,
      title: 'Life Insurance 101',
      category: 'Protection Planning',
      description: 'Protect your family\'s financial future',
      xp: 60,
      completed: false,
      questions: 6,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleModuleClick = (module) => {
    setSelectedModule(module);
  };

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button 
              onClick={() => setSelectedModule(null)}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Back to Modules
            </button>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Question 1 of {selectedModule.questions}</span>
              <span className="text-sm text-gray-500">0/{selectedModule.xp} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full" style={{width: '10%'}}></div>
            </div>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How much should you save in an emergency fund?
              </h2>

              <div className="grid grid-cols-1 gap-4 mb-8">
                {[
                  '1 month of expenses',
                  '3-6 months of expenses', 
                  '12 months of expenses',
                  'As much as possible'
                ].map((answer, index) => (
                  <button
                    key={index}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    {answer}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button className="px-6 py-2 text-gray-600 hover:text-gray-800">
                  Skip
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600">
                  Continue
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">YOUR FACTS</h2>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    item.active 
                      ? 'bg-green-100 text-green-800 border-l-4 border-green-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Modules</h1>
              <p className="text-gray-600">Complete lessons to earn XP and unlock advisor minutes</p>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">125</div>
                  <div className="text-sm text-gray-600">Total XP Earned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">3</div>
                  <div className="text-sm text-gray-600">Modules Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">15</div>
                  <div className="text-sm text-gray-600">Advisor Minutes</div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module) => (
                <Card 
                  key={module.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleModuleClick(module)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center`}>
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        {module.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <Clock className="h-4 w-4 mr-1" />
                        )}
                        {module.xp} XP
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                    <div className="text-xs text-blue-600 mb-4">{module.category}</div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {module.questions} questions
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        module.completed 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}>
                        {module.completed ? 'Review' : 'Start'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Achievement Section */}
            <Card className="mt-8">
              <CardContent className="p-8 text-center">
                <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Keep Learning to Unlock Rewards!</h3>
                <p className="text-gray-600">Complete 5 more modules to earn a free 30-minute advisor session</p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-4 max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full" style={{width: '40%'}}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">2 of 5 modules completed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
