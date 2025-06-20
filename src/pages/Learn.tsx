
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, Clock, CheckCircle } from 'lucide-react';

const Learn = () => {
  const categories = [
    {
      title: 'Core Foundations',
      modules: 8,
      completed: 0,
      description: 'Master the basics of personal finance'
    },
    {
      title: 'Protection Planning',
      modules: 6,
      completed: 0,
      description: 'Learn about insurance and emergency funds'
    },
    {
      title: 'Growth & Legacy Planning',
      modules: 10,
      completed: 0,
      description: 'Build wealth and plan for the future'
    },
    {
      title: 'Life Stage & Special Topics',
      modules: 7,
      completed: 0,
      description: 'Navigate major life events'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Path</h1>
          <p className="text-gray-600">Master personal finance through gamified lessons</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {category.modules} modules
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {category.completed}/{category.modules} completed
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">
                    Start Learning
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Earn Advisor Minutes</h3>
            <p className="text-gray-600">Complete lessons and earn XP to unlock live help with our advisors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learn;
