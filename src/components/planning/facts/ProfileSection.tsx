import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  phone_number?: string;
  marital_status?: string;
  dependents_count?: number;
  dependents_ages?: string;
  address?: string;
  citizenship_status?: string;
  employment_status?: string;
  occupation?: string;
}

const ProfileSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dependentAges, setDependentAges] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        // Parse dependent ages if they exist
        if (data.dependents_ages) {
          try {
            setDependentAges(JSON.parse(data.dependents_ages));
          } catch {
            setDependentAges([]);
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
        dependents_ages: JSON.stringify(dependentAges),
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

  const addDependentAge = () => {
    setDependentAges([...dependentAges, '']);
  };

  const removeDependentAge = (index: number) => {
    setDependentAges(dependentAges.filter((_, i) => i !== index));
  };

  const updateDependentAge = (index: number, age: string) => {
    const newAges = [...dependentAges];
    newAges[index] = age;
    setDependentAges(newAges);
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
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !profile.date_of_birth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {profile.date_of_birth ? format(new Date(profile.date_of_birth), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={profile.date_of_birth ? new Date(profile.date_of_birth) : undefined}
                  onSelect={(date) => setProfile({ ...profile, date_of_birth: date?.toISOString().split('T')[0] })}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone_number || ''}
              onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
              placeholder="Enter phone number"
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

          <div>
            <Label>Dependents</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={profile.dependents_count || 0}
                  onChange={(e) => setProfile({ ...profile, dependents_count: parseInt(e.target.value) || 0 })}
                  placeholder="Number of dependents"
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDependentAge}
                >
                  <Plus className="h-4 w-4" />
                  Add Age
                </Button>
              </div>
              {dependentAges.map((age, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={age}
                    onChange={(e) => updateDependentAge(index, e.target.value)}
                    placeholder="Age"
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDependentAge(index)}
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