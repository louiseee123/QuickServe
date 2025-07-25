const exportCompletedRequests = () => {
  try {
    // Filter only completed requests
    const completedRequests = requests.filter(request => request.status === 'completed');
    
    if (completedRequests.length === 0) {
      toast({
        title: "No completed requests",
        description: "There are no completed requests to export",
        variant: "destructive"
      });
      return 0;
    }

    // Prepare data for Excel
    const data = completedRequests.map(request => ({
      'Queue #': request.queueNumber,
      'Student ID': request.studentId,
      'Student Name': request.studentName,
      'Document Type': request.documentType,
      'Course': request.course,
      'Requested At': format(new Date(request.requestedAt), "MMM d, yyyy h:mm a"),
      'Completed At': request.updatedAt ? format(new Date(request.updatedAt), "MMM d, yyyy h:mm a") : 'N/A',
      'Notes': request.notes || 'N/A'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Completed Requests");
    
    // Generate Excel file
    XLSX.writeFile(wb, `Completed_Requests_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    return completedRequests.length;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Export failed",
      description: "An error occurred while generating the report",
    });
    return 0;
  }
};