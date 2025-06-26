import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { AuthModal } from '@/components/AuthModal';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlanningDashboard from '@/components/planning/PlanningDashboard';
import PlanningFacts from '@/components/planning/PlanningFacts';
import PlanningPlans from '@/components/planning/PlanningPlans';

const Planning = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  
  // Get tab from URL params, default to 'dashboard'
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'facts' || tab === 'plans' ? tab : 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Update tab when URL changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your financial planning dashboard.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border-b">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Financial Planning</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="facts">Facts</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="dashboard" className="space-y-6">
                  <PlanningDashboard />
                </TabsContent>
                
                <TabsContent value="facts" className="space-y-6">
                  <PlanningFacts />
                </TabsContent>
                
                <TabsContent value="plans" className="space-y-6">
                  <PlanningPlans />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
