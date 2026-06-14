"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSaving(true);
    
    // Simulate updating password in the database
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Request New Link</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Password Updated!</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your password has been changed successfully. You can now use your new password to log in.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/login">
            <Button className="w-full rounded-xl py-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all">
              Continue to Login <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center pt-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 px-4">
          Please enter your new password below.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 py-6 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30"
          disabled={isSaving || !password || !confirmPassword}
        >
          {isSaving ? "Saving..." : "Update Password"}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2500&auto=format&fit=crop')" }}
    >
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white/70 p-8 shadow-2xl backdrop-blur-2xl dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/50">
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
