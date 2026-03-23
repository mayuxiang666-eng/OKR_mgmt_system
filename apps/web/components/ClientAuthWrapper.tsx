'use client';

import { useOkrStore } from '../lib/store';
import Login from './Login';
import Sidebar from './Sidebar';
import Topnav from './Topnav';

export default function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  const { currentUser } = useOkrStore();
  
  if (!currentUser) {
    return <Login />;
  }
  
  return (
    <div className="flex h-screen bg-[#FDFCFB] font-inter">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topnav />
        <main className="flex-1 overflow-y-auto px-10 py-8 scroll-smooth relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}
