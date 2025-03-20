import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationPreference {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  category?: string;
}

export interface NotificationPreferencesProps {
  preferences: NotificationPreference[];
  onToggle: (id: string, enabled: boolean) => void;
  onSave?: () => void;
  title?: string;
  description?: string;
  className?: string;
  showSaveButton?: boolean;
  loading?: boolean;
  grouped?: boolean;
}

const NotificationPreferences = ({
  preferences,
  onToggle,
  onSave,
  title = 'Notification Preferences',
  description = 'Control how and when you receive notifications',
  className,
  showSaveButton = true,
  loading = false,
  grouped = true
}: NotificationPreferencesProps) => {
  // Group preferences by category if needed
  const groupedPreferences = React.useMemo(() => {
    if (!grouped) return { '': preferences };
    
    return preferences.reduce<Record<string, NotificationPreference[]>>((acc, pref) => {
      const category = pref.category || '';
      if (!acc[category]) acc[category] = [];
      acc[category].push(pref);
      return acc;
    }, {});
  }, [preferences, grouped]);

  const sortedCategories = Object.keys(groupedPreferences).sort();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedCategories.map((category) => (
            <div key={category} className="space-y-4">
              {category && <h3 className="text-sm font-medium">{category}</h3>}
              
              <div className="space-y-4">
                {groupedPreferences[category].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between space-x-2">
                    <div>
                      <Label 
                        htmlFor={pref.id} 
                        className="cursor-pointer font-medium text-sm"
                      >
                        {pref.label}
                      </Label>
                      {pref.description && (
                        <p className="text-xs text-muted-foreground">
                          {pref.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      id={pref.id}
                      checked={pref.enabled}
                      onCheckedChange={(checked) => onToggle(pref.id, checked)}
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {showSaveButton && onSave && (
            <Button 
              onClick={onSave} 
              className="mt-4" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences; 