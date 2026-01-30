const { getDatabase } = require('../database');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const XLSX = require('xlsx');
const { dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');

module.exports = function(ipcMain) {
  // Export members to PDF
  ipcMain.handle('reports:exportMembersPDF', async () => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT m.*, mp.name as plan_name, t.name as trainer_name 
           FROM members m
           LEFT JOIN membership_plans mp ON m.plan_id = mp.id
           LEFT JOIN trainers t ON m.trainer_id = t.id
           ORDER BY m.created_at DESC`,
          (err, rows) => {
            if (err) {
              reject({ success: false, message: err.message });
              return;
            }

            try {
              const doc = new jsPDF();
              
              doc.setFontSize(18);
              doc.text('Members Report', 14, 22);
              doc.setFontSize(11);
              doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
              
              const tableData = rows.map(member => [
                member.id,
                member.name,
                member.email || '',
                member.phone || '',
                member.plan_name || '',
                member.membership_status
              ]);
              
              doc.autoTable({
                startY: 35,
                head: [['ID', 'Name', 'Email', 'Phone', 'Plan', 'Status']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] }
              });
              
              const downloadsPath = app.getPath('downloads');
              const fileName = `members_report_${Date.now()}.pdf`;
              const filePath = path.join(downloadsPath, fileName);
              
              doc.save(filePath);
              
              resolve({ success: true, path: filePath });
            } catch (error) {
              reject({ success: false, message: error.message });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Export members to Excel
  ipcMain.handle('reports:exportMembersExcel', async () => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT m.id, m.name, m.email, m.phone, m.address, m.gender, 
                  mp.name as plan_name, t.name as trainer_name, 
                  m.membership_status, m.join_date
           FROM members m
           LEFT JOIN membership_plans mp ON m.plan_id = mp.id
           LEFT JOIN trainers t ON m.trainer_id = t.id
           ORDER BY m.created_at DESC`,
          (err, rows) => {
            if (err) {
              reject({ success: false, message: err.message });
              return;
            }

            try {
              const worksheet = XLSX.utils.json_to_sheet(rows);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
              
              const downloadsPath = app.getPath('downloads');
              const fileName = `members_report_${Date.now()}.xlsx`;
              const filePath = path.join(downloadsPath, fileName);
              
              XLSX.writeFile(workbook, filePath);
              
              resolve({ success: true, path: filePath });
            } catch (error) {
              reject({ success: false, message: error.message });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Export payments report
  ipcMain.handle('reports:exportPayments', async (event, filter = {}) => {
    try {
      const db = getDatabase();
      
      let query = `
        SELECT p.*, m.name as member_name, mp.name as plan_name 
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_plans mp ON p.plan_id = mp.id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filter.startDate) {
        conditions.push('p.payment_date >= ?');
        params.push(filter.startDate);
      }
      
      if (filter.endDate) {
        conditions.push('p.payment_date <= ?');
        params.push(filter.endDate);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY p.payment_date DESC';
      
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) {
            reject({ success: false, message: err.message });
            return;
          }

          try {
            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text('Payments Report', 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            
            const tableData = rows.map(payment => [
              payment.id,
              payment.member_name,
              payment.plan_name,
              `₹${payment.amount}`,
              new Date(payment.payment_date).toLocaleDateString(),
              payment.status
            ]);
            
            doc.autoTable({
              startY: 35,
              head: [['ID', 'Member', 'Plan', 'Amount', 'Date', 'Status']],
              body: tableData,
              theme: 'striped',
              headStyles: { fillColor: [46, 204, 113] }
            });
            
            const totalAmount = rows.reduce((sum, payment) => sum + payment.amount, 0);
            doc.setFontSize(12);
            doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
            
            const downloadsPath = app.getPath('downloads');
            const fileName = `payments_report_${Date.now()}.pdf`;
            const filePath = path.join(downloadsPath, fileName);
            
            doc.save(filePath);
            
            resolve({ success: true, path: filePath });
          } catch (error) {
            reject({ success: false, message: error.message });
          }
        });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });
};
