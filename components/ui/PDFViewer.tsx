'use client';

import React, { useState } from 'react';
import { Eye, Download, ShieldAlert, Maximize2, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PDFViewerProps {
  url: string;
  title: string;
  className?: string;
}

export default function PDFViewer({ url, title, className }: PDFViewerProps) {
  const [error, setError] = useState<string | null>(null);

  if (!url) {
    return (
      <div className="h-72 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert size={36} className="text-slate-350" />
        <span className="text-slate-400 text-sm font-semibold mt-2">No eBook PDF linked</span>
        <span className="text-slate-300 text-xs mt-1">This book doesn't contain a digital file download.</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col border border-slate-250 rounded-2xl overflow-hidden bg-white shadow-sm", className)}>
      {/* Viewer Header */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-indigo-400" />
          <span className="font-semibold text-xs truncate max-w-[200px] sm:max-w-xs">{title}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <a
            href={url}
            download
            className="text-xs hover:text-indigo-300 transition-colors flex items-center gap-1 font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/5"
          >
            <Download size={12} />
            Download
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:text-indigo-300 transition-colors flex items-center gap-1 font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/5"
          >
            <ExternalLink size={12} />
            Fullscreen
          </a>
        </div>
      </div>

      {/* Main Embed Body */}
      <div className="relative flex-1 min-h-[500px] bg-slate-800">
        <iframe
          src={`${url}#toolbar=0`}
          title={title}
          className="w-full h-full min-h-[500px] border-none"
          onError={() => setError('Unable to embed document. Please try direct download.')}
        />
        
        {error && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center text-white">
            <ShieldAlert size={40} className="text-rose-400 mb-2" />
            <h5 className="font-semibold">{error}</h5>
            <a 
              href={url} 
              download 
              className="mt-3 bg-accent hover:bg-accent-dark px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Download PDF Directly
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
