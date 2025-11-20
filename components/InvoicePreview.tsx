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
      const element = document.getElementById('invoice-pdf-content');
      if (!element) return;
      
      // Generate PDF Blob
      // @ts-ignore
      const worker = html2pdf().from(element).set({
        margin: 0,
        filename: `Invoice_${invoice.number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 }, // scrollY:0 prevents vertical clipping
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });

      const pdfBlob = await worker.output('blob');
      const file = new File([pdfBlob], `Invoice_${invoice.number}.pdf`, { type: 'application/pdf' });

      // Share via Native Share Sheet (works on Android/iOS)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice #${invoice.number}`,
          text: `Hello ${invoice.client.name}, here is your invoice from Jyortirling Painters.`,
        });
      } else {
        // Fallback: Download
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${invoice.number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        alert('PDF Downloaded. You can now share it manually on WhatsApp.');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      alert('Could not generate or share PDF. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const MIN_ROWS = 6; 
  const emptyRows = Math.max(0, MIN_ROWS - invoice.items.length);

  return (
    <div className="flex flex-col h-screen bg-slate-800 print:bg-white print:h-auto font-sans overflow-hidden">
      
      {/* Toolbar (Hidden in Print) */}
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
      <div className="flex-1 overflow-auto bg-slate-800 print:bg-white flex justify-center p-2 md:p-8 print:p-0">
        
        {/* A4 Paper Container */}
        <div id="invoice-pdf-content" className="bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] print:min-h-0 p-[8mm] md:p-[12mm] text-slate-900 relative flex flex-col print:w-full print:max-w-none print:m-0 mx-auto origin-top transition-transform md:transform-none">
           
           {/* --- HEADER --- */}
           <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-6">
              {/* Left: Logo & Company Info */}
              <div className="w-[60%]">
                  <div className="flex items-center gap-3 mb-4">
                      {/* LOGO: Paint Roller Professional */}
                      <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm p-2.5">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                            <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8L13 22l8-8Z" />
                            <path d="m2 2 2 2" />
                            <path d="m7 7 2 2" />
                         </svg>
                      </div>
                      <div>
                         <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">JYORTIRLING</h1>
                         <p className="text-xs md:text-sm font-bold text-blue-700 tracking-[0.2em] mt-0.5">PAINTERS</p>
                      </div>
                  </div>
                  
                  <div className="text-[10px] md:text-xs text-slate-600 space-y-0.5 font-medium leading-relaxed pl-1">
                      <p>Anandpark, laneno.2, Thergaonphata,</p>
                      <p>Dangechowk, Pune 411033</p>
                      <p>Mobile: <span className="font-bold text-slate-800">9860862087</span></p>
                      <p>Email: kadamvilas415@gmail.com</p>
                  </div>
              </div>

              {/* Right: Invoice Label */}
              <div className="text-right w-[40%]">
                  <h2 className="text-blue-700 font-bold text-xl uppercase tracking-wide mb-1">TAX INVOICE</h2>
                  <p className="text-slate-500 font-medium text-xs">Invoice No: <span className="text-slate-900 font-bold text-sm">#{invoice.number}</span></p>
              </div>
           </div>

           {/* --- BILL TO & DATES --- */}
           <div className="flex justify-between mb-8">
               <div className="w-[55%]">
                   <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1.5">Bill To</h3>
                   <div className="text-xs md:text-sm text-slate-700 space-y-1">
                       <p className="font-bold text-slate-900 text-base capitalize">{invoice.client.name || 'Client Name'}</p>
                       <p className="pt-0.5 font-medium">Ph: {invoice.client.phone}</p>
                   </div>
               </div>

               <div className="w-[40%] text-right text-xs md:text-sm space-y-1">
                   <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                       <span className="font-bold text-slate-500">Date:</span>
                       <span className="font-bold text-slate-900">{invoice.date}</span>
                   </div>
                   <div className="flex justify-between pt-1">
                       <span className="font-bold text-slate-500">Place:</span>
                       <span className="text-slate-900 font-medium uppercase">Pune</span>
                   </div>
               </div>
           </div>

           {/* --- TABLE --- */}
           <div className="mb-6 flex-grow">
               <table className="w-full text-xs md:text-sm border-collapse">
                   <thead>
                       <tr className="border-y-2 border-blue-900 text-slate-700 bg-slate-50 print:bg-transparent" style={{WebkitPrintColorAdjust: 'exact'}}>
                           <th className="py-2.5 px-2 text-left font-bold w-12">#</th>
                           <th className="py-2.5 px-2 text-left font-bold">Item Description</th>
                           <th className="py-2.5 px-2 text-right font-bold w-24">Rate</th>
                           <th className="py-2.5 px-2 text-center font-bold w-16">Qty</th>
                           <th className="py-2.5 px-2 text-right font-bold w-32">Amount</th>
                       </tr>
                   </thead>
                   <tbody className="text-slate-800">
                       {invoice.items.map((item, idx) => (
                           <tr key={idx} className="border-b border-slate-200">
                               <td className="py-3 px-2 text-slate-500 font-medium align-top">{idx + 1}</td>
                               <td className="py-3 px-2 font-bold align-top">
                                   {item.description}
                                   {item.unit && <span className="text-[10px] text-slate-400 font-normal ml-1 block md:inline">({item.unit})</span>}
                               </td>
                               <td className="py-3 px-2 text-right font-medium align-top">{item.rate.toFixed(2)}</td>
                               <td className="py-3 px-2 text-center font-medium align-top">{item.quantity}</td>
                               <td className="py-3 px-2 text-right font-bold align-top">
                                   {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                               </td>
                           </tr>
                       ))}
                       {/* Spacer rows */}
                       {Array.from({ length: emptyRows }).map((_, i) => (
                           <tr key={`empty-${i}`} className="border-b border-slate-100 h-9">
                               <td colSpan={5}></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>

           {/* --- FOOTER SECTION --- */}
           <div className="flex items-start justify-between pt-6 border-t-2 border-slate-800 text-xs">
               
               {/* Left: Bank & Words */}
               <div className="w-[55%]">
                   <div className="space-y-4">
                       <div>
                           <p className="font-bold text-slate-900 mb-2 underline decoration-slate-300">Bank Details</p>
                           <div className="grid grid-cols-[45px_1fr] gap-y-1 gap-x-2 text-[10px] md:text-xs">
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
                            <p className="font-bold text-slate-900 mb-1 underline decoration-slate-300">Notes</p>
                            <p className="text-[10px] text-slate-600 italic leading-relaxed whitespace-pre-line">{invoice.notes}</p>
                         </div>
                       )}
                   </div>

                   <div className="mt-6">
                       <p className="text-[10px] text-slate-500 mb-1">Amount in words:</p>
                       <p className="font-bold text-slate-900 text-[10px] md:text-xs uppercase leading-tight italic bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                           INR {numberToWords(invoice.total)}
                       </p>
                   </div>
               </div>

               {/* Right: Totals */}
               <div className="w-[40%]">
                   <div className="space-y-2 text-xs">
                       <div className="flex justify-between text-slate-600">
                           <span>Taxable Amount</span>
                           <span className="font-medium">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                       </div>
                       
                       {invoice.discount > 0 && (
                         <div className="flex justify-between text-red-500">
                             <span>Discount</span>
                             <span>- ₹{invoice.discount.toFixed(2)}</span>
                         </div>
                       )}

                       <div className="flex justify-between text-slate-400">
                           <span>CGST/SGST</span>
                           <span>-</span>
                       </div>

                       {/* Total Bar */}
                       <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded py-2 px-3 mt-2 print:bg-blue-50" style={{WebkitPrintColorAdjust: 'exact'}}>
                           <span className="font-bold text-blue-900 text-sm">Total</span>
                           <span className="font-bold text-blue-900 text-lg">₹{invoice.total.toLocaleString('en-IN')}</span>
                       </div>

                       <div className="flex justify-between text-slate-600 pt-1 px-2">
                           <span>Amount Paid</span>
                           <span className="font-bold text-emerald-600">₹{invoice.advance.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between text-slate-600 px-2">
                           <span className="font-bold text-slate-800">Balance Due</span>
                           <span className="font-bold text-red-600">₹{invoice.balance.toLocaleString('en-IN')}</span>
                       </div>
                   </div>
               </div>
           </div>

           {/* Signatures */}
           <div className="mt-auto pt-12 pb-0 text-right">
               <p className="text-[10px] font-bold text-slate-900 mb-10">For JYORTIRLING PAINTERS</p>
               <p className="text-[10px] text-slate-500 border-t border-slate-300 inline-block px-8 pt-2">Authorized Signatory</p>
           </div>

        </div>
      </div>
    </div>
  );
};