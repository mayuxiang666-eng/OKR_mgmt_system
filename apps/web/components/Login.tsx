'use client';

import { useOkrStore } from '../lib/store';
import { Target, Lock, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const { users, login } = useOkrStore();
  const [selectedUser, setSelectedUser] = useState(users[0] || '');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) login(selectedUser);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 selection:bg-orange-100">
      <div className="max-w-md w-full">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-[#8B5F2E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
            <Target className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-gray-900 bg-clip-text">Stitch<span className="text-[#8B5F2E]">OKR</span></span>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 pt-10 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D97706] to-[#8B5F2E]"></div>
          
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to access your strategic objectives</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Select Account
              </label>
              <div className="relative">
                <select 
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-3.5 px-4 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5F2E]/50 focus:border-[#8B5F2E] transition-all cursor-pointer"
                >
                  {users.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full group relative flex items-center justify-center gap-2 bg-[#D97706] hover:bg-[#B45309] text-white py-3.5 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Sign In <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            Internal Engineering Platform • Continental AG
          </p>
        </div>
      </div>
    </div>
  );
}
