'use client';

import Link from 'next/link';
import { LayoutDashboard, Users, Clock, Archive, HelpCircle, LogOut, Plus } from 'lucide-react';
import { useOkrStore } from '../lib/store';

export default function Sidebar() {
  const { setNewObjModalOpen } = useOkrStore();

  return (
    <aside className="w-64 bg-[#FAFAFA] border-r border-gray-200 h-screen flex flex-col shrink-0 z-20">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8B5F2E] rounded flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">OKR Management System</h1>
            <p className="text-xs text-gray-500">Process Engineering Hefei</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 bg-white text-[#8B5F2E] font-medium rounded-md shadow-sm border border-gray-100 relative overflow-hidden group hover:brightness-95 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B5F2E]"></div>
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-sm">OKR Explorer</span>
        </Link>
        <Link href="/leadership" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-sm">Leadership Dashboard</span>
        </Link>
        <Link href="/teams" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <Users className="w-5 h-5" />
          <span className="text-sm">Teams</span>
        </Link>
        <Link href="/cycles" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <Clock className="w-5 h-5" />
          <span className="text-sm">Cycles</span>
        </Link>
        <Link href="/archive" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <Archive className="w-5 h-5" />
          <span className="text-sm">Archive</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200 bg-[#FAFAFA] space-y-4">
        <button 
          onClick={() => setNewObjModalOpen(true)}
          className="w-full bg-[#D97706] hover:bg-[#B45309] text-white py-2.5 px-4 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          New Objective
        </button>
        <div className="space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 w-full text-left rounded-md transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Help Center</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 w-full text-left rounded-md transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
