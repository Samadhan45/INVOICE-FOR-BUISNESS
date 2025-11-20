import React from 'react';
import { PlusCircle, History, Users, Settings, IndianRupee, FileText } from 'lucide-react';
import { Invoice } from '../types';

interface DashboardProps {
  invoices: Invoice[];
  onNavigate: (screen: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, onNavigate }) => {
  // Stats
  const totalRevenue = invoices.reduce((sum, i) => sum + (i.advance || 0), 0); // Cash in hand
  const totalPending = invoices.reduce((sum, i) => sum + i.balance, 0);

  const MenuButton = ({ title, sub, icon: Icon, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden p-6 rounded-2xl shadow-md border border-slate-100 text-left group transition-all active:scale-95 ${color} hover:shadow-lg`}
    >
      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
         <Icon className="w-32 h-32" />
      </div>
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
           <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-white/80 text-sm font-medium">{sub}</p>
      </div>
    </button>
  );

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
         {/* LOGO: Paint Roller */}
         <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 p-2.5">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8L13 22l8-8Z" />
                <path d="m2 2 2 2" />
                <path d="m7 7 2 2" />
             </svg>
         </div>
         <div>
            <h1 className="text-xl font-bold text-slate-800">श्री ज्योतिर्लिंग पेंटर्स</h1>
            <p className="text-xs text-slate-500 font-medium">मराठी इन्व्हॉइस ॲप</p>
         </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">एकूण जमा (Cash)</p>
            <p className="text-2xl font-bold text-emerald-700">₹{totalRevenue.toLocaleString()}</p>
         </div>
         <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">येणे बाकी (Due)</p>
            <p className="text-2xl font-bold text-amber-700">₹{totalPending.toLocaleString()}</p>
         </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MenuButton 
           title="नवीन बिल" 
           sub="New Invoice" 
           icon={PlusCircle} 
           onClick={() => onNavigate('create')}
           color="bg-gradient-to-br from-brand-500 to-brand-700"
        />
        <MenuButton 
           title="जुनी बिले" 
           sub="History" 
           icon={History} 
           onClick={() => onNavigate('history')}
           color="bg-gradient-to-br from-indigo-500 to-indigo-700"
        />
        <MenuButton 
           title="ग्राहक यादी" 
           sub="Clients" 
           icon={Users} 
           onClick={() => onNavigate('clients')}
           color="bg-gradient-to-br from-slate-600 to-slate-800"
        />
         <MenuButton 
           title="सेटिंग" 
           sub="Settings" 
           icon={Settings} 
           onClick={() => alert('Coming Soon')}
           color="bg-gradient-to-br from-slate-500 to-slate-600"
        />
      </div>

      {/* Recent List Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
         <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">अलीकडील कामे</h3>
            <button onClick={() => onNavigate('history')} className="text-xs text-brand-600 font-bold uppercase">सर्व पहा</button>
         </div>
         <div className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">अद्याप बिल बनवले नाही</div>
            ) : (
               invoices.slice(0,3).map(inv => (
                  <div key={inv.id} className="p-4 flex justify-between items-center">
                     <div>
                        <p className="font-bold text-slate-800">{inv.client.name}</p>
                        <p className="text-xs text-slate-500">{inv.date}</p>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-slate-800">₹{inv.total.toLocaleString()}</p>
                        <p className={`text-[10px] font-bold ${inv.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                           {inv.balance > 0 ? 'बाकी' : 'पूर्ण'}
                        </p>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};