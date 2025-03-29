
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Offer } from '@/context/OfferContext';
import { format } from 'date-fns';

export function exportToCsv(offers: Offer[], dateRangeText = '') {
  if (offers.length === 0) {
    console.error('No offers to export');
    return;
  }
  
  // Prepare the data for export
  const offerData = prepareOfferData(offers);
  
  // Convert to CSV
  const worksheet = XLSX.utils.json_to_sheet(offerData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  // Export the file
  const fileName = dateRangeText 
    ? `offer-data-${dateRangeText}.csv`
    : `offer-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  
  saveAs(blob, fileName);
  
  return fileName;
}

// Helper function to prepare offer data for export
function prepareOfferData(offers: Offer[]) {
  return offers.map((offer) => {
    const offerDate = new Date(offer.date);
    
    return {
      'Case Number': offer.caseNumber,
      'Offer Type': offer.offerType,
      'Channel': offer.channel,
      'Date': format(offerDate, 'yyyy-MM-dd'),
      'Time': format(offerDate, 'HH:mm:ss'),
      'CSAT': offer.csat ? offer.csat.charAt(0).toUpperCase() + offer.csat.slice(1) : '-',
      'CSAT Comment': offer.csatComment || '-',
      'Converted': offer.converted === true ? 'Yes' : (offer.converted === false ? 'No' : '-'),
      'Conversion Date': offer.conversionDate ? format(new Date(offer.conversionDate), 'yyyy-MM-dd') : '-',
      'Follow-up Date': offer.followupDate ? format(new Date(offer.followupDate), 'yyyy-MM-dd') : '-',
      'Notes': offer.notes || '-',
    };
  });
}
