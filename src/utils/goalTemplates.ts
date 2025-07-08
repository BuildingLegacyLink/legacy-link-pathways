import { Target, Plane, Heart, Home, GraduationCap, Gift, Users } from 'lucide-react';

export interface GoalTemplate {
  id: string;
  name: string;
  icon: any;
  defaultAmount: number;
  suggestedTimeline: number; // years from now
  description: string;
  color: string;
}

export const goalTemplates: GoalTemplate[] = [
  {
    id: 'retirement',
    name: 'Retirement',
    icon: Target,
    defaultAmount: 1000000,
    suggestedTimeline: 30,
    description: 'Plan for a comfortable retirement with strategic withdrawal order',
    color: 'bg-green-500'
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    defaultAmount: 15000,
    suggestedTimeline: 2,
    description: 'Save for your dream vacation or travel adventure',
    color: 'bg-blue-500'
  },
  {
    id: 'wedding',
    name: 'Wedding',
    icon: Heart,
    defaultAmount: 30000,
    suggestedTimeline: 1,
    description: 'Plan and save for your special day',
    color: 'bg-pink-500'
  },
  {
    id: 'home',
    name: 'Buying a Home',
    icon: Home,
    defaultAmount: 80000,
    suggestedTimeline: 5,
    description: 'Save for a down payment and closing costs',
    color: 'bg-orange-500'
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    defaultAmount: 50000,
    suggestedTimeline: 4,
    description: 'Fund education for yourself or your children',
    color: 'bg-purple-500'
  },
  {
    id: 'celebration',
    name: 'Celebration',
    icon: Gift,
    defaultAmount: 5000,
    suggestedTimeline: 1,
    description: 'Save for a special celebration or milestone event',
    color: 'bg-yellow-500'
  },
  {
    id: 'heirs',
    name: 'Leave to Heirs',
    icon: Users,
    defaultAmount: 500000,
    suggestedTimeline: 25,
    description: 'Build wealth to pass on to future generations',
    color: 'bg-indigo-500'
  }
];

export const getGoalTemplate = (goalType: string): GoalTemplate | undefined => {
  return goalTemplates.find(template => template.id === goalType);
};