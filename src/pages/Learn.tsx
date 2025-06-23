
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, Clock, CheckCircle, ArrowLeft, Lock, Star, Trophy } from 'lucide-react';
import { useState } from 'react';

const Learn = () => {
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const levels = [
    { id: 'beginner', name: 'Beginner', description: 'Financial basics for everyone', color: 'from-green-500 to-green-600' },
    { id: 'intermediate', name: 'Intermediate', description: 'Building solid financial skills', color: 'from-blue-500 to-blue-600' },
    { id: 'advanced', name: 'Advanced', description: 'Strategic financial planning', color: 'from-purple-500 to-purple-600' },
    { id: 'expert', name: 'Expert', description: 'CFP-level expertise', color: 'from-orange-500 to-orange-600' }
  ];

  const coreTopics = [
    { id: 'budgeting', name: 'Budgeting & Cash Flow', icon: '💰' },
    { id: 'saving', name: 'Saving & Emergency Funds', icon: '🏦' },
    { id: 'debt', name: 'Debt & Credit', icon: '💳' },
    { id: 'insurance', name: 'Insurance & Risk', icon: '🛡️' },
    { id: 'investing', name: 'Investment Planning', icon: '📈' },
    { id: 'retirement', name: 'Retirement Planning', icon: '🏖️' },
    { id: 'taxes', name: 'Tax Planning', icon: '📋' },
    { id: 'realestate', name: 'Real Estate & Mortgages', icon: '🏠' },
    { id: 'estate', name: 'Estate Planning & Legacy', icon: '🎭' },
    { id: 'fire', name: 'Financial Independence (FIRE)', icon: '🔥' }
  ];

  const getModulesForLevel = (level: string, topic: any) => {
    const moduleDescriptions = {
      beginner: {
        budgeting: 'Learn to track your money in and out',
        saving: 'Build your first emergency fund',
        debt: 'Understand credit scores and debt basics',
        insurance: 'Protect yourself with basic insurance',
        investing: 'Start investing with index funds',
        retirement: 'Why you need to save for retirement',
        taxes: 'Filing your first tax return',
        realestate: 'Rent vs buy decisions',
        estate: 'Basic wills and beneficiaries',
        fire: 'What is financial independence?'
      },
      intermediate: {
        budgeting: 'Advanced budgeting strategies and tools',
        saving: 'High-yield accounts and CD ladders',
        debt: 'Debt avalanche vs snowball methods',
        insurance: 'Life, disability, and umbrella insurance',
        investing: 'Asset allocation and diversification',
        retirement: '401(k) vs IRA strategies',
        taxes: 'Tax deductions and credits',
        realestate: 'Understanding mortgages and PMI',
        estate: 'Trusts and advanced planning',
        fire: 'Calculate your FIRE number'
      },
      advanced: {
        budgeting: 'Cash flow optimization and forecasting',
        saving: 'Money market accounts and treasury bills',
        debt: 'Refinancing and debt consolidation',
        insurance: 'Self-insurance and risk management',
        investing: 'Tax-loss harvesting and rebalancing',
        retirement: 'Backdoor Roth and mega backdoor',
        taxes: 'Tax-efficient investing strategies',
        realestate: 'Investment properties and REITs',
        estate: 'Estate tax planning and generation-skipping',
        fire: 'Geographic arbitrage and side hustles'
      },
      expert: {
        budgeting: 'Business cash flow and multi-entity planning',
        saving: 'Alternative investments and liquidity planning',
        debt: 'Leveraging debt for wealth building',
        insurance: 'Captive insurance and advanced structures',
        investing: 'Options strategies and alternative investments',
        retirement: 'Defined benefit plans and cash balance plans',
        taxes: 'Tax planning for high-net-worth individuals',
        realestate: 'Commercial real estate and 1031 exchanges',
        estate: 'Dynasty trusts and international planning',
        fire: 'Business exit strategies and wealth preservation'
      }
    };

    return {
      id: `${level}_${topic.id}`,
      title: topic.name,
      level: level,
      description: moduleDescriptions[level][topic.id],
      icon: topic.icon,
      xp: level === 'beginner' ? 25 : level === 'intermediate' ? 50 : level === 'advanced' ? 75 : 100,
      completed: false,
      locked: false, // For demo purposes, we'll keep all unlocked
      questions: [
        {
          question: `What is the most important aspect of ${topic.name.toLowerCase()}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0
        }
      ]
    };
  };

  const handleModuleClick = (module) => {
    if (module.locked) return;
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

  // Quiz result screen
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
                  {percentage >= 70 ? 'Module Complete!' : 'Keep Practicing!'}
                </h2>
                <p className="text-gray-600 mb-4">
                  You scored {score} out of {selectedModule.questions.length} questions correctly
                </p>
                <div className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</div>
                {percentage >= 70 && (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block mb-4">
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
                  Start Next Module
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz question screen
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
              Back to Curriculum
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
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{selectedModule.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentQ.question}
                </h2>
              </div>

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

  // Main curriculum screen
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Literacy Curriculum</h1>
          <p className="text-gray-600">Master personal finance from beginner to expert level</p>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">325</div>
              <div className="text-sm text-gray-600">Total XP Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">8</div>
              <div className="text-sm text-gray-600">Modules Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">45</div>
              <div className="text-sm text-gray-600">Advisor Minutes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">Intermediate</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Choose Your Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {levels.map((level) => (
              <Card 
                key={level.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedLevel === level.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedLevel(level.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${level.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    {level.id === 'beginner' && <Star className="h-6 w-6 text-white" />}
                    {level.id === 'intermediate' && <Award className="h-6 w-6 text-white" />}
                    {level.id === 'advanced' && <Trophy className="h-6 w-6 text-white" />}
                    {level.id === 'expert' && <BookOpen className="h-6 w-6 text-white" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{level.name}</h3>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Curriculum Modules */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize">{selectedLevel} Curriculum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreTopics.map((topic, index) => {
              const module = getModulesForLevel(selectedLevel, topic);
              return (
                <Card 
                  key={module.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    module.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => handleModuleClick(module)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{module.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        {module.locked ? (
                          <Lock className="h-4 w-4 text-gray-400" />
                        ) : module.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                        <span className="ml-1">{module.xp} XP</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Module {index + 1}
                      </div>
                      <button 
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          module.locked 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : module.completed 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        disabled={module.locked}
                      >
                        {module.locked ? 'Locked' : module.completed ? 'Review' : 'Start'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievement Section */}
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Complete Your Level to Unlock the Next!</h3>
            <p className="text-gray-600">Finish all {selectedLevel} modules to advance to the next level</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4 max-w-md mx-auto">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full" style={{width: '30%'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">3 of 10 modules completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learn;
