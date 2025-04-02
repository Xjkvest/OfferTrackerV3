import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Offer } from '@/context/OfferContext';
import { format } from 'date-fns';

export const exportToExcel = async (offerData: Offer[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Offers');

  // Define columns
  worksheet.columns = [
    { header: 'Case Number', key: 'caseNumber', width: 15 },
    { header: 'Channel', key: 'channel', width: 15 },
    { header: 'Offer Type', key: 'offerType', width: 15 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'CSAT', key: 'csat', width: 10 },
    { header: 'CSAT Comment', key: 'csatComment', width: 30 },
    { header: 'Converted', key: 'converted', width: 10 },
    { header: 'Conversion Date', key: 'conversionDate', width: 15 },
    { header: 'Followup Date', key: 'followupDate', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 }
  ];

  // Add data
  offerData.forEach(offer => {
    worksheet.addRow({
      caseNumber: offer.caseNumber,
      channel: offer.channel,
      offerType: offer.offerType,
      date: offer.date,
      csat: offer.csat,
      csatComment: offer.csatComment,
      converted: offer.converted ? 'Yes' : 'No',
      conversionDate: offer.conversionDate,
      followupDate: offer.followupDate,
      notes: offer.notes
    });
  });

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

export const exportToCSV = async (offerData: Offer[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Offers');

  // Define columns
  worksheet.columns = [
    { header: 'Case Number', key: 'caseNumber' },
    { header: 'Channel', key: 'channel' },
    { header: 'Offer Type', key: 'offerType' },
    { header: 'Date', key: 'date' },
    { header: 'CSAT', key: 'csat' },
    { header: 'CSAT Comment', key: 'csatComment' },
    { header: 'Converted', key: 'converted' },
    { header: 'Conversion Date', key: 'conversionDate' },
    { header: 'Followup Date', key: 'followupDate' },
    { header: 'Notes', key: 'notes' }
  ];

  // Add data
  offerData.forEach(offer => {
    worksheet.addRow({
      caseNumber: offer.caseNumber,
      channel: offer.channel,
      offerType: offer.offerType,
      date: offer.date,
      csat: offer.csat,
      csatComment: offer.csatComment,
      converted: offer.converted ? 'Yes' : 'No',
      conversionDate: offer.conversionDate,
      followupDate: offer.followupDate,
      notes: offer.notes
    });
  });

  // Generate CSV
  const rows = worksheet.getRows(1, worksheet.rowCount) || [];
  const csvContent = rows.map(row => {
    const values = Object.values(row.values || {}).slice(1);
    return values.map(cell => {
      const value = String(cell || '').replace(/"/g, '""');
      return value.includes(',') ? `"${value}"` : value;
    }).join(',');
  }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

export const exportToJSON = async (offerData: Offer[], filename: string) => {
  const jsonContent = JSON.stringify(offerData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};

export function exportToCsv(offers: Offer[], dateRangeText = '') {
  if (offers.length === 0) {
    console.error('No offers to export');
    return;
  }

  // Process the data using the rich prepareOfferData function
  const enrichedOfferData = prepareOfferData(offers);
  
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Offers');
  
  // Add headers
  const headers = Object.keys(enrichedOfferData[0]);
  worksheet.addRow(headers);
  
  // Add data
  enrichedOfferData.forEach(offer => {
    worksheet.addRow(Object.values(offer));
  });
  
  // Generate CSV
  const rows = worksheet.getRows(1, worksheet.rowCount) || [];
  const csvContent = rows.map(row => {
    const values = Object.values(row.values || {}).slice(1);
    return values.map(cell => {
      const value = String(cell || '').replace(/"/g, '""');
      return value.includes(',') || value.includes('\n') ? `"${value}"` : value;
    }).join(',');
  }).join('\n');
  
  // Export the file
  const fileName = dateRangeText 
    ? `offer-data-${dateRangeText}.csv`
    : `offer-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  saveAs(blob, fileName);
  
  return fileName;
}

// Helper function to prepare offer data for export
function prepareOfferData(offers: Offer[]) {
  return offers.map((offer) => {
    const offerDate = new Date(offer.date);
    const followupCount = offer.followups?.length || 0;
    const completedFollowupCount = offer.followups?.filter(f => f.completed).length || 0;
    const pendingFollowupCount = followupCount - completedFollowupCount;
    
    // Get latest followup details
    const latestFollowup = offer.followups?.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    // Calculate days to conversion if applicable
    let daysToConversion = "-";
    if (offer.converted && offer.conversionDate) {
      const conversionDate = new Date(offer.conversionDate);
      const dayDiff = Math.round((conversionDate.getTime() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
      daysToConversion = dayDiff.toString();
    }
    
    return {
      'ID': offer.id,
      'Case Number': offer.caseNumber,
      'Offer Type': offer.offerType,
      'Channel': offer.channel,
      'Date': format(offerDate, 'yyyy-MM-dd'),
      'Time': format(offerDate, 'HH:mm:ss'),
      'Day of Week': format(offerDate, 'EEEE'),
      'Month': format(offerDate, 'MMMM'),
      'Year': format(offerDate, 'yyyy'),
      'CSAT': offer.csat ? offer.csat.charAt(0).toUpperCase() + offer.csat.slice(1) : '-',
      'CSAT Comment': offer.csatComment || '-',
      'Converted': offer.converted === true ? 'Yes' : (offer.converted === false ? 'No' : 'Pending'),
      'Conversion Date': offer.conversionDate ? format(new Date(offer.conversionDate), 'yyyy-MM-dd') : '-',
      'Days to Conversion': daysToConversion,
      'Followups Total': followupCount.toString(),
      'Followups Completed': completedFollowupCount.toString(),
      'Followups Pending': pendingFollowupCount.toString(),
      'Latest Followup Date': latestFollowup ? format(new Date(latestFollowup.date), 'yyyy-MM-dd') : '-',
      'Latest Followup Status': latestFollowup ? (latestFollowup.completed ? 'Completed' : 'Pending') : '-',
      'Latest Followup Notes': latestFollowup?.notes || '-',
      'Notes': offer.notes || '-',
    };
  });
}

// Helper function to get active followup date (from either format)
const getActiveFollowupDate = (offer: Offer): string | undefined => {
  // Check followups array first
  if (offer.followups && offer.followups.length > 0) {
    const activeFollowups = offer.followups
      .filter(followup => !followup.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (activeFollowups.length > 0) {
      return activeFollowups[0].date;
    }
  }
  
  // Fall back to legacy followupDate
  return offer.followupDate;
};

// Helper function to check if offer has any active followups
const hasActiveFollowup = (offer: Offer): boolean => {
  // Check followups array
  if (offer.followups && offer.followups.length > 0) {
    return offer.followups.some(followup => !followup.completed);
  }
  // Check legacy followupDate
  return !!offer.followupDate;
};

export const exportOffersToCSV = (offers: Offer[], dateRangeText = '') => {
  if (offers.length === 0) {
    console.error('No offers to export');
    return;
  }
  
  // Use the enhanced prepareOfferData function
  const offerData = prepareOfferData(offers);
  
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Offers');
  
  // Add headers
  const headers = Object.keys(offerData[0]);
  worksheet.addRow(headers);
  
  // Add data
  offerData.forEach(offer => {
    worksheet.addRow(offer);
  });
  
  // Generate CSV
  const rows = worksheet.getRows(1, worksheet.rowCount) || [];
  const csvContent = rows.map(row => {
    const values = Object.values(row.values || {}).slice(1);
    return values.map(cell => {
      const value = String(cell || '').replace(/"/g, '""');
      return value.includes(',') ? `"${value}"` : value;
    }).join(',');
  }).join('\n');
  
  // Export the file
  const fileName = dateRangeText 
    ? `offer-data-${dateRangeText}.csv`
    : `offer-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  saveAs(blob, fileName);
  
  return fileName;
};

// Export a basic template for importing offers
export function exportImportTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template');

  // Define columns with headers that match exactly what the import function expects
  const headers = [
    'Date',
    'Offer Type',
    'Channel',
    'Case Number',
    'Notes',
    'Converted',
    'CSAT',
    'CSAT Comment',
    'Follow-up Date'
  ];

  // Add headers
  worksheet.addRow(headers);

  // Add example data
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Add a minimal example (with only required fields)
  worksheet.addRow([
    format(today, 'yyyy-MM-dd'),
    'Website Plan',
    'Chat',
    '',
    '',
    '',
    '',
    '',
    ''
  ]);

  // Add a complete example
  worksheet.addRow([
    format(today, 'yyyy-MM-dd'),
    'Google Workspace',
    'Email',
    '12345',
    'Sample notes about the offer',
    'true',
    'positive',
    'Customer was very happy with the service',
    format(tomorrow, 'yyyy-MM-dd')
  ]);

  // Generate CSV
  const rows = worksheet.getRows(1, worksheet.rowCount) || [];
  const csvContent = rows.map(row => {
    const values = row.values ? Object.values(row.values).slice(1) : [];
    return values.map(cell => {
      const value = String(cell || '').replace(/"/g, '""');
      return value.includes(',') || value.includes('\n') ? `"${value}"` : value;
    }).join(',');
  }).join('\n');

  // Export the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'offer-import-template.csv');
}
