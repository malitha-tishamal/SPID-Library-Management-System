'use client';

import React, { useState } from 'react';
import { ReportsService } from '@/services/reports.service';
import { BooksService } from '@/services/books.service';
import { IssueService } from '@/services/issue.service';
import { ReturnService } from '@/services/return.service';
import { FileSpreadsheet, FileText, Download, CalendarClock, Table } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<'inventory' | 'issues' | 'overdue' | 'fines'>('inventory');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (format: 'pdf' | 'xlsx') => {
    setIsGenerating(true);
    try {
      if (reportType === 'inventory') {
        const { books } = await BooksService.getBooks({ limit: 100 });
        
        const headers = ['Title', 'Author', 'Category', 'ISBN', 'Total Copies', 'Available', 'Shelf', 'Format'];
        const data = books.map(b => [
          b.title,
          b.author?.name || 'N/A',
          b.category?.name || 'N/A',
          b.isbn || 'N/A',
          b.total_copies,
          b.available_copies,
          b.shelf_number ? `Shelf ${b.shelf_number}` : 'N/A',
          b.is_digital ? 'Digital' : 'Physical'
        ]);

        if (format === 'xlsx') {
          ReportsService.exportToExcel(headers, data, 'Library_Inventory_Report', 'Inventory');
        } else {
          ReportsService.exportToPDF(headers, data, 'Library Inventory Status Report', 'Library_Inventory_Report', 'Active Physical & Digital eBook Holdings');
        }
      } 
      
      else if (reportType === 'issues') {
        const activeIssues = await IssueService.getActiveIssues();
        
        const headers = ['Book Title', 'Student Name', 'Student ID', 'Issued Date', 'Due Date', 'Renewal Count', 'Status'];
        const data = activeIssues.map(i => [
          i.book?.title || 'N/A',
          i.user?.full_name || 'N/A',
          i.user?.student_id || 'N/A',
          new Date(i.issue_date).toLocaleDateString(),
          new Date(i.due_date).toLocaleDateString(),
          i.renewal_count,
          i.status
        ]);

        if (format === 'xlsx') {
          ReportsService.exportToExcel(headers, data, 'Active_Loans_Report', 'Active Loans');
        } else {
          ReportsService.exportToPDF(headers, data, 'Active Borrowing Loans Report', 'Active_Loans_Report', 'Physical Volumes Currently Checked Out');
        }
      } 
      
      else if (reportType === 'overdue') {
        const allActive = await IssueService.getActiveIssues();
        const overdue = allActive.filter(i => i.status === 'overdue');
        
        const headers = ['Book Title', 'Student Name', 'Student ID', 'Student Email', 'Due Date', 'Overdue Days'];
        const data = overdue.map(i => {
          const dueDate = new Date(i.due_date);
          const diff = Math.max(0, Math.ceil((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          return [
            i.book?.title || 'N/A',
            i.user?.full_name || 'N/A',
            i.user?.student_id || 'N/A',
            i.user?.email || 'N/A',
            dueDate.toLocaleDateString(),
            `${diff} Days`
          ];
        });

        if (format === 'xlsx') {
          ReportsService.exportToExcel(headers, data, 'Overdue_Books_Report', 'Overdue');
        } else {
          ReportsService.exportToPDF(headers, data, 'Overdue Library Loans Report', 'Overdue_Books_Report', 'Checked out volumes exceeding borrow windows');
        }
      } 
      
      else if (reportType === 'fines') {
        const fines = await ReturnService.getFines();
        
        const headers = ['Student Name', 'Student ID', 'Book Title', 'Fine Amount', 'Status', 'Paid Date'];
        const data = fines.map(f => [
          f.user?.full_name || 'N/A',
          f.user?.student_id || 'N/A',
          f.issued_book?.book?.title || 'N/A',
          `LKR ${f.total_amount}`,
          f.status,
          f.paid_at ? new Date(f.paid_at).toLocaleDateString() : '-'
        ]);

        if (format === 'xlsx') {
          ReportsService.exportToExcel(headers, data, 'Fines_Collection_Report', 'Fines');
        } else {
          ReportsService.exportToPDF(headers, data, 'Accrued Late Fines Report', 'Fines_Collection_Report', 'Fines, Waived items, and Collected Revenue');
        }
      }

      toast.success('Report generated and downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to query report dataset');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header section */}
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Report Export Center
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Select standard datasets to export instantly into client-side spreadsheets or elegant formatted PDFs.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Select report type */}
        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-500 block">1. Select Target Dataset</label>
          <div className="space-y-3">
            <button
              onClick={() => setReportType('inventory')}
              className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                reportType === 'inventory'
                  ? "bg-accent/5 border-accent text-slate-850 shadow-sm"
                  : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50/50"
              }`}
            >
              <Table className={`h-5 w-5 mt-0.5 ${reportType === 'inventory' ? 'text-accent' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-xs block text-slate-800">Inventory Status Report</span>
                <span className="text-[10px] text-slate-450 mt-1 block">Full listing of physical shelves, copies, and eBooks.</span>
              </div>
            </button>

            <button
              onClick={() => setReportType('issues')}
              className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                reportType === 'issues'
                  ? "bg-accent/5 border-accent text-slate-850 shadow-sm"
                  : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50/50"
              }`}
            >
              <FileText className={`h-5 w-5 mt-0.5 ${reportType === 'issues' ? 'text-accent' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-xs block text-slate-800">Active Book Issues Report</span>
                <span className="text-[10px] text-slate-450 mt-1 block">Comprehensive records of all physical checkouts on-loan.</span>
              </div>
            </button>

            <button
              onClick={() => setReportType('overdue')}
              className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                reportType === 'overdue'
                  ? "bg-accent/5 border-accent text-slate-850 shadow-sm"
                  : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50/50"
              }`}
            >
              <CalendarClock className={`h-5 w-5 mt-0.5 ${reportType === 'overdue' ? 'text-rose-500' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-xs block text-slate-850">Late Overdue Summary</span>
                <span className="text-[10px] text-slate-450 mt-1 block font-medium">Loans exceeding borrow windows, days late and student profiles.</span>
              </div>
            </button>

            <button
              onClick={() => setReportType('fines')}
              className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                reportType === 'fines'
                  ? "bg-accent/5 border-accent text-slate-850 shadow-sm"
                  : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50/50"
              }`}
            >
              <FileSpreadsheet className={`h-5 w-5 mt-0.5 ${reportType === 'fines' ? 'text-amber-500' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-xs block text-slate-800">Late Fines Collection Ledger</span>
                <span className="text-[10px] text-slate-450 mt-1 block">Outstanding invoices, paid revenue audits, and waived fines.</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Generate toolbar formats */}
        <div className="glass-card p-6 rounded-2xl border border-slate-150 bg-slate-50/40 flex flex-col justify-center items-center text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. Generate & Download</span>
            <h4 className="font-sora font-extrabold text-sm text-slate-850 mt-1">Select Document Format</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1">
              Datasets are queried fresh from database nodes and exported locally in your choice of formats.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full">
            <button
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGenerating ? <LoadingSpinner size={14} className="text-white" /> : <FileText size={14} />}
              Export PDF Layout
            </button>

            <button
              onClick={() => handleGenerateReport('xlsx')}
              disabled={isGenerating}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGenerating ? <LoadingSpinner size={14} className="text-white" /> : <FileSpreadsheet size={14} />}
              Export Excel Sheet
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
