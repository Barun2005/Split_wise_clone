"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock fetch from localStorage instead of API because of DNS issue
    const savedGroups = localStorage.getItem("mock_groups");
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400">
            <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-500/10">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Owed to You</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₹ 4,500</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            <span>You are owed overall</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-4 text-orange-600 dark:text-orange-400">
            <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-500/10">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total You Owe</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₹ 1,200</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="mr-1 h-4 w-4" />
            <span>Pay back soon</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-400">
            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Groups</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{groups.length}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
            <span>Across all your memberships</span>
          </div>
        </div>
      </div>

      {/* Recent Groups List */}
      <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700/50 dark:bg-slate-900/60">
        <div className="border-b border-slate-200/50 p-6 dark:border-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Groups</h2>
        </div>
        <div className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500">Loading groups...</div>
          ) : groups.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No groups yet</h3>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Create a new group to start splitting expenses.</p>
              <Link href="/dashboard/groups">
                <Button className="mt-6">Create Group</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {groups.map((group: any) => (
                <li key={group.id} className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{group.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{group._count?.members || group.memberCount || 1} members</p>
                  </div>
                  <Link href={`/dashboard/groups/${group.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
