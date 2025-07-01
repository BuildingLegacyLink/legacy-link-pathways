
import { useState } from 'react';
import { Target, TrendingUp, DollarSign, Calculator, PieChart, Shield } from 'lucide-react';
import GoalsSection from './facts/GoalsSection';
import NetWorthSection from './facts/NetWorthSection';
import IncomeSection from './facts/IncomeSection';
import ExpensesSection from './facts/ExpensesSection';
import SavingsSection from './facts/SavingsSection';

const PlanningFacts = () => {
  const [activeFactsTab, setActiveFactsTab] = useState('goals');

  const factsItems = [
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'networth', name: 'Net Worth', icon: TrendingUp },
    { id: 'income', name: 'Income', icon: DollarSign },
    { id: 'expenses', name: 'Expenses', icon: Calculator },
    { id: 'savings', name: 'Savings', icon: PieChart },
    { id: 'allocation', name: 'Asset Allocation', icon: Shield }
  ];

  const renderFactsContent = () => {
    switch (activeFactsTab) {
      case 'goals':
        return <GoalsSection />;
      case 'networth':
        return <NetWorthSection />;
      case 'income':
        return <IncomeSection />;
      case 'expenses':
        return <ExpensesSection />;
      case 'savings':
        return <SavingsSection />;
      default:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{factsItems.find(item => item.id === activeFactsTab)?.name}</h3>
            <p className="text-gray-600 dark:text-gray-300">Content for {factsItems.find(item => item.id === activeFactsTab)?.name} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800/50 border-r dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">YOUR FACTS</h3>
          <nav className="space-y-2">
            {factsItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => setActiveFactsTab(item.id)}
                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                  activeFactsTab === item.id
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-l-4 border-green-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 bg-white dark:bg-[#08090a]">
        <div className="max-w-4xl">
          {renderFactsContent()}
        </div>
      </div>
    </div>
  );
};

export default PlanningFacts;
