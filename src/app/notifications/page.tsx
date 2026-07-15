'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, Check, Trash2, ShieldAlert, Award, Calendar, Heart, 
  Sparkles, CheckCircle2, ArrowLeft, RefreshCw, Eye, EyeOff, BellRing, Settings, Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';

// Fallback notifications list
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n-1',
    type: 'New Government Exam',
    title: 'New Ingestion: SSC CGL 2026 Active',
    message: 'Staff Selection Commission has announced multi-department vacancies. Tap to check academic qualification compatibility details.',
    date: '2026-07-15T09:30:00.000Z', // Today
    isRead: false
  },
  {
    id: 'n-2',
    type: 'Scholarship Deadline',
    title: 'National Scholarship Portal Closes in 5 Days',
    message: 'Pre-Matric & Post-Matric financial assistance registration closing shortly. Confirm marks transcripts are ready.',
    date: '2026-07-14T11:00:00.000Z', // Yesterday
    isRead: false
  },
  {
    id: 'n-3',
    type: 'Scheme Update',
    title: 'PM-KISAN Aadhaar linkage extended',
    message: 'Ministry of Agriculture has extended bank account verification guidelines to 31st August.',
    date: '2026-07-15T06:15:00.000Z', // Today
    isRead: true
  },
  {
    id: 'n-4',
    type: 'Application Reminder',
    title: 'UPSC Civil Services registration status check',
    message: 'Verify document checklist items for your UPSC application prior to official fee payments.',
    date: '2026-07-13T14:00:00.000Z', // This Week
    isRead: false
  },
  {
    id: 'n-5',
    type: 'Saved Opportunity Reminder',
    title: 'Saved Exam: RRB NTPC closing soon',
    message: 'Your tracked railways notification portal ends registrations in 10 days. Ensure category certificates are updated.',
    date: '2026-07-09T08:00:00.000Z', // Over a week ago
    isRead: true
  },
  {
    id: 'n-6',
    type: 'Admin Announcement',
    title: '📢 Unified Opportunities Portal 2.0 Active',
    message: 'Dynamic eligibility checks and side-by-side comparison matrices are now live. No registration required.',
    date: '2026-07-10T12:00:00.000Z',
    isRead: false
  }
];

