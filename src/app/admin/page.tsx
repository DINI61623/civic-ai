/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, UploadCloud, Users, FileText, Database, Loader2, 
  Plus, Edit2, Trash2, Archive, RotateCcw, AlertTriangle, Check, X, 
  Search, ChevronLeft, ChevronRight, Sparkles, UserCheck, Bell, MessageSquare, 
  HelpCircle, ChevronRightSquare, ArrowLeft, RefreshCw, Layers, Lock,
  CheckCircle2, Award, Heart, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FALLBACK_EXAMS, FALLBACK_SCHEMES, FALLBACK_SCHOLARSHIPS, FALLBACK_STATES } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

// Fallback Higher Ed
const FALLBACK_EDUCATION = [
  { id: '1', name: 'National Institute of Technology (NIT)', type: 'Government University', details: 'Premier engineering institutes located across India.', state: 'All India', website: 'https://www.nitcouncil.org.in' },
  { id: '2', name: 'CUET (UG) 2026', type: 'Entrance Exam', details: 'Common University Entrance Test for undergraduate programs.', state: 'All India', website: 'https://cuet.samarth.ac.in' },
  { id: '3', name: 'Prime Minister Research Fellowship (PMRF)', type: 'Fellowship', details: 'Prestigious fellowship for PhD programs in premier institutes.', state: 'All India', website: 'https://pmrf.in' }
];

// Fallback feedback tickets
const FALLBACK_FEEDBACK = [
  { id: 'fb-1', userName: 'Rajesh Kumar', email: 'rajesh@gmail.com', message: 'Could you please add Bihar state post-matric scholarship?', status: 'Pending', date: '2026-07-14' },
  { id: 'fb-2', userName: 'Sunita Sharma', email: 'sunita@gmail.com', message: 'The direct apply link for UPSC Civil Services redirects to main homepage.', status: 'Resolved', date: '2026-07-13' },
  { id: 'fb-3', userName: 'Anil Patil', email: 'anil@gmail.com', message: 'PM-KISAN document checklist prints empty on Chrome mobile browser.', status: 'Pending', date: '2026-07-12' }
];

// Fallback users list
const FALLBACK_USERS = [
  { id: 'u-1', name: 'Aarav Mehta', email: 'aarav@gmail.com', role: 'student', state: 'Gujarat', status: 'Active' },
  { id: 'u-2', name: 'Devendra Singh', email: 'devendra@farmer.org', role: 'farmer', state: 'Punjab', status: 'Active' },
  { id: 'u-3', name: 'Neha Gupta', email: 'neha@gmail.com', role: 'student', state: 'Delhi', status: 'Inactive' },
  { id: 'u-4', name: 'Ramesh Gowda', email: 'ramesh.g@yahoo.com', role: 'farmer', state: 'Karnataka', status: 'Active' }
];

// Fallback site-wide notifications
const FALLBACK_NOTIFICATIONS = [
  { id: 'n-1', title: 'System Maintenance scheduled', message: 'CivicAI portal will be offline on 20th July for server upgrades.', type: 'Alert', date: '2026-07-15' },
  { id: 'n-2', title: 'New UPSC vacancies updated', message: 'SSC CGL exam dates and documents guidelines are now verified.', type: 'Update', date: '2026-07-14' }
];

// Fallback AI knowledge items
const FALLBACK_AI_KB = [
  { id: 'kb-1', title: 'National Education Policy NEP 2020 Guidelines', size: '2.4 MB', type: 'PDF', updated: '2026-07-10' },
  { id: 'kb-2', title: 'Unified Schemes Reservation Quota Matrix', size: '420 KB', type: 'JSON', updated: '2026-07-12' },
  { id: 'kb-3', title: 'State-wise Domicile Eligibility Ingestion rules', size: '1.2 MB', type: 'CSV', updated: '2026-07-14' }
];

type AdminRole = 'Super Admin' | 'Editor' | 'Content Manager';

