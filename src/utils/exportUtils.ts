import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Customer, FinancialTransaction, JarTransaction, DailyClosingReportData } from '../types';
import { formatCurrency, formatDate, formatDateTime } from './formatters';

// Export Customer Statement as PDF
export const downloadCustomerStatementPDF = (
  customer: Customer,
  transactions: FinancialTransaction[],
  jarTransactions: JarTransaction[]
) => {
  const doc = new jsPDF();

  // Company Header
  doc.setFillColor(15, 39, 68); // Ocean 900
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AQUAFLOW WATER DISTRIBUTION', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253); // Light ocean blue
  doc.text('Bulk Commercial & Residential Pure Water Supply • Kolkata, WB', 14, 25);
  doc.text('Hotline: +91 98765 43210 • Support: billing@aquaflow.internal', 14, 30);

  // Statement Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER ACCOUNT STATEMENT', 14, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated On: ${formatDateTime(new Date().toISOString())}`, 14, 52);

  // Customer Profile Details Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 56, 182, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 56, 182, 32, 2, 2, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(customer.name, 20, 65);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile: +91 ${customer.phone}`, 20, 72);
  doc.text(`Address: ${customer.address}${customer.landmark ? ` (Landmark: ${customer.landmark})` : ''}`, 20, 78);
  doc.text(`Account Status: ${customer.accountStatus.toUpperCase()}`, 20, 84);

  // Financial Summary Box & Jar Summary Box side by side
  // Financial Box
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(14, 92, 88, 30, 2, 2, 'F');
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, 92, 88, 30, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(3, 105, 161);
  doc.text('FINANCIAL SUMMARY', 20, 99);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Purchases: ${formatCurrency(customer.totalPurchases)}`, 20, 106);
  doc.text(`Total Paid: ${formatCurrency(customer.totalAmountPaid)}`, 20, 112);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Current Outstanding Due: ${formatCurrency(customer.outstandingDue)}`, 20, 118);

  // Jar Box
  doc.setFillColor(236, 254, 255);
  doc.roundedRect(108, 92, 88, 30, 2, 2, 'F');
  doc.setDrawColor(165, 243, 252);
  doc.roundedRect(108, 92, 88, 30, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(8, 145, 178);
  doc.text('20L REUSABLE JAR BALANCE', 114, 99);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Delivered Jars: ${customer.newJarsDelivered}`, 114, 106);
  doc.text(`Empty Jars Returned: ${customer.emptyJarsReturned}`, 114, 112);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Current Outstanding Jars: ${customer.outstandingJars} Jars`, 114, 118);

  // Chronological Financial Ledger Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Chronological Financial Ledger', 14, 130);

  const tableRows = transactions.map(t => [
    formatDate(t.date),
    t.description,
    t.debit > 0 ? formatCurrency(t.debit) : '-',
    t.credit > 0 ? formatCurrency(t.credit) : '-',
    formatCurrency(t.balanceAfter),
    t.recordedBy || 'Admin'
  ]);

  (doc as any).autoTable({
    startY: 134,
    head: [['Date', 'Description', 'Debit (+Due)', 'Credit (-Paid)', 'Running Due', 'Recorded By']],
    body: tableRows.length > 0 ? tableRows : [['-', 'No transactions recorded yet', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 39, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Reusable 20L Jar Movement Ledger Table
  const nextY = (doc as any).lastAutoTable.finalY + 10;
  if (nextY < 240) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('20L Reusable Jar Movement Ledger', 14, nextY);

    const jarRows = jarTransactions.map(j => [
      formatDate(j.date),
      j.description,
      j.jarsDelivered > 0 ? `+${j.jarsDelivered}` : '-',
      j.jarsReturned > 0 ? `-${j.jarsReturned}` : '-',
      `${j.balanceAfter} Jars`,
      j.recordedBy || 'Delivery Partner'
    ]);

    (doc as any).autoTable({
      startY: nextY + 4,
      head: [['Date', 'Activity', 'Delivered (+)', 'Returned (-)', 'Jar Balance', 'Recorded By']],
      body: jarRows.length > 0 ? jarRows : [['-', 'No jar movements recorded yet', '-', '-', '-', '-']],
      theme: 'striped',
      headStyles: {
        fillColor: [14, 116, 144], // Cyan 700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer notes
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Note: Monetary dues and reusable jar balances are tracked separately. Please settle outstanding dues via UPI/Cash.',
    14,
    Math.min(finalY, 280)
  );

  doc.save(`AquaFlow_Statement_${customer.name.replace(/\s+/g, '_')}_${customer.phone}.pdf`);
};

// Export Daily Closing Report to CSV
export const exportDailyClosingReportCSV = (report: DailyClosingReportData) => {
  const lines: string[] = [];

  lines.push(`AQUAFLOW WATER DISTRIBUTION - DAILY CLOSING REPORT`);
  lines.push(`Date,${report.date}`);
  lines.push(`Exported At,${new Date().toISOString()}`);
  lines.push(``);
  lines.push(`SUMMARY METRICS`);
  lines.push(`Total Orders,${report.totalOrders}`);
  lines.push(`Delivered Orders,${report.deliveredOrders}`);
  lines.push(`Pending Deliveries,${report.pendingDeliveries}`);
  lines.push(`Cancelled Orders,${report.cancelledOrders}`);
  lines.push(`Cash Collected,Rs. ${report.cashCollected}`);
  lines.push(`UPI Collected,Rs. ${report.upiCollected}`);
  lines.push(`Other Payments,Rs. ${report.otherPaymentsCollected}`);
  lines.push(`Total Revenue Received,Rs. ${report.totalRevenueCollected}`);
  lines.push(`Total 20L Jars Delivered,${report.totalJarsDelivered}`);
  lines.push(`Total Empty Jars Returned,${report.totalEmptyJarsReturned}`);
  lines.push(`System-Wide Outstanding Customer Dues,Rs. ${report.totalOutstandingDues}`);
  lines.push(`System-Wide Outstanding Jars,${report.totalOutstandingJarsSystemWide}`);
  lines.push(``);

  lines.push(`ORDERS FOR ${report.date}`);
  lines.push(`Order ID,Customer Name,Phone,Address,Total Amount,Paid Amount,Payment Status,Delivery Status,Driver`);

  report.orders.forEach(o => {
    lines.push(
      `"${o.id}","${o.customerName}","${o.customerPhone}","${o.deliveryAddress.replace(/"/g, '""')}",${o.totalAmount},${o.paidAmount},"${o.paymentStatus}","${o.deliveryStatus}","${o.assignedDeliveryPersonName || 'Unassigned'}"`
    );
  });

  lines.push(``);
  lines.push(`FINANCIAL TRANSACTIONS FOR ${report.date}`);
  lines.push(`Transaction ID,Customer Name,Description,Type,Debit,Credit,Balance After,Payment Method,Recorded By`);

  report.transactions.forEach(t => {
    lines.push(
      `"${t.id}","${t.customerName}","${t.description.replace(/"/g, '""')}","${t.type}",${t.debit},${t.credit},${t.balanceAfter},"${t.paymentMethod || '-'}","${t.recordedBy}"`
    );
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AquaFlow_Daily_Closing_${report.date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
