"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate sending email via backend API
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2500&auto=format&fit=crop')" }}
    >
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white/70 p-8 shadow-2xl backdrop-blur-2xl dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/50 relative">
        
        <Link href="/login" className="absolute top-6 left-6 text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {!isSent ? (
          <>
            <div className="text-center pt-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Forgot Password?
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 px-4">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-6 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 gap-2"
                disabled={isSending || !email}
              >
                {isSending ? "Sending link..." : "Send Reset Link"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Mail className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                We've sent a password recovery link to <br/>
                <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
              </p>
            </div>
            
            <div className="pt-6">
              {/* This is a mock button simulating the user clicking the link in their actual email inbox */}
              <p className="text-xs text-slate-400 mb-3">(Mock Email Inbox Simulator)</p>
              <Link href="/reset-password?token=mock-secure-token-123">
                <Button variant="outline" className="w-full rounded-xl py-6 gap-2 bg-white/50 hover:bg-white/80 border-indigo-200 text-indigo-700 hover:text-indigo-800 transition-all">
                  Click link in email <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
