import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface TimingSelectorProps {
  label: string;
  name: string;
  defaultType?: string;
  defaultValue?: number;
  profile: any;
  required?: boolean;
}

const TimingSelector = ({ label, name, defaultType = 'calendar_year', defaultValue, profile, required = false }: TimingSelectorProps) => {
  const [timingType, setTimingType] = useState(defaultType);
  const firstName = profile?.first_name || 'User';

  const calculateCurrentAge = () => {
    if (!profile?.date_of_birth) return 25;
    const birthDate = new Date(profile.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRetirementYear = () => {
    const currentYear = new Date().getFullYear();
    const currentAge = calculateCurrentAge();
    const retirementAge = profile?.retirement_age || 67;
    return currentYear + (retirementAge - currentAge);
  };

  const getDeathYear = () => {
    const currentYear = new Date().getFullYear();
    const currentAge = calculateCurrentAge();
    const deathAge = profile?.projected_death_age || 85;
    return currentYear + (deathAge - currentAge);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear + i);
  const ages = Array.from({ length: 101 }, (_, i) => i);

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="space-y-3">
        <Select 
          name={`${name}_type`} 
          value={timingType} 
          onValueChange={setTimingType}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
            <SelectItem value="calendar_year">Calendar Year</SelectItem>
            <SelectItem value="age">When {firstName} is</SelectItem>
            <SelectItem value="retirement">{firstName}'s Retirement (age {profile?.retirement_age || 67} in {getRetirementYear()})</SelectItem>
            <SelectItem value="death">{firstName}'s Death (age {profile?.projected_death_age || 85} in {getDeathYear()})</SelectItem>
          </SelectContent>
        </Select>

        {timingType === 'calendar_year' && (
          <Select name={`${name}_value`} defaultValue={defaultValue?.toString()} required={required}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 max-h-60">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {timingType === 'age' && (
          <Select name={`${name}_value`} defaultValue={defaultValue?.toString()} required={required}>
            <SelectTrigger>
              <SelectValue placeholder="Select age" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 max-h-60">
              {ages.map(age => (
                <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(timingType === 'retirement' || timingType === 'death') && (
          <input 
            type="hidden" 
            name={`${name}_value`} 
            value={timingType === 'retirement' ? (profile?.retirement_age || 67) : (profile?.projected_death_age || 85)} 
          />
        )}
      </div>
    </div>
  );
};

export default TimingSelector;