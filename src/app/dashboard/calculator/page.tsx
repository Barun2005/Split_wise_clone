"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator as CalcIcon, Receipt, Users, Plus, Minus, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalculatorPage() {
  const [subtotal, setSubtotal] = useState<string>("0");
  const [tax, setTax] = useState<string>("0");
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [people, setPeople] = useState<number>(2);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1500);
  };

  // Calculations
  const numSubtotal = parseFloat(subtotal) || 0;
  const numTax = parseFloat(tax) || 0;
  const tipAmount = (numSubtotal * tipPercentage) / 100;
  const grandTotal = numSubtotal + numTax + tipAmount;
  const perPerson = people > 0 ? grandTotal / people : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="rounded-xl bg-indigo-600 p-4 shadow-lg shadow-indigo-500/30">
            <CalcIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Smart Split Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Calculate exact splits including tax and tips instantly.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60 space-y-8">
          
          <div className="space-y-4">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Bill Details</Label>
            
            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Subtotal Amount (₹)</Label>
              <div className="relative">
                <Receipt className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input 
                  type="number"
                  placeholder="0.00"
                  className="pl-10 h-12 text-lg font-medium bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
                  value={subtotal}
                  onChange={(e) => setSubtotal(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Tax Amount (₹)</Label>
              <Input 
                type="number"
                placeholder="0.00"
                className="h-12 font-medium bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tip</Label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{tipPercentage}%</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[0, 10, 15, 20].map((pct) => (
                <Button 
                  key={pct}
                  variant={tipPercentage === pct ? "default" : "outline"}
                  className={cn(
                    "h-12 font-bold transition-all",
                    tipPercentage === pct 
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20" 
                      : "bg-white/50 hover:bg-slate-100 dark:bg-slate-950/50 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setTipPercentage(pct)}
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Split Between</Label>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setPeople(Math.max(1, people - 1))}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{people}</span>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">People</span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setPeople(people + 1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

        </div>

        {/* Right Column: Results */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 blur-[80px] rounded-full opacity-40"></div>
          
          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-widest text-sm mb-2">Grand Total</p>
              <h2 className="text-4xl font-light text-white">₹{grandTotal.toFixed(2)}</h2>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium">₹{numSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax</span>
                <span className="font-medium">₹{numTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tip ({tipPercentage}%)</span>
                <span className="font-medium text-emerald-400">+ ₹{tipAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
              <p className="text-indigo-200 font-semibold uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> Each Person Pays
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">₹{perPerson.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={isSaving || isSaved || grandTotal === 0}
              className={cn(
                "w-full h-14 mt-6 text-lg font-bold rounded-xl transition-all duration-300",
                isSaved 
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                  : "bg-white text-indigo-600 hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              )}
            >
              {isSaving ? (
                <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Saving...</span>
              ) : isSaved ? (
                <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Saved Successfully!</span>
              ) : (
                <span className="flex items-center gap-2">Save as Expense <ArrowRight className="h-5 w-5" /></span>
              )}
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
