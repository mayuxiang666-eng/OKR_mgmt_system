'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useOkrStore } from '../lib/store';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api';
import { useI18n } from '../lib/i18n';

export default function NotificationCenter() {
  const { currentUser, notifications, setNotifications, markNotificationAsRead } = useOkrStore();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const data = await listNotifications(currentUser.id);
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, [currentUser, setNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      markNotificationAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    try {
      await markAllNotificationsRead(currentUser.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return t('justNow');
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${t('minutesAgo')}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${t('hoursAgo')}`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50"
        title={t('notifications')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D97706] rounded-full ring-2 ring-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900">{t('notifications')}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider hover:text-[#B45309] transition-colors"
              >
                {t('markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 font-medium">{t('noNotifications')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`px-4 py-4 hover:bg-gray-50 transition-colors relative group ${!n.isRead ? 'bg-[#FFFBEB]/50' : ''}`}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D97706]"></div>
                    )}
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === 'assignment' ? 'bg-blue-50 text-blue-600' :
                        n.type === 'modification' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {n.type === 'assignment' ? <Check className="w-4 h-4" /> : 
                         n.type === 'modification' ? <Clock className="w-4 h-4" /> :
                         <ExternalLink className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className={`text-sm font-semibold truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                            {formatDate(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link 
                            href={n.link}
                            className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-[#D97706] uppercase tracking-wide hover:underline"
                            onClick={() => !n.isRead && handleMarkRead(n.id)}
                          >
                            {t('viewDetails')} <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={() => handleMarkRead(n.id)}
                        className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm border border-orange-100 text-[#D97706] hover:bg-orange-50"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100 text-center bg-gray-50/50">
            <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
              {t('viewAllHistory')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