export default function AdminDashboard() {
  const router = useRouter();

  // Role based access control (RBAC) selection
  const [adminRole, setAdminRole] = useState<AdminRole>('Super Admin');

  // Lists state
  const [exams, setExams] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('civicai_admin_exams');
      return local ? JSON.parse(local) : FALLBACK_EXAMS.map(x => ({ ...x, status: 'Published' }));
    }
    return [];
  });
  const [schemes, setSchemes] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('civicai_admin_schemes');
      return local ? JSON.parse(local) : FALLBACK_SCHEMES.map(x => ({ ...x, status: 'Published' }));
    }
    return [];
  });
  const [scholarships, setScholarships] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('civicai_admin_scholarships');
      return local ? JSON.parse(local) : FALLBACK_SCHOLARSHIPS.map(x => ({ ...x, status: 'Published' }));
    }
    return [];
  });
  const [education, setEducation] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('civicai_admin_education');
      return local ? JSON.parse(local) : FALLBACK_EDUCATION.map(x => ({ ...x, status: 'Published' }));
    }
    return [];
  });
  const [users, setUsers] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('civicai_admin_users');
      return local ? JSON.parse(local) : FALLBACK_USERS;
    }
    return [];
  });
  const [feedback, setFeedback] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('civicai_admin_feedback');
      return local ? JSON.parse(local) : FALLBACK_FEEDBACK;
    }
    return [];
  });
  const [notifications, setNotifications] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('civicai_admin_notifications');
      return local ? JSON.parse(local) : FALLBACK_NOTIFICATIONS;
    }
    return [];
  });
  const [aiKb, setAiKb] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('civicai_admin_ai_kb');
      return local ? JSON.parse(local) : FALLBACK_AI_KB;
    }
    return [];
  });

  // Navigation module tabs
  const [activeModule, setActiveModule] = useState<'overview' | 'users' | 'exams' | 'scholarships' | 'schemes' | 'education' | 'updates' | 'notifications' | 'feedback' | 'ai_kb'>('overview');

  // Search & Pagination & Sorting
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('All');

  // Toast Notification Center
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Dialog Modals confirmation states
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  // Opportunity Builder Form details
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Dynamic form attributes
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formQual, setFormQual] = useState('Graduate');
  const [formAge, setFormAge] = useState('21-32 Years');
  const [formLastDate, setFormLastDate] = useState('2026-12-31');
  const [formStatus, setFormStatus] = useState('Published');
  const [formExtra, setFormExtra] = useState(''); // benefits or admission criteria


  // Toast utility helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Role Checker Access utility
  const verifyAccess = (action: 'create' | 'edit' | 'delete' | 'archive' | 'restore') => {
    if (adminRole === 'Super Admin') return true;
    
    if (adminRole === 'Editor') {
      if (action === 'delete') {
        showToast("Access Denied: Editor role does not have permission to delete entries.", "error");
        return false;
      }
      return true;
    }

    if (adminRole === 'Content Manager') {
      if (action === 'edit') return true;
      showToast(`Access Denied: Content Manager does not have permission to perform ${action} operations.`, "error");
      return false;
    }

    return false;
  };

  // Save list state helper
  const persistState = (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, activeModule]);

  // Action: Create / Edit Save click
  const handleSaveOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyAccess(editingItem ? 'edit' : 'create')) return;

    if (editingItem) {
      // EDIT MODE
      const updated = {
        ...editingItem,
        title: formTitle || editingItem.title,
        name: formTitle || editingItem.name,
        description: formDesc || editingItem.description,
        details: formDesc || editingItem.details,
        qualification: formQual,
        age_limit: formAge,
        last_date: formLastDate,
        application_end_date: formLastDate,
        status: formStatus,
        benefits: formExtra,
        admission_criteria: formExtra
      };

      if (activeModule === 'exams') {
        const list = exams.map(x => x.id === editingItem.id ? updated : x);
        setExams(list);
        persistState('civicai_admin_exams', list);
      } else if (activeModule === 'scholarships') {
        const list = scholarships.map(x => x.id === editingItem.id ? updated : x);
        setScholarships(list);
        persistState('civicai_admin_scholarships', list);
      } else if (activeModule === 'schemes') {
        const list = schemes.map(x => x.id === editingItem.id ? updated : x);
        setSchemes(list);
        persistState('civicai_admin_schemes', list);
      } else if (activeModule === 'education') {
        const list = education.map(x => x.id === editingItem.id ? updated : x);
        setEducation(list);
        persistState('civicai_admin_education', list);
      }
      showToast("Opportunity updated successfully.", "success");
    } else {
      // CREATE MODE
      const newId = Math.random().toString(36).substring(2, 9);
      const newItem = {
        id: newId,
        title: formTitle,
        name: formTitle,
        description: formDesc,
        details: formDesc,
        eligibility: `Requires qualification standard: ${formQual}.`,
        qualification: formQual,
        age_limit: formAge,
        last_date: formLastDate,
        application_start_date: '2026-07-15',
        application_end_date: formLastDate,
        status: formStatus,
        state_id: '187b6a43-0abd-45b5-a2d3-506743532d80',
        state: 'All India',
        official_website: 'https://www.civicai.gov.in',
        apply_link: 'https://www.civicai.gov.in',
        benefits: formExtra,
        admission_criteria: formExtra,
        type: 'Central Opportunity'
      };

      if (activeModule === 'exams') {
        const list = [newItem, ...exams];
        setExams(list);
        persistState('civicai_admin_exams', list);
      } else if (activeModule === 'scholarships') {
        const list = [newItem, ...scholarships];
        setScholarships(list);
        persistState('civicai_admin_scholarships', list);
      } else if (activeModule === 'schemes') {
        const list = [{ ...newItem, ministry: 'Ministry of Home Affairs' }, ...schemes];
        setSchemes(list);
        persistState('civicai_admin_schemes', list);
      } else if (activeModule === 'education') {
        const list = [newItem, ...education];
        setEducation(list);
        persistState('civicai_admin_education', list);
      }
      showToast("Opportunity published successfully.", "success");
    }

    setIsFormOpen(false);
  };

  // Action Trigger: Delete opportunity
  const handleDelete = (id: string) => {
    if (!verifyAccess('delete')) return;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Opportunity',
      message: 'Are you sure you want to permanently delete this listing from the database? This action is irreversible.',
      onConfirm: () => {
        if (activeModule === 'exams') {
          const list = exams.filter(x => x.id !== id);
          setExams(list);
          persistState('civicai_admin_exams', list);
        } else if (activeModule === 'scholarships') {
          const list = scholarships.filter(x => x.id !== id);
          setScholarships(list);
          persistState('civicai_admin_scholarships', list);
        } else if (activeModule === 'schemes') {
          const list = schemes.filter(x => x.id !== id);
          setSchemes(list);
          persistState('civicai_admin_schemes', list);
        } else if (activeModule === 'education') {
          const list = education.filter(x => x.id !== id);
          setEducation(list);
          persistState('civicai_admin_education', list);
        } else if (activeModule === 'users') {
          const list = users.filter(x => x.id !== id);
          setUsers(list);
          persistState('civicai_admin_users', list);
        } else if (activeModule === 'notifications') {
          const list = notifications.filter(x => x.id !== id);
          setNotifications(list);
          persistState('civicai_admin_notifications', list);
        } else if (activeModule === 'feedback') {
          const list = feedback.filter(x => x.id !== id);
          setFeedback(list);
          persistState('civicai_admin_feedback', list);
        } else if (activeModule === 'ai_kb') {
          const list = aiKb.filter(x => x.id !== id);
          setAiKb(list);
          persistState('civicai_admin_ai_kb', list);
        }

        showToast("Record permanently deleted.", "success");
        setConfirmModal(null);
      }
    });
  };

  // Action Trigger: Archive opportunity
  const handleArchive = (id: string) => {
    if (!verifyAccess('archive')) return;

    setConfirmModal({
      isOpen: true,
      title: 'Archive Record',
      message: 'Are you sure you want to move this item to Archive? It will hide from search list feeds.',
      onConfirm: () => {
        if (activeModule === 'exams') {
          const list = exams.map(x => x.id === id ? { ...x, status: 'Archived' } : x);
          setExams(list);
          persistState('civicai_admin_exams', list);
        } else if (activeModule === 'scholarships') {
          const list = scholarships.map(x => x.id === id ? { ...x, status: 'Archived' } : x);
          setScholarships(list);
          persistState('civicai_admin_scholarships', list);
        } else if (activeModule === 'schemes') {
          const list = schemes.map(x => x.id === id ? { ...x, status: 'Archived' } : x);
          setSchemes(list);
          persistState('civicai_admin_schemes', list);
        } else if (activeModule === 'education') {
          const list = education.map(x => x.id === id ? { ...x, status: 'Archived' } : x);
          setEducation(list);
          persistState('civicai_admin_education', list);
        }
        showToast("Listing archived successfully.", "success");
        setConfirmModal(null);
      }
    });
  };

  // Action Trigger: Restore opportunity
  const handleRestore = (id: string) => {
    if (!verifyAccess('restore')) return;

    if (activeModule === 'exams') {
      const list = exams.map(x => x.id === id ? { ...x, status: 'Published' } : x);
      setExams(list);
      persistState('civicai_admin_exams', list);
    } else if (activeModule === 'scholarships') {
      const list = scholarships.map(x => x.id === id ? { ...x, status: 'Published' } : x);
      setScholarships(list);
      persistState('civicai_admin_scholarships', list);
    } else if (activeModule === 'schemes') {
      const list = schemes.map(x => x.id === id ? { ...x, status: 'Published' } : x);
      setSchemes(list);
      persistState('civicai_admin_schemes', list);
    } else if (activeModule === 'education') {
      const list = education.map(x => x.id === id ? { ...x, status: 'Published' } : x);
      setEducation(list);
      persistState('civicai_admin_education', list);
    }
    showToast("Listing restored to active status.", "success");
  };

  // Feedback Resolution status change
  const handleToggleFeedbackStatus = (id: string) => {
    if (!verifyAccess('edit')) return;
    const list = feedback.map(x => x.id === id ? { ...x, status: x.status === 'Resolved' ? 'Pending' : 'Resolved' } : x);
    setFeedback(list);
    persistState('civicai_admin_feedback', list);
    showToast("Feedback status toggled.", "success");
  };

  // Load editor modal inputs
  const openEditForm = (item: any) => {
    setEditingItem(item);
    setFormTitle(item.title || item.name || '');
    setFormDesc(item.description || item.details || '');
    setFormQual(item.qualification || 'Graduate');
    setFormAge(item.age_limit || '21-32 Years');
    setFormLastDate(item.last_date || item.application_end_date || '2026-12-31');
    setFormStatus(item.status || 'Published');
    setFormExtra(item.benefits || item.admission_criteria || '');
    setIsFormOpen(true);
  };

  // Master lists renderer based on active module tab
  const getFilteredDataset = () => {
    let list: any[] = [];
    if (activeModule === 'exams') list = exams;
    else if (activeModule === 'scholarships') list = scholarships;
    else if (activeModule === 'schemes') list = schemes;
    else if (activeModule === 'education') list = education;
    else if (activeModule === 'users') list = users;
    else if (activeModule === 'feedback') list = feedback;
    else if (activeModule === 'notifications') list = notifications;
    else if (activeModule === 'ai_kb') list = aiKb;

    // Search filter
    let filtered = list.filter(item => {
      const q = search.toLowerCase();
      const title = (item.title || item.name || item.userName || '').toLowerCase();
      const desc = (item.description || item.details || item.message || item.email || '').toLowerCase();
      return title.includes(q) || desc.includes(q);
    });

    // Status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Sort sorting
    filtered.sort((a, b) => {
      if (sortBy === 'alpha') {
        const titleA = a.title || a.name || a.userName || '';
        const titleB = b.title || b.name || b.userName || '';
        return titleA.localeCompare(titleB);
      }
      
      const dateA = a.date || a.last_date || a.application_end_date || a.updated || '';
      const dateB = b.date || b.last_date || b.application_end_date || b.updated || '';
      
      if (sortBy === 'newest') {
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }

      return 0;
    });

    return filtered;
  };

  const currentDataset = getFilteredDataset();
  const paginatedDataset = currentDataset.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(currentDataset.length / pageSize) || 1;

  // Stats Counters
  const countStats = {
    totalUsers: users.length,
    students: users.filter(x => x.role === 'student').length,
    farmers: users.filter(x => x.role === 'farmer').length,
    publishedExams: exams.filter(x => x.status === 'Published').length,
    publishedSchemes: schemes.filter(x => x.status === 'Published').length,
    publishedScholarships: scholarships.filter(x => x.status === 'Published').length,
    archived: exams.filter(x => x.status === 'Archived').length + scholarships.filter(x => x.status === 'Archived').length + schemes.filter(x => x.status === 'Archived').length,
    pendingFb: feedback.filter(x => x.status === 'Pending').length
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      
      {/* Toast popup */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl border text-xs font-bold shadow-lg flex items-center gap-2 select-none ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? <Check className="h-4.5 w-4.5" /> : <AlertTriangle className="h-4.5 w-4.5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog Modal */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex gap-4 items-start mb-4">
                <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl shrink-0 dark:bg-rose-950/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{confirmModal.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{confirmModal.message}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" className="text-xs font-bold rounded-xl cursor-pointer" onClick={() => setConfirmModal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" className="text-xs font-bold rounded-xl px-5 bg-rose-500 hover:bg-rose-600 border-transparent shadow-rose-350 cursor-pointer" onClick={confirmModal.onConfirm}>
                  Confirm Action
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header operations controls */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl text-white shadow-md shadow-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Operations Control</h1>
            <p className="text-foreground-muted text-xs md:text-sm mt-0.5">Central system monitoring, admissions ingestion & user catalog reviews.</p>
          </div>
        </div>

        {/* RBAC Role Selector dropdown */}
        <div className="flex items-center gap-2 select-none bg-slate-150/60 dark:bg-slate-900/30 p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <Lock className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">Admin Profile Role:</span>
          <select
            value={adminRole}
            onChange={(e: any) => {
              setAdminRole(e.target.value);
              showToast(`Role switched to ${e.target.value}. Permissions updated.`, "success");
            }}
            className="appearance-none border-0 bg-transparent text-xs font-black text-primary focus:outline-none cursor-pointer outline-none pl-1 pr-6"
          >
            <option value="Super Admin">Super Admin (All Access)</option>
            <option value="Editor">Editor (Publish / Modify)</option>
            <option value="Content Manager">Content Manager (Metadata Review)</option>
          </select>
        </div>
      </div>

      {/* Overview stats cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 select-none">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-850 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total System Users</span>
            <Users className="h-4.5 w-4.5 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{countStats.totalUsers}</p>
          <div className="text-[9px] text-slate-400 font-semibold mt-1">
            Students: {countStats.students} • Farmers: {countStats.farmers}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-850 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Published Listings</span>
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">
            {countStats.publishedExams + countStats.publishedSchemes + countStats.publishedScholarships}
          </p>
          <div className="text-[9px] text-slate-400 font-semibold mt-1">
            Exams: {countStats.publishedExams} • Schemes: {countStats.publishedSchemes} • Schol: {countStats.publishedScholarships}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-850 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Archived Listings</span>
            <Archive className="h-4.5 w-4.5 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{countStats.archived}</p>
          <div className="text-[9px] text-slate-400 font-semibold mt-1">Hiding from catalog search list streams</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-850 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Feedback</span>
            <MessageSquare className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-slate-850 dark:text-white">{countStats.pendingFb}</p>
          <div className="text-[9px] text-slate-400 font-semibold mt-1">Requires review/resolving ticket details</div>
        </div>

      </div>

      {/* Main Admin Sidebar + Feeds Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar module navigation menu tabs */}
        <div className="space-y-1.5 select-none shrink-0">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block px-3 mb-2.5">Dashboard Modules</span>
          
          <button
            onClick={() => setActiveModule('overview')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'overview' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" /> Overview Dashboard
          </button>

          <button
            onClick={() => setActiveModule('users')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'users' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" /> User Directory
          </button>

          <button
            onClick={() => setActiveModule('exams')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'exams' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" /> Government Exams
          </button>

          <button
            onClick={() => setActiveModule('scholarships')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'scholarships' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Award className="h-4 w-4" /> Scholarships
          </button>

          <button
            onClick={() => setActiveModule('schemes')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'schemes' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Heart className="h-4 w-4" /> Welfare Schemes
          </button>

          <button
            onClick={() => setActiveModule('education')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'education' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" /> Higher Education
          </button>

          <button
            onClick={() => setActiveModule('notifications')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'notifications' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Bell className="h-4 w-4" /> Notifications Desk
          </button>

          <button
            onClick={() => setActiveModule('feedback')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'feedback' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" /> Citizen Feedback
          </button>

          <button
            onClick={() => setActiveModule('ai_kb')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeModule === 'ai_kb' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Database className="h-4 w-4" /> AI Knowledge Base
          </button>
        </div>

        {/* Right 3 columns module view screen */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB OVERVIEW */}
          {activeModule === 'overview' && (
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs dark:bg-slate-850">
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Operations Monitor Feed
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-xs leading-normal">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">System check passed (2026-07-15)</strong>
                      <span className="text-slate-400 block mt-0.5">Database connections active, syncing verified government API.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs leading-normal">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">User onboarding rate: 85%</strong>
                      <span className="text-slate-400 block mt-0.5">Aspirants and Farmers completing profile steps.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs leading-normal">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">{countStats.pendingFb} unresolved feedbacks pending</strong>
                      <span className="text-slate-400 block mt-0.5">Citizens requesting updates on state guidelines databases.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingestion triggers */}
              <div className="bg-slate-50 border border-slate-200 dark:border-slate-900/40 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Ingestion Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
                  <Button variant="outline" onClick={() => showToast("Database synchronized with NIC government API.", "success")} className="text-xs font-bold py-2.5 rounded-xl bg-white dark:bg-slate-900 flex justify-center items-center gap-1.5 cursor-pointer">
                    <RefreshCw className="h-4 w-4 text-primary" /> Synch Opportunity Tables
                  </Button>
                  <Button variant="outline" onClick={() => showToast("AI assistant cache rebuilt. Ingested 3 files successfully.", "success")} className="text-xs font-bold py-2.5 rounded-xl bg-white dark:bg-slate-900 flex justify-center items-center gap-1.5 cursor-pointer">
                    <Sparkles className="h-4 w-4 text-indigo-500" /> Reindex AI Knowledge Base
                  </Button>
                </div>
              </div>

            </div>
          )}

          {/* TAB DETAILED LISTS (Exams / Schemes / Scholarships / Education / Users / Feedback / Notifications / AI KB) */}
          {activeModule !== 'overview' && (
            <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs dark:bg-slate-850">
              
              {/* Header List controller */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                
                {/* Search Bar input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all outline-none"
                  />
                </div>

                {/* Status Filter Matrix dropdown */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {['exams', 'schemes', 'scholarships', 'education'].includes(activeModule) && (
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-650 focus:outline-none cursor-pointer outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  )}

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-655 focus:outline-none cursor-pointer outline-none"
                  >
                    <option value="newest">Newest Date</option>
                    <option value="alpha">Alphabetical</option>
                  </select>

                  {['exams', 'scholarships', 'schemes', 'education'].includes(activeModule) && (
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        setEditingItem(null);
                        setFormTitle('');
                        setFormDesc('');
                        setFormQual('Graduate');
                        setFormAge('21-32 Years');
                        setFormLastDate('2026-12-31');
                        setFormStatus('Published');
                        setFormExtra('');
                        setIsFormOpen(true);
                      }}
                      className="text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add New
                    </Button>
                  )}

                </div>
              </div>

              {/* Paginated Listings Table */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentDataset.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500 font-bold">
                    No entries found matching filters.
                  </div>
                ) : (
                  paginatedDataset.map((item) => {
                    return (
                      <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Title Block info */}
                        <div>
                          <div className="flex items-center gap-2 mb-1 select-none">
                            <span className="text-[9px] uppercase font-bold text-slate-400">ID: {item.id}</span>
                            
                            {item.status && (
                              <span className={`text-[8.5px] px-2 py-0.5 rounded font-black border uppercase tracking-wider ${
                                item.status === 'Published' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800'
                              }`}>
                                {item.status}
                              </span>
                            )}

                            {item.role && (
                              <span className="bg-slate-50 text-slate-500 border border-slate-150 text-[8.5px] px-2 py-0.5 rounded font-black uppercase tracking-wider select-none">
                                {item.role}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">
                            {item.title || item.name || item.userName}
                          </h4>
                          
                          <p className="text-[10px] text-slate-400 mt-1 max-w-xl truncate leading-normal">
                            {item.description || item.details || item.message || item.email || item.message}
                          </p>
                        </div>

                        {/* Action buttons controller */}
                        <div className="flex items-center gap-2 self-start sm:self-auto select-none">
                          
                          {/* Ingestion/opportunity actions */}
                          {['exams', 'scholarships', 'schemes', 'education'].includes(activeModule) && (
                            <>
                              <button 
                                onClick={() => openEditForm(item)}
                                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-primary transition-all cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              
                              {item.status !== 'Archived' ? (
                                <button 
                                  onClick={() => handleArchive(item.id)}
                                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-amber-500 transition-all cursor-pointer"
                                  title="Archive Listing"
                                >
                                  <Archive className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleRestore(item.id)}
                                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-emerald-500 transition-all cursor-pointer"
                                  title="Restore Listing"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                              )}

                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 border border-rose-100 hover:border-rose-200 dark:border-rose-900/30 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-450 hover:text-rose-600 transition-all cursor-pointer"
                                title="Delete Listing"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}

                          {/* User directory actions */}
                          {activeModule === 'users' && (
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-650 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Feedback actions */}
                          {activeModule === 'feedback' && (
                            <>
                              <button 
                                onClick={() => handleToggleFeedbackStatus(item.id)}
                                className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                                  item.status === 'Resolved' 
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    : 'bg-amber-50 border-amber-100 text-amber-600'
                                }`}
                              >
                                {item.status === 'Resolved' ? 'Resolved' : 'Pending'}
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-650 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}

                          {/* AI knowledge actions */}
                          {activeModule === 'ai_kb' && (
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-650 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination controls elements */}
              {totalPages > 1 && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center select-none shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold">
                    Page {currentPage} of {totalPages} ({currentDataset.length} entries)
                  </span>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="py-1 px-2.5 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Prev
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="py-1 px-2.5 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Slide-over Opportunity Builder Form overlay Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <motion.div 
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-8 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">
              {editingItem ? 'Edit Ingested Opportunity' : 'Publish Opportunity'}
            </h3>

            <form onSubmit={handleSaveOpportunity} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Title Name</label>
                <input 
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. UPSC Central Services 2027"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Description Summary Details</label>
                <textarea 
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Summarized information specifications..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                />
              </div>

              {activeModule === 'exams' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Qualification</label>
                    <select
                      value={formQual}
                      onChange={(e) => setFormQual(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    >
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Age Limits</label>
                    <input 
                      type="text"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value)}
                      placeholder="e.g. 18-32 Years"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    />
                  </div>
                </div>
              )}

              {/* Extra specifications depending on active module */}
              {(activeModule === 'schemes' || activeModule === 'education') && (
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">
                    {activeModule === 'schemes' ? 'Welfare Benefits / Allowances' : 'Admissions & Offered Facilities'}
                  </label>
                  <input 
                    type="text"
                    value={formExtra}
                    onChange={(e) => setFormExtra(e.target.value)}
                    placeholder={activeModule === 'schemes' ? 'e.g. ₹6,000 / Year stipend' : 'e.g. Hostel & Computing centers'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">End Ingestion Date</label>
                  <input 
                    type="date"
                    required
                    value={formLastDate}
                    onChange={(e) => setFormLastDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="text-xs font-bold rounded-xl cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="text-xs font-bold rounded-xl px-5 cursor-pointer">
                  Save Opportunity
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
