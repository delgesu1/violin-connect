import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Key, Laptop, Computer, LogOut, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'other';
  browser?: string;
  os?: string;
  ip?: string;
  lastActive: string;
  isCurrentDevice?: boolean;
}

export interface SecuritySectionProps {
  passwordLastChanged?: string;
  devices?: Device[];
  className?: string;
  onChangePassword?: () => void;
  onSignOutDevice?: (deviceId: string) => void;
  onSignOutAllDevices?: () => void;
  hasTwoFactorAuth?: boolean;
  onManageTwoFactorAuth?: () => void;
}

const SecuritySection = ({
  passwordLastChanged,
  devices = [],
  className,
  onChangePassword,
  onSignOutDevice,
  onSignOutAllDevices,
  hasTwoFactorAuth,
  onManageTwoFactorAuth
}: SecuritySectionProps) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const getDeviceIcon = (device: Device) => {
    switch (device.type) {
      case 'desktop':
        return <Computer className="h-10 w-10 text-primary mr-4" />;
      case 'mobile':
        return <Laptop className="h-10 w-10 text-primary mr-4" />;
      case 'tablet':
        return <Laptop className="h-10 w-10 text-primary mr-4" />;
      default:
        return <Computer className="h-10 w-10 text-primary mr-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Security Settings
        </CardTitle>
        <CardDescription>Manage your account security and active sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-medium">Password</h3>
            {onChangePassword && (
              <Button variant="outline" size="sm" onClick={onChangePassword}>
                <Key className="h-4 w-4 mr-1" /> Change Password
              </Button>
            )}
          </div>
          {passwordLastChanged && (
            <p className="text-sm text-muted-foreground">
              Your password was last changed on {formatDate(passwordLastChanged)}
            </p>
          )}
        </div>
        
        {/* Two-Factor Authentication */}
        {onManageTwoFactorAuth && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium">Two-Factor Authentication</h3>
              <Button 
                variant={hasTwoFactorAuth ? "outline" : "default"} 
                size="sm"
                onClick={onManageTwoFactorAuth}
              >
                <Shield className="h-4 w-4 mr-1" /> 
                {hasTwoFactorAuth ? 'Manage 2FA' : 'Enable 2FA'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {hasTwoFactorAuth 
                ? 'Two-factor authentication is enabled for your account.'
                : 'Add an extra layer of security by enabling two-factor authentication.'}
            </p>
          </div>
        )}

        {/* Devices Section */}
        {devices.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium flex items-center">
                <Computer className="mr-2 h-5 w-5 text-primary" />
                Active Devices
              </h3>
              {onSignOutAllDevices && devices.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onSignOutAllDevices}
                >
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out All Devices
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="bg-secondary/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    {getDeviceIcon(device)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{device.name}</p>
                          {device.browser && (
                            <p className="text-sm text-muted-foreground">{device.browser}</p>
                          )}
                          {device.ip && (
                            <p className="text-xs text-muted-foreground">
                              {device.ip} • {device.lastActive}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex items-center">
                          {device.isCurrentDevice && (
                            <Badge className="mr-2">This device</Badge>
                          )}
                          {onSignOutDevice && !device.isCurrentDevice && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onSignOutDevice(device.id)}
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Account Security Warning */}
        {!hasTwoFactorAuth && (
          <Alert className="mt-4 border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-500 dark:border-yellow-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Enhance Your Account Security</AlertTitle>
            <AlertDescription>
              We recommend enabling two-factor authentication to protect your account.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SecuritySection; 