import React, { useState } from 'react';
import { Invoice } from '../types';
import { ArrowLeft, Share2, Printer, Loader2 } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  onEdit: () => void;
}

// Helper: Number to Words (Indian Format)
const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  
  const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  const getLT20 = (n: number) => a[Number(n)];
  const get20Plus = (n: number) => b[Number(n.toString()[0])] + ' ' + a[Number(n.toString()[1])];

  const recurse = (n: number): string => {
      if (n < 20) return getLT20(n);
      if (n < 100) return get20Plus(n);
      if (n < 1000) return getLT20(Math.floor(n / 100)) + "Hundred " + recurse(n % 100);
      if (n < 100000) return recurse(Math.floor(n / 1000)) + "Thousand " + recurse(n % 1000);
      if (n < 10000000) return recurse(Math.floor(n / 100000)) + "Lakh " + recurse(n % 100000);
      return recurse(Math.floor(n / 10000000)) + "Crore " + recurse(n % 10000000);
  }
  
  return recurse(Math.floor(num)).trim() + " Only";
};

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onEdit }) => {
  const [isSharing, setIsSharing] = useState(false);
  
  const handleSharePdf = async () => {
    setIsSharing(true);
    try {
      window.scrollTo(0, 0);
      const element = document.getElementById('invoice-pdf-content');
      if (!element) return;
      
      // Generate PDF Blob
      // @ts-ignore
      const worker = html2pdf().from(element).set({
        margin: 10, // 10mm margin for clean print
        filename: `Invoice_${invoice.number}.pdf`,
        image: { type: 'jpeg', quality: 1.0 }, 
        html2canvas: { scale: 4, useCORS: true, scrollY: 0, letterRendering: true }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });

      const pdfBlob = await worker.output('blob');
      const file = new File([pdfBlob], `Invoice_${invoice.number}.pdf`, { type: 'application/pdf' });

      // Share via Native Share Sheet (Direct WhatsApp Option on Android)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice #${invoice.number}`,
          text: `Hello ${invoice.client.name}, here is your invoice from Jyortirling Painters.`,
        });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${invoice.number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        alert('PDF Downloaded. Open your Downloads folder and share to WhatsApp.');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Keep a few empty rows for looks, but not too many to force pages
  const MIN_ROWS = 2; 
  const emptyRows = Math.max(0, MIN_ROWS - invoice.items.length);

  return (
    <div className="flex flex-col h-screen bg-slate-800 print:bg-white print:h-auto font-sans overflow-hidden">
      
      {/* Toolbar */}
      <div className="bg-slate-900 text-white p-3 shadow-lg flex justify-between items-center no-print z-50 shrink-0">
        <button onClick={onEdit} className="flex items-center gap-2 text-slate-300 hover:text-white font-bold text-xs md:text-sm px-3 py-2 rounded-full hover:bg-slate-800 transition-all">
          <ArrowLeft className="w-4 h-4" /> Edit
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handleSharePdf} 
            disabled={isSharing}
            className="flex items-center gap-2 px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs md:text-sm font-bold shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
             {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} 
             <span className="hidden md:inline">Share PDF</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs md:text-sm font-bold shadow-lg active:scale-95">
             <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Scrollable Preview Area */}
      <div className="flex-1 overflow-auto bg-slate-800 print:bg-white flex justify-center p-2 md:p-4 print:p-0">
        
        {/* A4 Paper Container - Dynamic Height (removed min-h-[297mm]) */}
        <div id="invoice-pdf-content" className="bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-0 p-[10mm] text-slate-900 relative flex flex-col print:w-full print:max-w-none print:m-0 mx-auto box-border">
           
           {/* --- HEADER --- */}
           <div className="flex justify-between items-start mb-6 border-b-2 border-blue-800 pb-4">
              <div className="w-[60%]">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-800 text-white flex items-center justify-center shadow-sm p-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                            <path d="M2 12h20" />
                            <path d="M6 12v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                            <rect x="6" y="12" width="12" height="6" rx="1" fill="currentColor" className="text-blue-300/20" />
                            <path d="M12 18v4" />
                         </svg>
                      </div>
                      <div>
                         <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">JYORTIRLING</h1>
                         <p className="text-xs font-bold text-blue-800 tracking-[0.2em] mt-0.5">PAINTERS</p>
                      </div>
                  </div>
                  
                  <div className="text-xs text-slate-600 space-y-0.5 font-medium leading-snug pl-1">
                      <p>Anandpark, laneno.2, Thergaonphata, Dangechowk, Pune 411033</p>
                      <p className="flex items-center gap-2">
                        <span>Mobile: <span className="font-bold text-slate-900">9860862087</span></span>
                      </p>
                      <p>Email: kadamvilas415@gmail.com</p>
                  </div>
              </div>

              <div className="text-right w-[40%] pt-2">
                  <h2 className="text-blue-800 font-bold text-xl uppercase tracking-wide mb-1">TAX INVOICE</h2>
                  <p className="text-slate-500 font-medium text-xs">Invoice No: <span className="text-slate-900 font-bold text-sm">#{invoice.number}</span></p>
              </div>
           </div>

           {/* --- BILL TO & DATES --- */}
           <div className="flex justify-between mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 print:bg-transparent print:border-none print:p-0">
               <div className="w-[55%]">
                   <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Bill To</h3>
                   <div className="text-sm text-slate-800 space-y-0.5">
                       <p className="font-bold text-base capitalize">{invoice.client.name || 'Client Name'}</p>
                       <p className="font-medium">Ph: {invoice.client.phone}</p>
                   </div>
               </div>

               <div className="w-[40%] text-right text-xs space-y-1">
                   <div className="flex justify-between border-b border-dotted border-slate-300 pb-1">
                       <span className="font-bold text-slate-500">Date:</span>
                       <span className="font-bold text-slate-900">{invoice.date}</span>
                   </div>
                   <div className="flex justify-between pt-1">
                       <span className="font-bold text-slate-500">Place:</span>
                       <span className="text-slate-900 font-medium uppercase">Pune</span>
                   </div>
               </div>
           </div>

           {/* --- TABLE (No flex-grow) --- */}
           <div className="mb-4">
               <table className="w-full text-xs border-collapse">
                   <thead>
                       <tr className="bg-blue-900 text-white print:bg-blue-900 print:text-white" style={{WebkitPrintColorAdjust: 'exact'}}>
                           <th className="py-2 px-2 text-left font-bold w-10 rounded-tl-md">#</th>
                           <th className="py-2 px-2 text-left font-bold">Item Description</th>
                           <th className="py-2 px-2 text-right font-bold w-20">Rate</th>
                           <th className="py-2 px-2 text-center font-bold w-12">Qty</th>
                           <th className="py-2 px-2 text-right font-bold w-28 rounded-tr-md">Amount</th>
                       </tr>
                   </thead>
                   <tbody className="text-slate-800">
                       {invoice.items.map((item, idx) => (
                           <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                               <td className="py-1.5 px-2 text-slate-500 font-medium align-top border-r border-slate-100">{idx + 1}</td>
                               <td className="py-1.5 px-2 font-bold align-top leading-tight border-r border-slate-100">
                                   {item.description}
                                   {item.unit && <span className="text-[10px] text-slate-400 font-normal ml-1 inline-block">({item.unit})</span>}
                               </td>
                               <td className="py-1.5 px-2 text-right font-medium align-top border-r border-slate-100">{item.rate.toFixed(2)}</td>
                               <td className="py-1.5 px-2 text-center font-medium align-top border-r border-slate-100">{item.quantity}</td>
                               <td className="py-1.5 px-2 text-right font-bold align-top">
                                   {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                               </td>
                           </tr>
                       ))}
                       {/* Spacer rows */}
                       {Array.from({ length: emptyRows }).map((_, i) => (
                           <tr key={`empty-${i}`} className="border-b border-slate-100 h-6">
                               <td className="border-r border-slate-100"></td>
                               <td className="border-r border-slate-100"></td>
                               <td className="border-r border-slate-100"></td>
                               <td className="border-r border-slate-100"></td>
                               <td></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>

           {/* --- FOOTER SECTION (Comes up naturally) --- */}
           <div className="flex items-start justify-between pt-4 border-t-2 border-slate-800 text-xs mt-4">
               
               {/* Left: Bank & Words */}
               <div className="w-[55%] pr-4">
                   <div className="space-y-3">
                       <div className="bg-slate-50 p-2 rounded border border-slate-100 print:border-none print:p-0 print:bg-transparent">
                           <p className="font-bold text-slate-900 mb-1 underline decoration-slate-300 text-[10px]">Bank Details</p>
                           <div className="grid grid-cols-[35px_1fr] gap-y-0.5 gap-x-1 text-[10px] leading-tight">
                               <span className="text-slate-500">Bank:</span>
                               <span className="font-bold text-slate-800">IDBI Bank</span>
                               <span className="text-slate-500">Acct:</span>
                               <span className="font-bold text-slate-800">0062204000152549</span>
                               <span className="text-slate-500">IFSC:</span>
                               <span className="font-bold text-slate-800">IBKL00000627</span>
                           </div>
                       </div>
                       
                       {invoice.notes && (
                         <div className="pt-1">
                            <p className="font-bold text-slate-900 mb-0.5 underline decoration-slate-300 text-[10px]">Notes</p>
                            <p className="text-[10px] text-slate-600 italic leading-tight whitespace-pre-line">{invoice.notes}</p>
                         </div>
                       )}
                   </div>

                   <div className="mt-4">
                       <p className="text-[10px] text-slate-500 mb-0.5">Amount in words:</p>
                       <p className="font-bold text-slate-900 text-[10px] uppercase leading-tight italic bg-slate-50 p-1.5 rounded border border-slate-100 inline-block w-full">
                           INR {numberToWords(invoice.total)}
                       </p>
                   </div>
               </div>

               {/* Right: Totals */}
               <div className="w-[40%]">
                   <div className="space-y-1 text-xs">
                       <div className="flex justify-between text-slate-600 py-0.5">
                           <span>Taxable Amount</span>
                           <span className="font-medium">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                       </div>
                       
                       {invoice.discount > 0 && (
                         <div className="flex justify-between text-red-500 py-0.5">
                             <span>Discount</span>
                             <span>- ₹{invoice.discount.toFixed(2)}</span>
                         </div>
                       )}

                       {/* Total Bar */}
                       <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded py-1.5 px-2 mt-1 mb-1 print:bg-blue-50" style={{WebkitPrintColorAdjust: 'exact'}}>
                           <span className="font-bold text-blue-900 text-xs">Total</span>
                           <span className="font-bold text-blue-900 text-base">₹{invoice.total.toLocaleString('en-IN')}</span>
                       </div>

                       <div className="flex justify-between text-slate-600 pt-1 px-2 border-b border-slate-100 pb-1">
                           <span>Amount Paid</span>
                           <span className="font-bold text-emerald-600">₹{invoice.advance.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between text-slate-600 px-2 pt-1">
                           <span className="font-bold text-slate-800">Balance Due</span>
                           <span className="font-bold text-red-600">₹{invoice.balance.toLocaleString('en-IN')}</span>
                       </div>
                   </div>
               </div>
           </div>

        </div>
      </div>
    </div>
  );
};