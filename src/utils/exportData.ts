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
};

// Export a basic template for importing offers
export function exportImportTemplate() {
  // Create a sample offer with only required fields
  const minimalOffer: Partial<Offer> = {
    id: "sample-id-1",
    date: new Date().toISOString(),
    caseNumber: "",
    channel: "Chat",
    offerType: "Website Plan",
    notes: "",
  };
  
  // Create a sample offer with all fields
  const completeOffer: Offer = {
    id: "sample-id-2",
    date: new Date().toISOString(),
    caseNumber: "12345",
    channel: "Email",
    offerType: "Google Workspace",
    notes: "Sample notes about the offer",
    csat: "positive",
    csatComment: "Customer was very happy with the service",
    converted: true,
    conversionDate: new Date().toISOString(),
    followupDate: new Date(Date.now() + 86400000).toISOString(),
    followups: [
      {
        id: "followup-1",
        date: new Date(Date.now() + 86400000).toISOString(),
        notes: "Follow up with client about additional services",
        completed: false
      }
    ]
  };

  // Create a minimal CSV using only the necessary import fields
  const importData = [
    {
      'date': format(new Date(minimalOffer.date!), 'yyyy-MM-dd'),
      'offerType': minimalOffer.offerType,
      'channel': minimalOffer.channel,
      'notes': minimalOffer.notes,
      'caseNumber': minimalOffer.caseNumber,
      'converted': '',
      'csat': '',
      'csatComment': '',
      'followupDate': ''
    },
    {
      'date': format(new Date(completeOffer.date), 'yyyy-MM-dd'),
      'offerType': completeOffer.offerType,
      'channel': completeOffer.channel,
      'notes': completeOffer.notes,
      'caseNumber': completeOffer.caseNumber,
      'converted': completeOffer.converted ? 'true' : 'false',
      'csat': completeOffer.csat,
      'csatComment': completeOffer.csatComment,
      'followupDate': completeOffer.followupDate ? format(new Date(completeOffer.followupDate), 'yyyy-MM-dd') : ''
    }
  ];
  
  // Convert to CSV
  const worksheet = XLSX.utils.json_to_sheet(importData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  // Export the file
  const fileName = `offer-import-template.csv`;
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  
  saveAs(blob, fileName);
  
  return fileName;
}
