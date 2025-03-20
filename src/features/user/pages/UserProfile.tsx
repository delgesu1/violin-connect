import { useState } from "react";
import { UserProfile as ClerkUserProfile } from "@clerk/clerk-react";
import { useDevFallbackUser } from "@/hooks/useDevFallbackUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar, Shield, Key, Laptop, Computer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UserProfilePage = () => {
  const { user, isLoaded } = useDevFallbackUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Mock data for teacher stats - in a real app, this would come from your backend
  const teacherStats = {
    activeStudents: 12,
    lessonsThisWeek: 14,
    lessonsThisMonth: 48,
    teachingHoursThisMonth: 36,
    upcomingLessons: 8,
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="text-center pt-8 pb-4">
              <Avatar className="h-28 w-28 mx-auto border-4 border-background shadow-lg">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Profile"} />
                <AvatarFallback className="text-2xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 px-6">
                <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                <p className="text-muted-foreground">Violin Instructor</p>
                <Badge variant="outline" className="mt-2">Professional</Badge>
              </div>
            </div>
            
            <Separator />
            
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-sm font-medium truncate max-w-[180px]">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-sm font-medium">+1 (555) 123-4567</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="text-sm font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Teaching Statistics
              </CardTitle>
              <CardDescription>Your teaching activity summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{teacherStats.activeStudents}</p>
                    <p className="text-xs text-muted-foreground">Active Students</p>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{teacherStats.lessonsThisWeek}</p>
                    <p className="text-xs text-muted-foreground">Lessons This Week</p>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{teacherStats.lessonsThisMonth}</p>
                    <p className="text-xs text-muted-foreground">Lessons This Month</p>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{teacherStats.teachingHoursThisMonth}</p>
                    <p className="text-xs text-muted-foreground">Teaching Hours This Month</p>
                  </div>
                </div>
                
                <div className="bg-secondary/30 p-4 rounded-lg flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{teacherStats.upcomingLessons}</p>
                    <p className="text-xs text-muted-foreground">Upcoming Lessons</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Profile Management */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="professional">Professional Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Profile Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      Profile Details
                    </h3>
                    <div className="grid gap-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" defaultValue={user?.firstName || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" defaultValue={user?.lastName || ''} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" defaultValue={user?.primaryEmailAddress?.emailAddress || ''} disabled />
                        <p className="text-xs text-muted-foreground mt-1">Your primary email address cannot be changed here.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue="+1 (555) 123-4567" />
                      </div>
                      <Button className="w-full sm:w-auto mt-2">Update Profile</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Security Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-primary" />
                      Security
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="password" className="text-base">Password</Label>
                          <Button variant="outline" size="sm">
                            <Key className="h-4 w-4 mr-1" /> Change Password
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your password was last changed on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Active Devices Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Computer className="mr-2 h-5 w-5 text-primary" />
                      Active Devices
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Laptop className="h-10 w-10 text-primary mr-4" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Macintosh</p>
                                <p className="text-sm text-muted-foreground">Chrome 134.0.0.0</p>
                                <p className="text-xs text-muted-foreground">71.192.143.34 • Today at 12:51 AM</p>
                              </div>
                              <Badge className="ml-2">This device</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Account Actions */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-destructive" />
                      Account Actions
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all of your content.
                      </p>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>App Preferences</CardTitle>
                  <CardDescription>
                    Customize how Violin Connect works for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications" className="text-base">Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about student activities
                      </p>
                    </div>
                    <Switch 
                      id="notifications" 
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <Switch 
                      id="darkMode" 
                      checked={darkModeEnabled}
                      onCheckedChange={setDarkModeEnabled}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="calendarSync" className="text-base">Calendar Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Sync your lessons with external calendars
                      </p>
                    </div>
                    <Switch id="calendarSync" />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="lessonReminders" className="text-base">Lesson Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Send automated reminders before lessons
                      </p>
                    </div>
                    <Switch id="lessonReminders" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Showcase your qualifications and teaching experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Bio</h3>
                    <p className="text-sm text-muted-foreground">
                      Experienced violin instructor with over 10 years of teaching experience. 
                      Specializing in classical and contemporary violin techniques for students of all ages.
                      My approach emphasizes proper technique while nurturing each student's unique musical voice.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Education & Credentials</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Master of Music in Violin Performance - Juilliard School</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Bachelor of Arts in Music Education - University of Michigan</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Certified Suzuki Violin Instructor - Levels 1-5</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Member of the American String Teachers Association</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Teaching Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                      I believe in nurturing each student's unique musical voice while building a strong 
                      technical foundation. My teaching emphasizes proper posture, technique, music theory, 
                      and most importantly, the joy of making music. I tailor my approach to each student's 
                      learning style, goals, and musical interests to create a personalized learning experience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage; 