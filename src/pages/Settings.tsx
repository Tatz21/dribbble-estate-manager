import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Settings as SettingsIcon, User, Bell, Shield, Building, Palette, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@realestate.com',
    phone: '+91 98765 43210',
    company: 'RealEstate Pro',
    address: 'Mumbai, Maharashtra, India'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    leadAlerts: true,
    meetingReminders: true,
    paymentAlerts: true
  });

  const [company, setCompany] = useState({
    name: 'RealEstate Pro',
    address: 'Mumbai, Maharashtra, India',
    phone: '+91 98765 43210',
    email: 'contact@realestate.com',
    website: 'www.realestate.com',
    gstNumber: '27AAPCS1234A1ZX',
    reraNumber: 'MH12345678'
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    dateFormat: 'dd/mm/yyyy',
    currency: 'inr'
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSave = () => {
    // Here you would normally save to database
    toast({
      title: "Settings saved",
      description: "All your settings have been successfully updated.",
    });
  };

  const handlePasswordUpdate = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (security.newPassword.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Here you would update the password
    toast({
      title: "Password updated",
      description: "Your password has been successfully changed.",
    });
    
    setSecurity({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
          </div>
          <Button onClick={handleSave} className="btn-gradient">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile({...profile, company: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lead-alerts">Lead Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about new leads</p>
                    </div>
                    <Switch
                      id="lead-alerts"
                      checked={notifications.leadAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, leadAlerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="meeting-reminders">Meeting Reminders</Label>
                      <p className="text-sm text-muted-foreground">Reminders for upcoming meetings</p>
                    </div>
                    <Switch
                      id="meeting-reminders"
                      checked={notifications.meetingReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, meetingReminders: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment-alerts">Payment Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notifications for payment updates</p>
                    </div>
                    <Switch
                      id="payment-alerts"
                      checked={notifications.paymentAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, paymentAlerts: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Settings */}
          <TabsContent value="company">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={company.name}
                      onChange={(e) => setCompany({...company, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={company.email}
                      onChange={(e) => setCompany({...company, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input
                      id="company-phone"
                      value={company.phone}
                      onChange={(e) => setCompany({...company, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={company.website}
                      onChange={(e) => setCompany({...company, website: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gst-number">GST Number</Label>
                    <Input
                      id="gst-number"
                      value={company.gstNumber}
                      onChange={(e) => setCompany({...company, gstNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rera-number">RERA Number</Label>
                    <Input
                      id="rera-number"
                      value={company.reraNumber}
                      onChange={(e) => setCompany({...company, reraNumber: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-address">Address</Label>
                  <Textarea
                    id="company-address"
                    value={company.address}
                    onChange={(e) => setCompany({...company, address: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="current-password" 
                      type={showPasswords.current ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="new-password" 
                      type={showPasswords.new ? "text" : "password"}
                      value={security.newPassword}
                      onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showPasswords.confirm ? "text" : "password"}
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={handlePasswordUpdate} className="btn-gradient">
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="light" 
                        name="theme" 
                        value="light"
                        checked={appearance.theme === 'light'}
                        onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                      />
                      <label htmlFor="light">Light</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="dark" 
                        name="theme" 
                        value="dark"
                        checked={appearance.theme === 'dark'}
                        onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                      />
                      <label htmlFor="dark">Dark</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="system" 
                        name="theme" 
                        value="system"
                        checked={appearance.theme === 'system'}
                        onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                      />
                      <label htmlFor="system">System</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <select 
                    id="language"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background mt-2"
                    value={appearance.language}
                    onChange={(e) => setAppearance({...appearance, language: e.target.value})}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                    <option value="gu">Gujarati</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <select 
                    id="date-format"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background mt-2"
                    value={appearance.dateFormat}
                    onChange={(e) => setAppearance({...appearance, dateFormat: e.target.value})}
                  >
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select 
                    id="currency"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background mt-2"
                    value={appearance.currency}
                    onChange={(e) => setAppearance({...appearance, currency: e.target.value})}
                  >
                    <option value="inr">INR (₹)</option>
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (€)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}