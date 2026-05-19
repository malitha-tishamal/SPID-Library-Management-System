import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportsService = {
  // EXCEL GENERATION
  exportToExcel(
    headers: string[],
    data: any[][],
    fileName: string,
    sheetName: string = 'Report'
  ) {
    const workbook = XLSX.utils.book_new();
    
    // Construct worksheet data: headers first, then rows
    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-fit column widths
    const colsWidths = headers.map((header, idx) => {
      let maxLen = header.length;
      data.forEach((row) => {
        const valStr = row[idx] ? String(row[idx]) : '';
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      return { wch: maxLen + 3 };
    });
    worksheet['!cols'] = colsWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  },

  // PDF GENERATION
  exportToPDF(
    headers: string[],
    data: any[][],
    title: string,
    fileName: string,
    subtitle?: string
  ) {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Theme Colors (Academic Precision Navy #0F172A)
    const primaryColor = [15, 23, 42]; // #0F172A
    const accentColor = [99, 102, 241]; // #6366F1
    
    // Header & Meta Details
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SMART LIBRARY SYSTEM', 14, 15);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), 14, 23);
    if (subtitle) {
      doc.text(subtitle, 14, 28);
    }
    
    // Export Date
    const todayStr = new Date().toLocaleString();
    doc.setFontSize(9);
    doc.text(`Generated: ${todayStr}`, 155, 15);
    
    // Main Table Grid
    autoTable(doc, {
      startY: 45,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor as [number, number, number],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Slate background for alternating rows
      },
      margin: { left: 14, right: 14 }
    });

    // Page Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Cool gray
      doc.text(
        `Page ${i} of ${pageCount}`,
        14,
        287
      );
      doc.text(
        'SPID Smart Library Management Platform • Confidential',
        120,
        287
      );
    }

    doc.save(`${fileName}.pdf`);
  }
};