export default function NotificationsPage() {
  const router = useRouter();
  
  // State variables
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read' | 'today' | 'week'>('all');
  const [pushButtonStatus, setPushButtonStatus] = useState<NotificationPermission>('default');
  const [toast, setToast] = useState<string | null>(null);

  // Load from local storage or defaults
  useEffect(() => {
    const stored = localStorage.getItem('civicai_user_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(DEFAULT_NOTIFICATIONS);
      localStorage.setItem('civicai_user_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }

    // Check browser notification permission status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushButtonStatus(Notification.permission as any);
    }
  }, []);

  const saveState = (updatedList: any[]) => {
    setNotifications(updatedList);
    localStorage.setItem('civicai_user_notifications', JSON.stringify(updatedList));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Actions
  const handleMarkRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n);
    saveState(updated);
    showToast("Notification status updated.");
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveState(updated);
    showToast("All notifications marked as read.");
  };

  const handleDelete = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveState(updated);
    showToast("Notification deleted.");
  };

  const handleClearAll = () => {
    saveState([]);
    showToast("Inbox cleared.");
  };

  // Request push notification permissions (Web Push mock hook)
  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      showToast("Web push is not supported in this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushButtonStatus(permission);
      if (permission === 'granted') {
        showToast("Web push alerts enabled successfully!");
      } else {
        showToast("Push permission denied.");
      }
    } catch (err) {
      console.error('Permission request failed:', err);
    }
  };

  // Filtering Logic
  const getFilteredNotifications = () => {
    const todaySim = new Date('2026-07-15'); // simulated date
    todaySim.setHours(0,0,0,0);
    
    const startOfWeek = new Date(todaySim);
    startOfWeek.setDate(todaySim.getDate() - 7);

    return notifications.filter(n => {
      const date = new Date(n.date);
      
      if (activeTab === 'unread') return !n.isRead;
      if (activeTab === 'read') return n.isRead;
      
      if (activeTab === 'today') {
        const itemDate = new Date(n.date);
        itemDate.setHours(0,0,0,0);
        return itemDate.getTime() === todaySim.getTime();
      }
      
      if (activeTab === 'week') {
        return date >= startOfWeek && date <= new Date('2026-07-15T23:59:59Z');
      }

      return true;
    });
  };

  const filteredNotifs = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-white/10 select-none">
          {toast}
        </div>
      )}

      {/* Header back link */}
      <button 
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      {/* Title block */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 select-none">
            <BellRing className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Citizen Alert Desk</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Notification Center</h1>
          <p className="text-foreground-muted text-sm mt-0.5">Stay updated with newly ingested exams, yojanas updates, and deadlines.</p>
        </div>

        {unreadCount > 0 && (
          <span className="text-xs font-bold px-3 py-1 bg-primary text-white rounded-full select-none shadow-sm shadow-primary/20 animate-pulse">
            {unreadCount} Unread Message{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Main Inbox layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left column filters drawer */}
        <div className="space-y-6 lg:sticky lg:top-24 select-none">
          
          {/* Inbox tabs panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs dark:bg-slate-850 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block px-2 mb-2">Inbox Filters</span>
            
            {(['all', 'unread', 'read', 'today', 'week'] as const).map(tab => {
              let count = 0;
              if (tab === 'all') count = notifications.length;
              else if (tab === 'unread') count = unreadCount;
              else if (tab === 'read') count = notifications.length - unreadCount;
              else if (tab === 'today') {
                const todaySim = new Date('2026-07-15').toDateString();
                count = notifications.filter(n => new Date(n.date).toDateString() === todaySim).length;
              } else if (tab === 'week') {
                const limit = new Date('2026-07-15');
                limit.setDate(limit.getDate() - 7);
                count = notifications.filter(n => new Date(n.date) >= limit).length;
              }

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-primary/5 text-primary border border-primary/10' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <span className="capitalize">{tab === 'week' ? 'This Week' : tab}</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-extrabold px-1.5 py-0.5 rounded">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Web Push Configuration */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-3xl p-6 space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-primary" /> Web Push Alerts
            </h3>
            <p className="text-[11px] text-slate-505 leading-relaxed font-semibold">
              Enable instant browser push alerts to monitor deadline reminders when offline.
            </p>
            
            {pushButtonStatus === 'granted' ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold">
                <CheckCircle2 className="h-4 w-4" /> Web Push Active
              </div>
            ) : (
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleEnablePush}
                disabled={pushButtonStatus === 'denied'}
                className="py-2 text-xs font-bold rounded-xl cursor-pointer"
              >
                {pushButtonStatus === 'denied' ? 'Permission Blocked' : 'Enable Browser Push'}
              </Button>
            )}
          </div>

        </div>

        {/* Right column main feed stream */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Action toolbar */}
          {notifications.length > 0 && (
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl select-none text-xs font-bold">
              <span className="text-slate-400">Filter matches: {filteredNotifs.length} alerts</span>
              
              <div className="flex gap-4">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Mark all read
                  </button>
                )}
                <button 
                  onClick={handleClearAll}
                  className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Clear inbox
                </button>
              </div>
            </div>
          )}

          {/* Alert feeds */}
          {filteredNotifs.length === 0 ? (
            <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
              <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-3 opacity-60" />
              <h3 className="font-extrabold text-slate-700 dark:text-white text-base">Notification inbox clean</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">No notification alerts match your selected filters. You will be alerted when new updates are verified.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifs.map(notif => {
                const dateObj = new Date(notif.date);
                const timeString = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const dateString = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return (
                  <div 
                    key={notif.id}
                    className={`bg-white border rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-xs transition-shadow flex gap-4 relative overflow-hidden dark:bg-slate-850 dark:border-slate-800 ${
                      notif.isRead ? 'border-slate-200' : 'border-primary/20 dark:border-primary/30'
                    }`}
                  >
                    {/* Unread left border highlight bar */}
                    {!notif.isRead && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    )}

                    {/* Left Category Icon */}
                    <div className={`p-3 rounded-2xl shrink-0 self-start select-none ${
                      notif.type.includes('Exam') 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' 
                        : notif.type.includes('Deadline') 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                        : notif.type.includes('Scheme')
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                    }`}>
                      {notif.type.includes('Exam') ? <Calendar className="h-5 w-5" /> : notif.type.includes('Deadline') ? <Bell className="h-5 w-5" /> : notif.type.includes('Scheme') ? <Heart className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                    </div>

                    {/* Middle Text info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5 select-none">
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider bg-slate-50 dark:bg-slate-900 border border-slate-150 px-2 py-0.5 rounded dark:border-slate-800">
                          {notif.type}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-bold ml-auto flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {dateString}, {timeString}
                        </span>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-850 dark:text-white leading-snug">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-slate-500 leading-relaxed mt-1.5 font-medium">
                        {notif.message}
                      </p>
                    </div>

                    {/* Right action triggers */}
                    <div className="flex flex-col gap-1.5 justify-between select-none">
                      <button 
                        onClick={() => handleMarkRead(notif.id)}
                        className={`p-1.5 rounded-lg border text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer ${
                          notif.isRead ? 'border-slate-200' : 'border-primary/10 bg-primary/5 text-primary'
                        }`}
                        title={notif.isRead ? 'Mark Unread' : 'Mark Read'}
                      >
                        {notif.isRead ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>

                      <button 
                        onClick={() => handleDelete(notif.id)}
                        className="p-1.5 border border-rose-100 hover:border-rose-250 dark:border-rose-900/30 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-450 hover:text-rose-600 transition-all cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
