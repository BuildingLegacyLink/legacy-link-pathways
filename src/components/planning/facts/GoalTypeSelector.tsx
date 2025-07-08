import { useState } from 'react';
import { goalTemplates, GoalTemplate } from '@/utils/goalTemplates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GoalTypeSelectorProps {
  selectedTemplate: GoalTemplate | null;
  onTemplateSelect: (template: GoalTemplate) => void;
  onCustomGoal: () => void;
}

const GoalTypeSelector = ({ selectedTemplate, onTemplateSelect, onCustomGoal }: GoalTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose a Goal Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {goalTemplates.map((template) => {
            const IconComponent = template.icon;
            const isSelected = selectedTemplate?.id === template.id;
            
            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                    : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
                } dark:bg-gray-800 dark:border-gray-700`}
                onClick={() => onTemplateSelect(template)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full ${template.color} flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={onCustomGoal}
          className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Create Custom Goal
        </Button>
      </div>
    </div>
  );
};

export default GoalTypeSelector;