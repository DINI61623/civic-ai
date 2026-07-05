import Link from 'next/link';
import { Landmark, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-slate-100 dark:bg-slate-900 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">CivicAI</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              India&apos;s AI-Powered Citizen Assistance Platform. Helping you discover government opportunities and public services with ease.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Services</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/exams" className="hover:text-primary transition-colors">Government Exams</Link></li>
              <li><Link href="/schemes" className="hover:text-primary transition-colors">Government Schemes</Link></li>
              <li><Link href="/scholarships" className="hover:text-primary transition-colors">Scholarships</Link></li>
              <li><Link href="/education" className="hover:text-primary transition-colors">Higher Education</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/about" className="hover:text-primary transition-colors">About CivicAI</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@civicai.in</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-XXX-XXXX</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> New Delhi, India</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-4 rounded-lg mb-6 text-sm text-yellow-800 dark:text-yellow-200/80 text-center">
            <strong>Disclaimer:</strong> CivicAI is an independent AI-powered citizen assistance platform and is <strong>not</strong> affiliated with any government entity. Official applications and services are provided only through their respective official government websites.
          </div>
          <div className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} CivicAI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
