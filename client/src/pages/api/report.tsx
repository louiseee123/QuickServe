import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import { getRequests } from '@/lib/db'; // Your data access function

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const requests = await getRequests();
    const filteredRequests = requests.filter(r => 
      r.status === 'completed' || r.status === 'rejected'
    );

    // Same report generation logic as client-side
    const reportData = filteredRequests.map(request => ({
      /* same mapping as before */
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approval Report");
    
    // Generate and send the file
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', 'attachment; filename=approval-report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
}