import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@clerk/clerk-react';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';

const Settings = () => {
  const { userId } = useAuth();
  const supabaseUserId = userId ? clerkIdToUuid(userId) : null;
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader 
        title="Settings" 
        description="Manage your account settings and preferences." 
      />
      
      {/* Debug Information */}
      <div className="mb-8 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <div className="space-y-2">
          <div>
            <h3 className="font-medium">Clerk User ID</h3>
            <p className="font-mono text-sm">{userId || 'Not logged in'}</p>
          </div>
          <div>
            <h3 className="font-medium">Supabase UUID</h3>
            <p className="font-mono text-sm">{supabaseUserId || 'Not available'}</p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details and profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">User ID</h3>
                <p className="text-sm text-muted-foreground break-all">{userId}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">Supabase UUID</h3>
                <p className="text-sm text-muted-foreground break-all">{userId ? clerkIdToUuid(userId) : 'Not logged in'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be added in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 