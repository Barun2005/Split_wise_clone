"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Search, Phone, Video, Info, Check, CheckCheck, ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_CONTACTS = [
  { id: 1, name: "Aisha", initial: "A", lastMessage: "See you tomorrow!", time: "10:30 AM", unread: 2, online: true, color: "indigo" },
  { id: 2, name: "Rohan", initial: "R", lastMessage: "I just sent the money.", time: "Yesterday", unread: 0, online: false, color: "emerald" },
  { id: 3, name: "Priya", initial: "P", lastMessage: "Can we split the cab?", time: "Monday", unread: 0, online: true, color: "rose" },
  { id: 4, name: "Apartment 4B Group", initial: "4", lastMessage: "Rent is due on the 1st.", time: "Last week", unread: 0, online: false, color: "slate" },
];

export default function MessagesPage() {
  const [activeContactId, setActiveContactId] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "Hey! Are we still on for dinner tonight?", time: "10:15 AM", isMe: false },
    { id: 2, text: "Yes absolutely! What time?", time: "10:20 AM", isMe: true, read: true },
    { id: 3, text: "Let's do 7:30 PM at the Italian place.", time: "10:22 AM", isMe: false },
    { id: 4, text: "Perfect. See you tomorrow!", time: "10:30 AM", isMe: false },
  ]);

  const activeContact = MOCK_CONTACTS.find(c => c.id === activeContactId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        read: false
      }
    ]);
    setNewMessage("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');
      const fileUrl = URL.createObjectURL(file);
      
      setMessages([
        ...messages,
        {
          id: Date.now(),
          text: `Shared a ${isImage ? 'photo' : 'document'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          read: false,
          attachmentUrl: fileUrl,
          attachmentType: isImage ? 'image' : 'document'
        }
      ]);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-xl dark:border-slate-700/50 dark:bg-slate-900/60 flex overflow-hidden">
      
      {/* Left Sidebar: Contact List */}
      <div className="w-80 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col bg-white/30 dark:bg-slate-900/30">
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search chats..." 
              className="pl-9 bg-white/50 dark:bg-slate-950/50 border-white/40 dark:border-slate-800 rounded-xl"
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {MOCK_CONTACTS.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                activeContactId === contact.id 
                  ? "bg-indigo-600/10 dark:bg-indigo-500/20" 
                  : "hover:bg-white/50 dark:hover:bg-slate-800/50"
              )}
            >
              <div className="relative shrink-0">
                <div className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg",
                  contact.color === "indigo" && "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
                  contact.color === "emerald" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
                  contact.color === "rose" && "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",
                  contact.color === "slate" && "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                )}>
                  {contact.initial}
                </div>
                {contact.online && (
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className={cn("font-semibold truncate", activeContactId === contact.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white")}>
                    {contact.name}
                  </h4>
                  <span className="text-xs text-slate-500 shrink-0">{contact.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-500 truncate dark:text-slate-400">{contact.lastMessage}</p>
                  {contact.unread > 0 && (
                    <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ml-2">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Active Chat */}
      <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/30">
        
        {/* Chat Header */}
        <div className="h-20 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm",
              activeContact?.color === "indigo" && "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
              activeContact?.color === "emerald" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
              activeContact?.color === "rose" && "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",
              activeContact?.color === "slate" && "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
            )}>
              {activeContact?.initial}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{activeContact?.name}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{activeContact?.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-center mb-8">
            <span className="text-xs font-medium text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">Today</span>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[65%] rounded-2xl px-4 py-3 shadow-sm ${msg.isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 rounded-bl-sm'}`}>
                
                {/* Attachments */}
                {msg.attachmentUrl && msg.attachmentType === 'image' && (
                  <div className="mb-2 mt-1 rounded-xl overflow-hidden border-2 border-white/20 shadow-sm">
                    <img src={msg.attachmentUrl} alt="Attachment" className="max-h-64 w-auto object-cover" />
                  </div>
                )}
                
                {msg.attachmentUrl && msg.attachmentType === 'document' && (
                  <div className={`flex items-center gap-2 mb-2 p-3 rounded-lg ${msg.isMe ? 'bg-indigo-700/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <FileText className="h-6 w-6 shrink-0" />
                    <span className="text-sm font-medium truncate">Document Attached</span>
                  </div>
                )}
                
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                  <span>{msg.time}</span>
                  {msg.isMe && (
                    msg.read ? <CheckCheck className="h-3 w-3 text-indigo-300" /> : <Check className="h-3 w-3 text-indigo-200" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <Input 
              placeholder="Message Aisha..." 
              className="flex-1 rounded-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 h-12 shadow-sm"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim()} 
              className="rounded-full h-12 w-12 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 shrink-0 transition-transform active:scale-95"
            >
              <Send className="h-5 w-5 -ml-0.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
