import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { DocumentRequest } from '@shared/schema';

export function generateExcelReport(requests: DocumentRequest[]) {
  // Format data for Excel
  const reportData = requests.map(request => ({
    'Queue #': request.queueNumber,
    'Student ID': request.studentId,
    'Student Name': request.studentName,
    'Document Type': request.documentType,
    'Course': request.course,
    'Request Date': formatExcelDate(request.requestedAt),
    'Status': request.status === 'completed' ? 'Accepted' : 
              request.status === 'rejected' ? 'Denied' : 
              request.status,
    'Notes': request.notes || 'N/A'
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(reportData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Approval Report");
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `approval-report-${new Date().toISOString().split('T')[0]}.xlsx`);
}

function formatExcelDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString();
}