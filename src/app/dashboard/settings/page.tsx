"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, CreditCard, Shield, Moon } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [currency, setCurrency] = useState("INR");
  const [isSaved, setIsSaved] = useState(false);
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Verification State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage("https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=6366f1&color=fff");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    // Simulate secure network verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
        setCurrentPassword("");
        setNewPassword("");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      
      {/* Profile Settings Card */}
      <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6 pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white/60 shadow-md">
              <img 
                src={profileImage} 
                alt="Profile" 
                className="h-full w-full object-cover" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="bg-white/50 hover:bg-white/80"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleRemoveImage}
              >
                Remove
              </Button>
            </div>
          </div>
          <div className="md:ml-auto md:text-right">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account details and personal information.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <select 
              id="currency" 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950/50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-indigo-300"
            >
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="GBP">£ British Pound (GBP)</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
            {isSaved && <span className="text-sm font-medium text-emerald-600">Preferences Saved!</span>}
          </div>
        </form>
      </div>

      {/* Preferences & Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-300">Email alerts for new expenses</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-300">Weekly balance summaries</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Security</h3>
          </div>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordModal(true)}
              className="w-full justify-start bg-white/50 hover:bg-slate-100"
            >
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 bg-white/50 border-red-200">
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Change Password</h3>
            <p className="text-sm text-slate-500 mb-6">Verify your current password to secure your account.</p>
            
            {passwordSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-emerald-600">
                <Shield className="h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">Password Successfully Updated!</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    required 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    required 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowPasswordModal(false)} disabled={isVerifying}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 w-32" disabled={isVerifying}>
                    {isVerifying ? "Verifying..." : "Verify & Save"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
