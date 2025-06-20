
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Clock } from 'lucide-react';

const Quiz = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Build Your Financial Roadmap
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Answer a few questions to get your personalized financial plan
          </p>
          <div className="flex items-center justify-center text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>Takes about 5 minutes</span>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Question 1 of 10</span>
                <span className="text-sm text-gray-500">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full" style={{width: '10%'}}></div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              What's your current age?
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {['18-24', '25-29', '30-34', '35-39'].map((age, index) => (
                <button
                  key={index}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {age}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button className="px-6 py-2 text-gray-600 hover:text-gray-800">
                Back
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600 flex items-center">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
