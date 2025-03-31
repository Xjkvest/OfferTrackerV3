import ExcelJS from 'exceljs';
import { Offer } from '@/context/OfferContext';
import { v4 as uuidv4 } from 'uuid';

// Column mapping for import
const COLUMN_MAP = {
  'date': ['date', 'offer date', 'offerdate'],
  'offerType': ['offer type', 'offertype', 'offer_type', 'type'],
  'channel': ['channel', 'channel type'],
  'notes': ['notes', 'comment', 'comments', 'description'],
  'converted': ['converted', 'isconverted', 'is converted', 'conversion'],
  'csat': ['csat', 'satisfaction', 'customer satisfaction', 'rating'],
  'csatComment': ['csatcomment', 'csat comment', 'satisfaction comment', 'rating comment'],
  'caseNumber': ['casenumber', 'case number', 'case', 'case_number', 'case id'],
  'followupDate': ['followupdate', 'follow up date', 'followup date', 'follow-up date']
};

// Helper function to find column index by header
const findColumnIndex = (headers: string[], field: string): number => {
  const possibleNames = COLUMN_MAP[field as keyof typeof COLUMN_MAP] || [field];
  const headerIndex = headers.findIndex(h => 
    possibleNames.includes(h.toLowerCase().trim())
  );
  return headerIndex !== -1 ? headerIndex : -1;
};

export const importFromExcel = async (file: File): Promise<Offer[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          throw new Error('No worksheet found in the file');
        }

        // Get headers from first row
        const headers = worksheet.getRow(1).values as string[];
        if (!headers || headers.length === 0) {
          throw new Error('No headers found in the file');
        }

        // Find column indices
        const columnIndices = {
          date: findColumnIndex(headers, 'date'),
          offerType: findColumnIndex(headers, 'offerType'),
          channel: findColumnIndex(headers, 'channel'),
          caseNumber: findColumnIndex(headers, 'caseNumber'),
          notes: findColumnIndex(headers, 'notes'),
          converted: findColumnIndex(headers, 'converted'),
          csat: findColumnIndex(headers, 'csat'),
          csatComment: findColumnIndex(headers, 'csatComment'),
          followupDate: findColumnIndex(headers, 'followupDate')
        };

        // Validate required columns
        if (columnIndices.date === -1) throw new Error('Required column "Date" not found');
        if (columnIndices.offerType === -1) throw new Error('Required column "Offer Type" not found');
        if (columnIndices.channel === -1) throw new Error('Required column "Channel" not found');

        const offers: Offer[] = [];
        let rowNumber = 1;

        worksheet.eachRow((row, index) => {
          if (index === 1) return; // Skip header row
          rowNumber = index;

          const offer: Offer = {
            id: uuidv4(),
            date: String(row.getCell(columnIndices.date + 1).value || new Date().toISOString()),
            offerType: String(row.getCell(columnIndices.offerType + 1).value || ''),
            channel: String(row.getCell(columnIndices.channel + 1).value || ''),
            caseNumber: columnIndices.caseNumber !== -1 ? String(row.getCell(columnIndices.caseNumber + 1).value || '') : '',
            notes: columnIndices.notes !== -1 ? String(row.getCell(columnIndices.notes + 1).value || '') : '',
            converted: columnIndices.converted !== -1 ? String(row.getCell(columnIndices.converted + 1).value).toLowerCase() === 'true' : undefined,
            csat: columnIndices.csat !== -1 ? row.getCell(columnIndices.csat + 1).value as 'positive' | 'neutral' | 'negative' | undefined : undefined,
            csatComment: columnIndices.csatComment !== -1 ? String(row.getCell(columnIndices.csatComment + 1).value || '') : '',
            followupDate: columnIndices.followupDate !== -1 ? String(row.getCell(columnIndices.followupDate + 1).value || '') : undefined
          };

          // Validate required fields
          if (!offer.date) throw new Error(`Missing required field "Date" at row ${rowNumber}`);
          if (!offer.offerType) throw new Error(`Missing required field "Offer Type" at row ${rowNumber}`);
          if (!offer.channel) throw new Error(`Missing required field "Channel" at row ${rowNumber}`);

          offers.push(offer);
        });

        resolve(offers);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const importFromCSV = async (file: File): Promise<Offer[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Imported Data');
        
        // Parse CSV content and get headers
        const rows = text.split('\n').map(row => 
          row.split(',').map(cell => {
            const value = cell.trim();
            return value.startsWith('"') && value.endsWith('"') 
              ? value.slice(1, -1).replace(/""/g, '"')
              : value;
          })
        );

        if (rows.length < 2) {
          throw new Error('File must contain at least a header row and one data row');
        }

        const headers = rows[0];
        
        // Find column indices
        const columnIndices = {
          date: findColumnIndex(headers, 'date'),
          offerType: findColumnIndex(headers, 'offerType'),
          channel: findColumnIndex(headers, 'channel'),
          caseNumber: findColumnIndex(headers, 'caseNumber'),
          notes: findColumnIndex(headers, 'notes'),
          converted: findColumnIndex(headers, 'converted'),
          csat: findColumnIndex(headers, 'csat'),
          csatComment: findColumnIndex(headers, 'csatComment'),
          followupDate: findColumnIndex(headers, 'followupDate')
        };

        // Validate required columns
        if (columnIndices.date === -1) throw new Error('Required column "Date" not found');
        if (columnIndices.offerType === -1) throw new Error('Required column "Offer Type" not found');
        if (columnIndices.channel === -1) throw new Error('Required column "Channel" not found');

        const offers: Offer[] = [];
        
        // Process data rows
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows

          const offer: Offer = {
            id: uuidv4(),
            date: row[columnIndices.date] || new Date().toISOString(),
            offerType: row[columnIndices.offerType] || '',
            channel: row[columnIndices.channel] || '',
            caseNumber: columnIndices.caseNumber !== -1 ? row[columnIndices.caseNumber] || '' : '',
            notes: columnIndices.notes !== -1 ? row[columnIndices.notes] || '' : '',
            converted: columnIndices.converted !== -1 ? row[columnIndices.converted].toLowerCase() === 'true' : undefined,
            csat: columnIndices.csat !== -1 ? row[columnIndices.csat] as 'positive' | 'neutral' | 'negative' | undefined : undefined,
            csatComment: columnIndices.csatComment !== -1 ? row[columnIndices.csatComment] || '' : '',
            followupDate: columnIndices.followupDate !== -1 ? row[columnIndices.followupDate] || undefined : undefined
          };

          // Validate required fields
          if (!offer.date) throw new Error(`Missing required field "Date" at row ${i + 1}`);
          if (!offer.offerType) throw new Error(`Missing required field "Offer Type" at row ${i + 1}`);
          if (!offer.channel) throw new Error(`Missing required field "Channel" at row ${i + 1}`);

          offers.push(offer);
        }

        resolve(offers);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsText(file);
  });
}; 