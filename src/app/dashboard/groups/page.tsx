"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, ChevronRight, Trash2 } from "lucide-react";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");

  useEffect(() => {
    // Read from localStorage to mock a real database since MongoDB is blocked
    const savedGroups = localStorage.getItem("mock_groups");
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      const initialGroups = [
        { id: "1", name: "Apartment 4B", memberCount: 3, lastActive: "2 days ago" },
        { id: "2", name: "Goa Trip 2024", memberCount: 6, lastActive: "1 week ago" }
      ];
      setGroups(initialGroups as any);
      localStorage.setItem("mock_groups", JSON.stringify(initialGroups));
    }
    setIsLoading(false);
  }, []);

  const saveGroups = (newGroups: any) => {
    setGroups(newGroups);
    localStorage.setItem("mock_groups", JSON.stringify(newGroups));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const emailsArray = memberEmails.split(",").filter(e => e.trim() !== "");
    const newGroup = {
      id: Math.random().toString(36).substring(7),
      name: groupName,
      memberCount: emailsArray.length + 1, // +1 for the creator
      lastActive: "Just now"
    };
    saveGroups([newGroup, ...groups]);
    setShowCreateModal(false);
    setGroupName("");
    setMemberEmails("");
  };

  const handleDeleteGroup = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // prevent clicking the Link
    e.stopPropagation();
    const filtered = groups.filter((g: any) => g.id !== id);
    saveGroups(filtered);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Groups</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your shared expenses and memberships</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group: any) => (
          <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
            <div className="group flex h-full cursor-pointer flex-col justify-between rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/60 dark:hover:border-indigo-500/50 relative">
              
              {/* Delete Button */}
              <button 
                onClick={(e) => handleDeleteGroup(group.id, e)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                title="Delete Group"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white pr-8">{group.name}</h3>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>{group.memberCount} Members</span>
                <span className="flex items-center group-hover:text-indigo-500 transition-colors">
                  Open <ChevronRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
        
        {groups.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
             <p className="text-slate-500">No groups left. Create one to get started!</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create New Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input 
                  id="name" 
                  required 
                  placeholder="e.g. Apartment 4B" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="members">Add Members (Emails)</Label>
                <Input 
                  id="members" 
                  placeholder="alice@mail.com, bob@mail.com" 
                  value={memberEmails}
                  onChange={(e) => setMemberEmails(e.target.value)}
                  className="focus-visible:ring-indigo-500"
                />
                <p className="text-xs text-slate-500">Separate emails with commas</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
