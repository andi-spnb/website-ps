// src/utils/exportUtils.js
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Mengekspor data ke file Excel
 * @param {Array} data - Array 2D data yang akan diekspor
 * @param {string} filename - Nama file tanpa ekstensi
 */
export const exportToExcel = (data, filename) => {
  try {
    // Buat workbook baru
    const wb = XLSX.utils.book_new();
    
    // Buat worksheet dari data
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    
    // Ekspor workbook ke file Excel
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Gagal mengekspor ke Excel');
  }
};

/**
 * Mengekspor elemen HTML ke file PDF
 * @param {string} elementId - ID elemen yang akan diekspor
 * @param {string} filename - Nama file tanpa ekstensi
 */
export const exportToPDF = async (elementId, filename) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }
    
    // Konfigurasi PDF
    const pdfConfig = {
      margin: 10,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Dapatkan ukuran elemen
    const originalHeight = element.offsetHeight;
    const originalWidth = element.offsetWidth;
    
    // Konversi elemen ke canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true
    });
    
    // Buat PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Hitung rasio aspek untuk mempertahankan proporsi
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Pertahankan rasio aspek ketika memuat gambar
    const imgWidth = pageWidth - 20; // margin 10mm pada kedua sisi
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Jika gambar lebih tinggi dari halaman PDF, bagi menjadi beberapa halaman
    let heightLeft = imgHeight;
    let position = 10; // posisi Y awal (10mm dari atas)
    
    // Halaman pertama
    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 20); // 20mm margin total (atas + bawah)
    
    // Halaman tambahan jika diperlukan
    while (heightLeft > 0) {
      position = 10 - (pageHeight - 20); // Geser elemen ke atas untuk menampilkan bagian berikutnya
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);
    }
    
    // Ekspor PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Gagal mengekspor ke PDF');
  }
};

/**
 * Mengekspor tabel data ke format CSV
 * @param {Array} headers - Array header kolom
 * @param {Array} data - Array data yang akan diekspor
 * @param {string} filename - Nama file tanpa ekstensi
 */
export const exportToCSV = (headers, data, filename) => {
  try {
    // Buat string CSV header
    let csvContent = headers.join(',') + '\n';
    
    // Tambahkan baris data
    data.forEach(row => {
      // Pastikan nilai dalam tanda kutip jika berisi koma
      const formattedRow = row.map(cell => {
        const cellStr = String(cell);
        return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
      });
      
      csvContent += formattedRow.join(',') + '\n';
    });
    
    // Buat blob dari string CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Buat elemen anchor untuk download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Gagal mengekspor ke CSV');
  }
};