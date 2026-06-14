"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Home, Users, FileSpreadsheet, Settings, LogOut, Bell, MessageSquare, Calculator } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Split Calculator", href: "/dashboard/calculator", icon: Calculator },
  { name: "Groups", href: "/dashboard/groups", icon: Users },
  { name: "Import", href: "/dashboard/import", icon: FileSpreadsheet },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      user: "Aisha",
      initial: "A",
      message: 'added a new expense "Dinner".',
      time: "2 hours ago",
      color: "indigo"
    },
    {
      id: 2,
      user: "Rohan",
      initial: "R",
      message: "settled up with you.",
      time: "Yesterday",
      color: "emerald"
    }
  ]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div 
      className="flex h-screen bg-cover bg-center bg-fixed bg-slate-50 dark:bg-slate-900"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2500&auto=format&fit=crop')" }}
    >
      {/* Sidebar */}
      <div className="hidden w-64 flex-col bg-white/70 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:bg-slate-900/80 border-r border-white/40 dark:border-slate-800/50 md:flex">
        <div className="flex h-16 shrink-0 items-center px-6">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            SplitWise Clone
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-slate-400 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-white/40 bg-white/40 px-8 shadow-sm dark:border-slate-800/50 dark:bg-slate-900/40 backdrop-blur-md">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white drop-shadow-sm">
            {navigation.find((n) => n.href === pathname)?.name || "Dashboard"}
          </h1>
          
          {/* Notifications, Theme Toggle & Profile in Header */}
          <div className="flex items-center gap-4">
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white/80 p-4 shadow-xl backdrop-blur-xl dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800/50 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center">
                        <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div key={notif.id} className={cn("flex gap-3 text-sm", idx !== notifications.length - 1 ? "border-b border-slate-100 dark:border-slate-800 pb-3" : "")}>
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center font-bold shrink-0",
                            notif.color === "indigo" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                          )}>
                            {notif.initial}
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white">
                              <span className="font-semibold">{notif.user}</span> {notif.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <ThemeToggle />
            
            <Link href="/dashboard/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer border-l pl-4 border-slate-300 dark:border-slate-700">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white drop-shadow-sm">Test User</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">test@example.com</p>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/60 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="h-full w-full object-cover" 
                />
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
