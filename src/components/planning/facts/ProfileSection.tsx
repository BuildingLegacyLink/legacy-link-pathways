import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  phone_number?: string;
  marital_status?: string;
  spouse_name?: string;
  spouse_dob?: string;
  dependents_data?: string;
  address?: string;
  citizenship_status?: string;
  employment_status?: string;
  occupation?: string;
}

interface Dependent {
  name: string;
  dob: string;
}

const ProfileSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  
  // Store raw input values for date fields to avoid formatting conflicts
  const [rawDateInputs, setRawDateInputs] = useState({
    date_of_birth: '',
    spouse_dob: '',
  });

  // Store raw input values for dependent dates
  const [dependentRawDates, setDependentRawDates] = useState<{[key: number]: string}>({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Helper function to format date to MM/DD/YYYY
  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US');
  };

  // Helper function to parse MM/DD/YYYY date to ISO string
  const parseDateInput = (dateInput: string) => {
    if (!dateInput || dateInput.trim() === '') return '';
    
    // Handle various date formats
    let month, day, year;
    
    // Try MM/DD/YYYY or M/D/YYYY format
    const parts = dateInput.split('/');
    if (parts.length === 3) {
      [month, day, year] = parts;
    } else {
      return ''; // Invalid format
    }
    
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);
    
    // Basic validation
    if (isNaN(monthNum) || isNaN(dayNum) || isNaN(yearNum)) return '';
    if (monthNum < 1 || monthNum > 12) return '';
    if (dayNum < 1 || dayNum > 31) return '';
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return '';
    
    // Create date using UTC to avoid timezone issues
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DD without timezone conversion
    const formattedYear = yearNum.toString();
    const formattedMonth = monthNum.toString().padStart(2, '0');
    const formattedDay = dayNum.toString().padStart(2, '0');
    
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };

  // Helper function to format phone number
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
        // Set raw date inputs for display
        setRawDateInputs({
          date_of_birth: formatDateForDisplay(data.date_of_birth) || '',
          spouse_dob: formatDateForDisplay(data.spouse_dob) || '',
        });
        // Parse dependents data if it exists
        if (data.dependents_data) {
          try {
            const loadedDependents = JSON.parse(data.dependents_data);
            setDependents(loadedDependents);
            // Initialize raw date inputs for dependents
            const rawDates: {[key: number]: string} = {};
            loadedDependents.forEach((dep: Dependent, index: number) => {
              rawDates[index] = formatDateForDisplay(dep.dob) || '';
            });
            setDependentRawDates(rawDates);
          } catch {
            setDependents([]);
            setDependentRawDates({});
          }
        }
      } else {
        // Pre-populate with user sign-up data
        setProfile({
          first_name: user?.user_metadata?.first_name || '',
          last_name: user?.user_metadata?.last_name || '',
          email: user?.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const profileData = {
        ...profile,
        dependents_data: JSON.stringify(dependents),
        id: user.id,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addDependent = () => {
    const newIndex = dependents.length;
    setDependents([...dependents, { name: '', dob: '' }]);
    // Initialize raw date input for the new dependent
    setDependentRawDates(prev => ({ ...prev, [newIndex]: '' }));
  };

  const removeDependent = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
    // Remove the raw date input for this dependent and reindex
    const newRawDates: {[key: number]: string} = {};
    Object.entries(dependentRawDates).forEach(([key, value]) => {
      const keyNum = parseInt(key);
      if (keyNum < index) {
        newRawDates[keyNum] = value;
      } else if (keyNum > index) {
        newRawDates[keyNum - 1] = value;
      }
    });
    setDependentRawDates(newRawDates);
  };

  const updateDependent = (index: number, field: keyof Dependent, value: string) => {
    const newDependents = [...dependents];
    newDependents[index][field] = value;
    setDependents(newDependents);
  };

  const handleDependentDateBlur = (index: number, value: string) => {
    if (value.trim() === '') {
      updateDependent(index, 'dob', '');
      return;
    }
    
    const isoDate = parseDateInput(value);
    if (isoDate) {
      updateDependent(index, 'dob', isoDate);
    }
    // If invalid, keep the raw input so user can continue editing
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setProfile({ ...profile, phone_number: formatted });
  };

  const handleDateChange = (field: keyof typeof rawDateInputs, value: string) => {
    // Update the raw input value as user types
    setRawDateInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleDateBlur = (field: keyof ProfileData, rawValue: string) => {
    // Only parse and validate when user finishes typing
    if (rawValue.trim() === '') {
      setProfile(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    const isoDate = parseDateInput(rawValue);
    if (isoDate) {
      setProfile(prev => ({ ...prev, [field]: isoDate }));
      // Update raw input to show formatted version
      setRawDateInputs(prev => ({ ...prev, [field as keyof typeof rawDateInputs]: formatDateForDisplay(isoDate) }));
    }
    // If invalid, keep the raw input so user can continue editing
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h3>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h3>
        <Button onClick={updateProfile} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profile.first_name || ''}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              placeholder="Enter first name"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile.last_name || ''}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              placeholder="Enter last name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email || user?.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              value={rawDateInputs.date_of_birth}
              onChange={(e) => handleDateChange('date_of_birth', e.target.value)}
              onBlur={(e) => handleDateBlur('date_of_birth', e.target.value)}
              placeholder="MM/DD/YYYY"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone_number || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select value={profile.marital_status || ''} onValueChange={(value) => setProfile({ ...profile, marital_status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="separated">Separated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spouse Information - only show if married */}
          {profile.marital_status === 'married' && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">Spouse Information</h4>
              <div>
                <Label htmlFor="spouseName">Spouse Name</Label>
                <Input
                  id="spouseName"
                  value={profile.spouse_name || ''}
                  onChange={(e) => setProfile({ ...profile, spouse_name: e.target.value })}
                  placeholder="Enter spouse's name"
                />
              </div>
              <div>
                <Label htmlFor="spouseDob">Spouse Date of Birth</Label>
                <Input
                  id="spouseDob"
                  value={rawDateInputs.spouse_dob}
                  onChange={(e) => handleDateChange('spouse_dob', e.target.value)}
                  onBlur={(e) => handleDateBlur('spouse_dob', e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </div>
          )}

          <div>
            <Label>Dependents</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDependent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Dependent
              </Button>
              {dependents.length > 0 && (
                <div className="grid grid-cols-[1fr,120px,auto] gap-2 mb-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</Label>
                  <div></div>
                </div>
              )}
              {dependents.map((dependent, index) => (
                <div key={index} className="grid grid-cols-[1fr,120px,auto] gap-2 items-center">
                  <Input
                    value={dependent.name}
                    onChange={(e) => updateDependent(index, 'name', e.target.value)}
                    placeholder="Name"
                  />
                  <Input
                    value={dependentRawDates[index] || ''}
                    onChange={(e) => setDependentRawDates(prev => ({ ...prev, [index]: e.target.value }))}
                    onBlur={(e) => handleDependentDateBlur(index, e.target.value)}
                    placeholder="MM/DD/YYYY"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDependent(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Enter full address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="citizenship">Citizenship/Residency Status</Label>
            <Select value={profile.citizenship_status || ''} onValueChange={(value) => setProfile({ ...profile, citizenship_status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="citizen">U.S. Citizen</SelectItem>
                <SelectItem value="permanent_resident">Permanent Resident</SelectItem>
                <SelectItem value="temporary_resident">Temporary Resident</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="employment">Employment Status</Label>
            <Select value={profile.employment_status || ''} onValueChange={(value) => setProfile({ ...profile, employment_status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed</SelectItem>
                <SelectItem value="self_employed">Self-Employed</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="occupation">Occupation/Industry</Label>
            <Input
              id="occupation"
              value={profile.occupation || ''}
              onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              placeholder="Enter occupation or industry"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;