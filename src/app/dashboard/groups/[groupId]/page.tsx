"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Receipt, UserPlus, Users, ArrowLeft, ArrowRight, CheckCircle2, Send, CreditCard, MessageSquare, Paperclip, ImageIcon, FileText, QrCode, BellRing } from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<any>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  
  // Payment State
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [paymentState, setPaymentState] = useState<'IDLE' | 'PROCESSING' | 'SENDING' | 'SUCCESS'>('IDLE');
  const [paymentMethod, setPaymentMethod] = useState("UPI ID / QR Code");

  // WebSocket State
  const { socket, emitPayment } = useSocket(groupId);
  const [incomingPayment, setIncomingPayment] = useState<any>(null);

  // Chat State
  const [newMessage, setNewMessage] = useState("");
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, user: "Aisha", text: "Hey guys, I added the dinner expense!", time: "2 hours ago", isMe: false },
    { id: 2, user: "Rohan", text: "Thanks Aisha! I'll settle up tomorrow.", time: "1 hour ago", isMe: false }
  ]);
  
  useEffect(() => {
    // Read from localStorage to sync with the main groups list
    const savedGroups = localStorage.getItem("mock_groups");
    let foundGroup = null;
    
    if (savedGroups) {
      const parsed = JSON.parse(savedGroups);
      foundGroup = parsed.find((g: any) => g.id === groupId);
    }
    
    if (foundGroup) {
      // Ensure members, expenses, and balances arrays exist for the mock
      const mockBalances = foundGroup.balances && foundGroup.balances.length > 0 
        ? foundGroup.balances 
        : [
            { id: 'b1', from: 'You', to: 'Aisha', amount: 1200 },
            { id: 'b2', from: 'Rohan', to: 'You', amount: 500 }
          ];

      setGroup({
        ...foundGroup,
        members: foundGroup.members || [{ id: '1', name: 'You' }],
        expenses: foundGroup.expenses || [],
        balances: mockBalances
      });
    } else {
      setGroup({
        id: groupId,
        name: "Unknown Group",
        memberCount: 1,
        members: [{ id: '1', name: 'You' }],
        expenses: [],
        balances: [
          { id: 'b1', from: 'You', to: 'Test User', amount: 1500 }
        ]
      });
    }
  }, [groupId]);

  const saveGroupUpdates = (updatedGroup: any) => {
    setGroup(updatedGroup);
    
    // Also update it in the main localStorage array so the dashboard stays synced
    const savedGroups = localStorage.getItem("mock_groups");
    if (savedGroups) {
      let parsed = JSON.parse(savedGroups);
      parsed = parsed.map((g: any) => g.id === updatedGroup.id ? updatedGroup : g);
      localStorage.setItem("mock_groups", JSON.stringify(parsed));
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handlePaymentReceived = (data: any) => {
      // Show the beautiful toast
      setIncomingPayment(data);
      
      // Update local state to remove the debt since they paid it
      setGroup((prev: any) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          balances: prev.balances.filter((b: any) => b.id !== data.debtId)
        };
        // We do not save to localStorage here to avoid conflicts in this simple mock,
        // but UI will instantly update!
        return updated;
      });

      // Hide toast after 5 seconds
      setTimeout(() => setIncomingPayment(null), 5000);
    };

    socket.on("payment_received", handlePaymentReceived);

    return () => {
      socket.off("payment_received", handlePaymentReceived);
    };
  }, [socket]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense = {
      id: Math.random().toString(36).substring(7),
      title: expenseTitle,
      amount: parseFloat(expenseAmount),
      date: new Date().toISOString().split('T')[0],
      paidBy: 'You'
    };
    
    const updatedGroup = {
      ...group,
      expenses: [newExpense, ...group.expenses]
    };
    saveGroupUpdates(updatedGroup);
    
    setShowExpenseModal(false);
    setExpenseTitle("");
    setExpenseAmount("");
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    
    const updatedGroup = {
      ...group,
      memberCount: group.memberCount + 1,
      members: [...group.members, { id: Math.random().toString(), name: newMemberEmail }]
    };
    saveGroupUpdates(updatedGroup);
    
    setShowMemberModal(false);
    setNewMemberEmail("");
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentState('PROCESSING');
    
    // Simulate Payment Gateway Delay
    setTimeout(() => {
      setPaymentState('SENDING');
      
      // Simulate "Sending Money" animation delay
      setTimeout(() => {
        setPaymentState('SUCCESS');
        
        // Update balance and close after 3 seconds of success screen
        setTimeout(() => {
          // Emit the real-time event to everyone else
          emitPayment(selectedDebt.id, selectedDebt.amount, selectedDebt.from, selectedDebt.to);

          const updatedGroup = {
            ...group,
            balances: group.balances.filter((b: any) => b.id !== selectedDebt.id)
          };
          saveGroupUpdates(updatedGroup);
          setShowPaymentModal(false);
          setPaymentState('IDLE');
          setSelectedDebt(null);
        }, 3000);
      }, 1500);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages([
      ...chatMessages,
      {
        id: Date.now(),
        user: "You",
        text: newMessage,
        time: "Just now",
        isMe: true
      }
    ]);
    setNewMessage("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');
      const fileUrl = URL.createObjectURL(file);
      
      setChatMessages([
        ...chatMessages,
        {
          id: Date.now(),
          user: "You",
          text: `Shared a ${isImage ? 'photo' : 'document'}: ${file.name}`,
          time: "Just now",
          isMe: true,
          attachmentUrl: fileUrl,
          attachmentType: isImage ? 'image' : 'document'
        }
      ]);
    }
  };

  if (!group) return <div className="p-8 text-center">Loading group details...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative">
      
      {/* Real-time Incoming Payment Toast */}
      {incomingPayment && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-8 fade-in duration-500">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-start gap-4 max-w-sm">
             <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
               <BellRing className="h-5 w-5 text-emerald-400 animate-bounce" />
             </div>
             <div>
               <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-0.5">Payment Received</h4>
               <p className="text-white font-medium">
                 <span className="font-bold">{incomingPayment.from}</span> just sent you <span className="font-bold text-emerald-400">₹{incomingPayment.amount}</span>!
               </p>
               <p className="text-slate-400 text-xs mt-1">Their debt has been cleared.</p>
             </div>
          </div>
        </div>
      )}

      <Link href="/dashboard/groups" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Groups
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{group.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4" />
            <span>{group.memberCount} Members</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowMemberModal(true)} variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
          <Button onClick={() => setShowExpenseModal(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Balances (1/3 width) */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
            <div className="border-b border-slate-200/50 p-6 dark:border-slate-800/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Group Balances</h2>
            </div>
            <ul className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {group.balances.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">Everyone is settled up!</div>
              ) : group.balances.map((balance: any) => (
                <li key={balance.id} className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{balance.from}</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{balance.to}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-bold text-red-500">₹{balance.amount}</span>
                      {balance.from === 'You' && (
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            setSelectedDebt(balance);
                            setShowPaymentModal(true);
                          }}
                        >
                          Settle Up
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Expenses (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
            <div className="border-b border-slate-200/50 p-6 dark:border-slate-800/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Expenses</h2>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {group.expenses.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No expenses yet. Add one!</div>
              ) : group.expenses.map((expense: any) => (
                <li key={expense.id} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                      <Receipt className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{expense.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Paid by {expense.paidBy} on {expense.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">₹{expense.amount.toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Full-Width Row: Group Chat */}
        <div className="md:col-span-3">
          <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60 overflow-hidden flex flex-col h-[400px]">
            <div className="border-b border-slate-200/50 p-4 dark:border-slate-800/50 flex items-center gap-2 bg-white/50 dark:bg-slate-900/50">
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Group Chat</h2>
            </div>
            
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">No messages yet. Say hello!</div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-sm shadow-sm'}`}>
                      {!msg.isMe && <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{msg.user}</p>}
                      
                      {msg.attachmentUrl && msg.attachmentType === 'image' && (
                        <div className="mb-2 mt-1 rounded-xl overflow-hidden border-2 border-white/20 shadow-sm">
                          <img src={msg.attachmentUrl} alt="Attachment" className="max-h-48 w-auto object-cover" />
                        </div>
                      )}
                      
                      {msg.attachmentUrl && msg.attachmentType === 'document' && (
                        <div className={`flex items-center gap-2 mb-2 p-3 rounded-lg ${msg.isMe ? 'bg-indigo-700/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                          <FileText className="h-6 w-6 shrink-0" />
                          <span className="text-sm font-medium truncate">Document Attached</span>
                        </div>
                      )}
                      
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-2 text-right ${msg.isMe ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input Area */}
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={chatFileRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="rounded-full h-10 w-10 p-0 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0"
                  onClick={() => chatFileRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1 rounded-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" disabled={!newMessage.trim()} className="rounded-full h-10 w-10 p-0 bg-indigo-600 hover:bg-indigo-700 shrink-0">
                  <Send className="h-4 w-4 -ml-0.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Expense Title</Label>
                <Input 
                  id="title" 
                  required 
                  placeholder="e.g. Electricity Bill" 
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="0.00" 
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Invite Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Member Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  required 
                  placeholder="friend@example.com" 
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowMemberModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Add to Group</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentModal && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all flex flex-col">
            
            {/* Top Pattern Header */}
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               {paymentState !== 'SUCCESS' && paymentState !== 'SENDING' && (
                 <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">✕</button>
               )}
            </div>

            <div className="px-8 pb-8 -mt-10 relative z-10 flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl">
              
              {paymentState === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center pt-8 text-emerald-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h3>
                  <p className="text-slate-500 text-center mb-6">You securely sent ₹{selectedDebt.amount} to {selectedDebt.to}.</p>
                  
                  <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-500">Transaction ID</span>
                      <span className="font-mono text-slate-900 dark:text-white">TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="text-slate-900 dark:text-white">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentState === 'SENDING' && (
                <div className="flex flex-col items-center justify-center pt-12 pb-8 animate-in fade-in duration-300">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <div className="h-24 w-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center relative shadow-lg">
                      <Send className="h-10 w-10 text-indigo-600 dark:text-indigo-400 translate-x-1 -translate-y-1 animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 animate-pulse">Sending Money...</h3>
                  <p className="text-slate-500">Securely transferring ₹{selectedDebt.amount} to {selectedDebt.to}</p>
                </div>
              )}

              {(paymentState === 'IDLE' || paymentState === 'PROCESSING') && (
                <>
                  {/* Bill Header Avatar */}
                  <div className="mx-auto h-20 w-20 bg-white dark:bg-slate-900 rounded-full p-1 shadow-md mb-4">
                    <div className="h-full w-full bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                       <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{selectedDebt.to.charAt(0)}</span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-1">Paying</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedDebt.to}</h3>
                  </div>

                  {/* Bill Summary */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <div className="flex justify-between mb-3 text-sm">
                      <span className="text-slate-500">Original Amount</span>
                      <span className="font-medium text-slate-900 dark:text-white">₹{selectedDebt.amount}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-sm pb-4 border-b border-slate-200 dark:border-slate-700 dashed">
                      <span className="text-slate-500">Platform Fee</span>
                      <span className="font-medium text-emerald-600">₹0.00 (Free)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">Total to Pay</span>
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{selectedDebt.amount}</span>
                    </div>
                  </div>

                  <form onSubmit={handleProcessPayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500 uppercase">Pay Using</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <select 
                          className="flex h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white shadow-sm appearance-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option>UPI ID / QR Code</option>
                          <option>Credit / Debit Card</option>
                          <option>Net Banking</option>
                        </select>
                      </div>
                    </div>

                    {paymentMethod === "UPI ID / QR Code" && (
                      <div className="pt-2 pb-2 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                        <div className="bg-white dark:bg-white p-3 rounded-xl shadow-md border border-slate-200 relative group">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${selectedDebt.to.toLowerCase()}@upi&pn=${selectedDebt.to}&am=${selectedDebt.amount}`} 
                            alt="Scan to Pay" 
                            className="h-32 w-32 object-contain"
                          />
                          <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                             <QrCode className="h-8 w-8 text-indigo-600" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 text-center">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 rounded-xl"
                        disabled={paymentState !== 'IDLE'}
                      >
                        {paymentState === 'PROCESSING' ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                            Verifying...
                          </div>
                        ) : (
                          `Pay ₹${selectedDebt.amount}`
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
