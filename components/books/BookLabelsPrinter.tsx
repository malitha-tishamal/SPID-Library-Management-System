'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Book } from '../../types';
import { Printer, X, Tag, MapPin } from 'lucide-react';

interface BookLabelsPrinterProps {
  book: Book;
  onClose: () => void;
}

export default function BookLabelsPrinter({ book, onClose }: BookLabelsPrinterProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (!printContent) return;

    // Create iframe to isolate styling and print layout beautifully
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
      <html>
        <head>
          <title>Print Label - ${book.title}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: #fff;
            }
            .label-card {
              border: 2px solid #0f172a;
              border-radius: 8px;
              padding: 15px;
              width: 320px;
              text-align: center;
              box-shadow: none;
            }
            .title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 2px;
              color: #0f172a;
              text-transform: uppercase;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .author {
              font-size: 11px;
              color: #64748b;
              margin-bottom: 12px;
            }
            .qr-box {
              margin: 15px 0;
              display: flex;
              justify-content: center;
            }
            .isbn {
              font-size: 12px;
              font-weight: bold;
              color: #0f172a;
              letter-spacing: 2px;
              margin-top: 8px;
            }
            .shelf-info {
              font-size: 10px;
              background: #f1f5f9;
              padding: 5px;
              border-radius: 4px;
              font-weight: bold;
              margin-top: 10px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="title">${book.title}</div>
            <div class="author">by ${book.author?.name || 'Unknown Author'}</div>
            <div class="qr-box">${printAreaRef.current?.querySelector('.qr-container')?.innerHTML}</div>
            <div class="isbn">ISBN: ${book.isbn || 'N/A'}</div>
            <div class="shelf-info">Shelf: ${book.shelf_number || 'N/A'} • Rack: ${book.rack_number || 'N/A'}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 100);
            }
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col space-y-6">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-sora font-bold text-sm text-slate-800">
            Print Identification Label
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Label Display (Print Area) */}
        <div ref={printAreaRef} className="flex justify-center">
          <div className="border-2 border-slate-900 rounded-2xl p-5 w-72 text-center bg-slate-50/50">
            <h4 className="font-sora font-extrabold text-[13px] text-slate-950 truncate uppercase leading-tight">
              {book.title}
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              by {book.author?.name || 'Unknown Author'}
            </span>

            {/* QR Code section */}
            <div className="my-4 flex justify-center qr-container">
              <QRCode
                value={`smartlib://book/${book.id}`}
                size={110}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                fgColor="#0F172A"
              />
            </div>

            <div className="text-[11px] font-extrabold text-slate-950 tracking-wider">
              ISBN: {book.isbn || 'N/A'}
            </div>

            <div className="mt-3.5 bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl flex items-center justify-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wide">
              <MapPin size={12} />
              <span>Shelf: {book.shelf_number || 'N/A'} • Rack: {book.rack_number || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all text-slate-600"
          >
            Close
          </button>
          
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <Printer size={14} />
            Print Label
          </button>
        </div>

      </div>
    </div>
  );
}
