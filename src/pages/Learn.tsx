
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const Learn = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const modules = [
    {
      id: 1,
      title: 'Emergency Fund Basics',
      category: 'Core Foundations',
      description: 'Learn why you need 3-6 months of expenses saved',
      xp: 50,
      completed: false,
      color: 'from-blue-500 to-blue-600',
      questions: [
        {
          question: 'How much should you save in an emergency fund?',
          options: [
            '1 month of expenses',
            '3-6 months of expenses',
            '12 months of expenses',
            'As much as possible'
          ],
          correctAnswer: 1
        },
        {
          question: 'What is the primary purpose of an emergency fund?',
          options: [
            'To invest in stocks',
            'To cover unexpected expenses',
            'To buy luxury items',
            'To pay regular bills'
          ],
          correctAnswer: 1
        },
        {
          question: 'Where should you keep your emergency fund?',
          options: [
            'In stocks',
            'In a high-yield savings account',
            'Under your mattress',
            'In cryptocurrency'
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 2,
      title: 'Understanding Credit Scores',
      category: 'Core Foundations', 
      description: 'Master the factors that affect your credit',
      xp: 75,
      completed: true,
      color: 'from-green-500 to-green-600',
      questions: [
        {
          question: 'What is the highest possible credit score?',
          options: ['750', '800', '850', '900'],
          correctAnswer: 2
        },
        {
          question: 'What factor has the biggest impact on your credit score?',
          options: [
            'Length of credit history',
            'Payment history',
            'Credit utilization',
            'Types of credit'
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 3,
      title: 'Roth vs Traditional IRA',
      category: 'Growth & Legacy Planning',
      description: 'Choose the right retirement account for you',
      xp: 100,
      completed: false,
      color: 'from-purple-500 to-purple-600',
      questions: [
        {
          question: 'When do you pay taxes on a Roth IRA?',
          options: [
            'When you contribute',
            'When you withdraw',
            'Both contribution and withdrawal',
            'Never'
          ],
          correctAnswer: 0
        },
        {
          question: 'What is the main advantage of a Traditional IRA?',
          options: [
            'Tax-free withdrawals',
            'Tax deduction now',
            'No contribution limits',
            'Higher returns'
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 4,
      title: 'Life Insurance 101',
      category: 'Protection Planning',
      description: 'Protect your family\'s financial future',
      xp: 60,
      completed: false,
      color: 'from-orange-500 to-orange-600',
      questions: [
        {
          question: 'What type of life insurance is typically cheaper?',
          options: ['Whole life', 'Term life', 'Universal life', 'Variable life'],
          correctAnswer: 1
        },
        {
          question: 'How much life insurance coverage do most experts recommend?',
          options: [
            '5-10 times annual income',
            '1-2 times annual income',
            '15-20 times annual income',
            'Equal to annual income'
          ],
          correctAnswer: 0
        }
      ]
    }
  ];

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleContinue = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === selectedModule.questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < selectedModule.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  };

  if (selectedModule && showResult) {
    const percentage = Math.round((score / selectedModule.questions.length) * 100);
    const earnedXP = Math.round((percentage / 100) * selectedModule.xp);

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                {percentage >= 70 ? (
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">😕</span>
                  </div>
                )}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
                </h2>
                <p className="text-gray-600 mb-4">
                  You scored {score} out of {selectedModule.questions.length} questions correctly
                </p>
                <div className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</div>
                {percentage >= 70 && (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
                    +{earnedXP} XP Earned!
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={restartQuiz}
                  className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBackToModules}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600"
                >
                  Back to Modules
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedModule) {
    const progress = ((currentQuestion + 1) / selectedModule.questions.length) * 100;
    const currentQ = selectedModule.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button 
              onClick={handleBackToModules}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </button>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {selectedModule.questions.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((progress / 100) * selectedModule.xp)}/{selectedModule.xp} XP
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {currentQ.question}
              </h2>

              <div className="grid grid-cols-1 gap-4 mb-8">
                {currentQ.options.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-4 border-2 rounded-lg transition-colors text-left ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    {answer}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(currentQuestion - 1);
                      setSelectedAnswer(null);
                    } else {
                      handleBackToModules();
                    }
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  {currentQuestion > 0 ? 'Previous' : 'Back'}
                </button>
                <button 
                  onClick={handleContinue}
                  disabled={selectedAnswer === null}
                  className={`px-8 py-2 rounded-lg ${
                    selectedAnswer !== null
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentQuestion < selectedModule.questions.length - 1 ? 'Continue' : 'Finish'}
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="text-3xl font-bold text-green-600 mb-2">1</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {module.questions.length} questions
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
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full" style={{width: '20%'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">1 of 5 modules completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learn;
