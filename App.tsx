import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { Invoice, PaymentStatus } from './types';
import { ArrowLeft, CheckCircle, Users, Search } from 'lucide-react';

const DEFAULT_INVOICE: Invoice = {
  id: '',
  number: '001',
  date: new Date().toISOString().split('T')[0],
  client: { name: '', phone: '', address: '' },
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  advance: 0,
  balance: 0,
  status: PaymentStatus.Pending,
  notes: ''
};

type Screen = 'home' | 'create' | 'preview' | 'history' | 'clients';

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <CheckCircle className="w-5 h-5 text-green-400" />
        <span className="font-bold text-sm">{message}</span>
    </div>
);

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>({...DEFAULT_INVOICE});
  const [toast, setToast] = useState({ message: '', visible: false });

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('jyortirling_data');
    if (saved) {
      setInvoices(JSON.parse(saved));
    }
  }, []);

  const showToast = (msg: string) => {
      setToast({ message: msg, visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const saveInvoice = () => {
    let newInvoices;
    const exists = invoices.find(i => i.id === currentInvoice.id);
    
    if (exists) {
      newInvoices = invoices.map(i => i.id === currentInvoice.id ? currentInvoice : i);
    } else {
      newInvoices = [currentInvoice, ...invoices];
    }
    
    setInvoices(newInvoices);
    localStorage.setItem('jyortirling_data', JSON.stringify(newInvoices));
    showToast('बिल सेव्ह झाले (Invoice Saved)');
  };

  const startNewInvoice = () => {
    const nextNum = (invoices.length + 1).toString().padStart(3, '0');
    setCurrentInvoice({
      ...DEFAULT_INVOICE, 
      id: Math.random().toString(36).substr(2,9),
      number: nextNum
    });
    setScreen('create');
  };

  const viewInvoice = (inv: Invoice) => {
    setCurrentInvoice(inv);
    setScreen('preview');
  };

  // --- CLIENTS SCREEN ---
  const ClientsScreen = () => {
    // Extract unique clients and agg stats
    const clientsMap = new Map<string, { count: number, total: number, lastDate: string }>();
    
    invoices.forEach(inv => {
        const name = inv.client.name.trim();
        if (!name) return;
        
        const existing = clientsMap.get(name) || { count: 0, total: 0, lastDate: '' };
        clientsMap.set(name, {
            count: existing.count + 1,
            total: existing.total + inv.total,
            lastDate: inv.date > existing.lastDate ? inv.date : existing.lastDate
        });
    });

    const clientList = Array.from(clientsMap.entries());

    return (
        <div className="min-h-screen bg-white pb-20">
           <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center gap-3 shadow-sm z-10">
              <button onClick={() => setScreen('home')} className="p-2 -ml-2 bg-slate-50 rounded-full hover:bg-slate-100">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold">ग्राहक यादी (Clients)</h2>
           </div>
           
           <div className="p-4 space-y-3">
             {clientList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
                    <Users className="w-16 h-16 mb-4 stroke-1" />
                    <p>अद्याप ग्राहक नाहीत</p>
                </div>
             ) : (
                clientList.map(([name, stats]) => (
                    <div key={name} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold uppercase">
                                {name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{name}</h3>
                                <p className="text-xs text-slate-500">{stats.count} Invoices • Last: {stats.lastDate}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-slate-400 uppercase">Total Spend</p>
                             <p className="font-bold text-lg text-brand-600">₹{stats.total.toLocaleString()}</p>
                        </div>
                    </div>
                ))
             )}
           </div>
        </div>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 mx-auto shadow-2xl transition-all duration-300 ${screen === 'preview' ? 'max-w-5xl' : 'max-w-[450px]'}`}>
      
      <Toast message={toast.message} visible={toast.visible} />

      {screen === 'home' && (
        <Dashboard invoices={invoices} onNavigate={(s) => s === 'create' ? startNewInvoice() : setScreen(s as Screen)} />
      )}

      {screen === 'create' && (
        <InvoiceForm 
          invoice={currentInvoice} 
          setInvoice={setCurrentInvoice}
          onSave={saveInvoice}
          onPreview={() => { saveInvoice(); setScreen('preview'); }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'preview' && (
        <InvoicePreview 
          invoice={currentInvoice}
          onEdit={() => setScreen('create')}
        />
      )}

      {screen === 'clients' && <ClientsScreen />}

      {screen === 'history' && (
        <div className="min-h-screen bg-white pb-20">
           <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center gap-3 shadow-sm z-10">
              <button onClick={() => setScreen('home')} className="p-2 -ml-2 bg-slate-50 rounded-full hover:bg-slate-100">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold">जुनी बिले (History)</h2>
           </div>
           
           <div className="p-4 space-y-3">
             {invoices.length === 0 ? (
               <div className="text-center py-12 text-slate-400">अद्याप माहिती नाही</div>
             ) : (
               [...invoices].reverse().map(inv => (
                 <div key={inv.id} onClick={() => viewInvoice(inv)} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-center active:bg-slate-50 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex gap-3 items-center">
                       <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-700 font-bold">
                          {inv.number}
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-800">{inv.client.name || 'No Name'}</h3>
                          <p className="text-xs text-slate-500">{inv.date} • {inv.items.length} Items</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-lg">₹{inv.total.toLocaleString()}</p>
                       {inv.balance > 0 ? (
                         <p className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full inline-block">बाकी: {inv.balance}</p>
                       ) : (
                         <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">पूर्ण</p>
                       )}
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>
      )}
    </div>
  );
}