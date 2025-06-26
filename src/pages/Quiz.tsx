import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Quiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const questions = [
    {
      id: 'personal',
      title: "Let's start with the basics",
      type: 'personal' as const,
      required: true
    },
    {
      id: 'income',
      title: "What's your current income?",
      type: 'income' as const,
      required: true
    },
    {
      id: 'goals',
      title: "What are your top financial goals?",
      type: 'goals' as const,
      required: true
    },
    {
      id: 'assets',
      title: "What assets do you currently have?",
      type: 'assets' as const,
      required: false
    },
    {
      id: 'expenses',
      title: "What are your main monthly expenses?",
      type: 'expenses' as const,
      required: false
    }
  ];

  const saveDataMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('No user');

      // Save income
      if (data.income) {
        const { error: incomeError } = await supabase
          .from('income')
          .insert({
            user_id: user.id,
            name: data.income.name || 'Primary Income',
            type: data.income.type || 'salary',
            amount: parseFloat(data.income.amount),
            frequency: data.income.frequency || 'monthly'
          });
        if (incomeError) throw incomeError;
      }

      // Save goals
      if (data.goals && data.goals.length > 0) {
        const goalsToInsert = data.goals.map((goal: any, index: number) => ({
          user_id: user.id,
          name: goal.name,
          target_amount: parseFloat(goal.amount),
          target_date: goal.date || null,
          description: goal.description || null,
          priority: index + 1
        }));

        const { error: goalsError } = await supabase
          .from('goals')
          .insert(goalsToInsert);
        if (goalsError) throw goalsError;
      }

      // Save assets
      if (data.assets && data.assets.length > 0) {
        const assetsToInsert = data.assets.map((asset: any) => ({
          user_id: user.id,
          name: asset.name,
          type: asset.type,
          value: parseFloat(asset.value)
        }));

        const { error: assetsError } = await supabase
          .from('assets')
          .insert(assetsToInsert);
        if (assetsError) throw assetsError;
      }

      // Save expenses
      if (data.expenses && data.expenses.length > 0) {
        const expensesToInsert = data.expenses.map((expense: any) => ({
          user_id: user.id,
          name: expense.name,
          type: expense.type || 'fixed',
          category: expense.category || 'living',
          amount: parseFloat(expense.amount),
          frequency: 'monthly'
        }));

        const { error: expensesError } = await supabase
          .from('expenses')
          .insert(expensesToInsert);
        if (expensesError) throw expensesError;
      }

      // Update profile with age
      if (data.personal && data.personal.age) {
        const birthYear = new Date().getFullYear() - parseInt(data.personal.age);
        const dateOfBirth = `${birthYear}-01-01`;
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ date_of_birth: dateOfBirth })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Your financial profile has been created!' });
      navigate('/planning');
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to save your data: ' + error.message, variant: 'destructive' });
    }
  });

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete - save data
      console.log('Quiz completed with answers:', answers);
      saveDataMutation.mutate(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const addToArray = (questionId: string, item: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), item]
    }));
  };

  const removeFromArray = (questionId: string, index: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const currentQ = questions[currentQuestion];
  const progressPercentage = Math.round(((currentQuestion + 1) / questions.length) * 100);

  const canProceed = () => {
    if (!currentQ.required) return true;
    
    const answer = answers[currentQ.id];
    
    switch (currentQ.type) {
      case 'personal':
        return answer?.age && answer.age >= 18 && answer.age <= 100;
      case 'income':
        return answer?.amount && parseFloat(answer.amount) > 0;
      case 'goals':
        return answer && answer.length > 0;
      default:
        return true;
    }
  };

  const renderQuestionContent = () => {
    const answer = answers[currentQ.id];

    switch (currentQ.type) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="age" className="text-base font-medium text-gray-700 mb-3 block">
                What's your age?
              </Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={answer?.age || ''}
                onChange={(e) => updateAnswer('personal', { ...answer, age: e.target.value })}
                placeholder="e.g., 30"
                className="text-lg p-4 max-w-xs"
              />
            </div>
          </div>
        );

      case 'income':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="income-name" className="text-base font-medium text-gray-700 mb-3 block">
                  Income Source Name
                </Label>
                <Input
                  id="income-name"
                  value={answer?.name || ''}
                  onChange={(e) => updateAnswer('income', { ...answer, name: e.target.value })}
                  placeholder="e.g., Salary, Freelancing"
                  className="text-lg p-4"
                />
              </div>
              <div>
                <Label htmlFor="income-type" className="text-base font-medium text-gray-700 mb-3 block">
                  Income Type
                </Label>
                <Select value={answer?.type || 'salary'} onValueChange={(value) => updateAnswer('income', { ...answer, type: value })}>
                  <SelectTrigger className="text-lg p-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="business">Business Income</SelectItem>
                    <SelectItem value="rental">Rental Income</SelectItem>
                    <SelectItem value="investment">Investment Income</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="income-amount" className="text-base font-medium text-gray-700 mb-3 block">
                  Monthly Amount ($)
                </Label>
                <Input
                  id="income-amount"
                  type="number"
                  step="1"
                  value={answer?.amount || ''}
                  onChange={(e) => updateAnswer('income', { ...answer, amount: e.target.value })}
                  placeholder="e.g., 5000"
                  className="text-lg p-4"
                />
              </div>
              <div>
                <Label htmlFor="income-frequency" className="text-base font-medium text-gray-700 mb-3 block">
                  Frequency
                </Label>
                <Select value={answer?.frequency || 'monthly'} onValueChange={(value) => updateAnswer('income', { ...answer, frequency: value })}>
                  <SelectTrigger className="text-lg p-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {(answer || []).map((goal: any, index: number) => (
                <Card key={index} className="p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Goal {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromArray('goals', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Goal name (e.g., Emergency Fund)"
                      value={goal.name || ''}
                      onChange={(e) => {
                        const newGoals = [...(answer || [])];
                        newGoals[index] = { ...goal, name: e.target.value };
                        updateAnswer('goals', newGoals);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Target amount ($)"
                      value={goal.amount || ''}
                      onChange={(e) => {
                        const newGoals = [...(answer || [])];
                        newGoals[index] = { ...goal, amount: e.target.value };
                        updateAnswer('goals', newGoals);
                      }}
                    />
                    <Input
                      type="date"
                      placeholder="Target date"
                      value={goal.date || ''}
                      onChange={(e) => {
                        const newGoals = [...(answer || [])];
                        newGoals[index] = { ...goal, date: e.target.value };
                        updateAnswer('goals', newGoals);
                      }}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={goal.description || ''}
                      onChange={(e) => {
                        const newGoals = [...(answer || [])];
                        newGoals[index] = { ...goal, description: e.target.value };
                        updateAnswer('goals', newGoals);
                      }}
                      className="md:col-span-1"
                    />
                  </div>
                </Card>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => addToArray('goals', { name: '', amount: '', date: '', description: '' })}
              className="w-full"
            >
              Add Goal
            </Button>
          </div>
        );

      case 'assets':
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Add any significant assets you own (optional)</p>
            <div className="space-y-4">
              {(answer || []).map((asset: any, index: number) => (
                <Card key={index} className="p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Asset {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromArray('assets', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Asset name (e.g., Savings Account)"
                      value={asset.name || ''}
                      onChange={(e) => {
                        const newAssets = [...(answer || [])];
                        newAssets[index] = { ...asset, name: e.target.value };
                        updateAnswer('assets', newAssets);
                      }}
                    />
                    <Select
                      value={asset.type || 'cash'}
                      onValueChange={(value) => {
                        const newAssets = [...(answer || [])];
                        newAssets[index] = { ...asset, type: value };
                        updateAnswer('assets', newAssets);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="checking">Checking Account</SelectItem>
                        <SelectItem value="savings">Savings Account</SelectItem>
                        <SelectItem value="investment">Investment Account</SelectItem>
                        <SelectItem value="retirement">Retirement Account</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Current value ($)"
                      value={asset.value || ''}
                      onChange={(e) => {
                        const newAssets = [...(answer || [])];
                        newAssets[index] = { ...asset, value: e.target.value };
                        updateAnswer('assets', newAssets);
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => addToArray('assets', { name: '', type: 'cash', value: '' })}
              className="w-full"
            >
              Add Asset
            </Button>
          </div>
        );

      case 'expenses':
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Add your main monthly expenses (optional)</p>
            <div className="space-y-4">
              {(answer || []).map((expense: any, index: number) => (
                <Card key={index} className="p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Expense {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromArray('expenses', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Expense name (e.g., Rent)"
                      value={expense.name || ''}
                      onChange={(e) => {
                        const newExpenses = [...(answer || [])];
                        newExpenses[index] = { ...expense, name: e.target.value };
                        updateAnswer('expenses', newExpenses);
                      }}
                    />
                    <Select
                      value={expense.category || 'living'}
                      onValueChange={(value) => {
                        const newExpenses = [...(answer || [])];
                        newExpenses[index] = { ...expense, category: value };
                        updateAnswer('expenses', newExpenses);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="living">Living Expenses</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="food">Food & Dining</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="debt">Debt Payments</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Monthly amount ($)"
                      value={expense.amount || ''}
                      onChange={(e) => {
                        const newExpenses = [...(answer || [])];
                        newExpenses[index] = { ...expense, amount: e.target.value };
                        updateAnswer('expenses', newExpenses);
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => addToArray('expenses', { name: '', category: 'living', amount: '' })}
              className="w-full"
            >
              Add Expense
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Build Your Financial Profile
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Let's gather some information to create your personalized financial plan
          </p>
          <div className="flex items-center justify-center text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>Takes about 10 minutes</span>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  Step {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Question Content */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {currentQ.title}
            </h2>

            <div className="mb-8">
              {renderQuestionContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || saveDataMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              >
                {saveDataMutation.isPending ? 'Saving...' : currentQuestion === questions.length - 1 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
