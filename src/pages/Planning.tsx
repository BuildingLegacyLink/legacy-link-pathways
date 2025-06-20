
import Header from '@/components/Header';
import { Target, TrendingUp, DollarSign, Calculator, PieChart, Shield } from 'lucide-react';
import { useState } from 'react';

const Planning = () => {
  const [activeTab, setActiveTab] = useState('goals');

  const sidebarItems = [
    { id: 'goals', name: 'Goals', icon: Target, active: true },
    { id: 'networth', name: 'Net Worth', icon: TrendingUp },
    { id: 'income', name: 'Income', icon: DollarSign },
    { id: 'expenses', name: 'Expenses & Taxes', icon: Calculator },
    { id: 'savings', name: 'Savings', icon: PieChart },
    { id: 'allocation', name: 'Asset Allocation', icon: TrendingUp },
    { id: 'insurance', name: 'Insurance', icon: Shield }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'goals':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Goals</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Emergency Fund Goal</h3>
                <p className="text-gray-600 mb-4">Build 6 months of expenses</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">$13,000 / $20,000</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">House Down Payment</h3>
                <p className="text-gray-600 mb-4">Save for 20% down payment</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">$15,000 / $50,000</p>
              </div>
            </div>
          </div>
        );
      case 'networth':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Net Worth Tracking</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">$125,500</div>
                <div className="text-gray-600">Total Net Worth</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-600">$175,000</div>
                  <div className="text-gray-600">Assets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-red-600">$49,500</div>
                  <div className="text-gray-600">Liabilities</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'income':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Income Tracking</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary</span>
                  <span className="font-semibold">$85,000/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Side Business</span>
                  <span className="font-semibold">$1,200/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Income</span>
                  <span className="font-semibold">$300/month</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total Monthly Income</span>
                  <span>$8,583</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{sidebarItems.find(item => item.id === activeTab)?.name}</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Content for {sidebarItems.find(item => item.id === activeTab)?.name} coming soon...</p>
            </div>
          </div>
        );
    }
  };

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
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    activeTab === item.id
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
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
