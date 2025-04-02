import ExcelJS from 'exceljs';
import { Offer } from '@/context/OfferContext';
import { v4 as uuidv4 } from 'uuid';
import { parse as parseDate, isValid } from 'date-fns';

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

// Helper function to validate and parse date strings
const validateAndParseDate = (dateStr: string, rowNum: number, fieldName: string): string => {
  if (!dateStr || dateStr.trim() === '') {
    throw new Error(`Missing required ${fieldName} at row ${rowNum}`);
  }
  
  // Try different date formats
  let date: Date | null = null;
  
  // Try ISO format first
  date = new Date(dateStr);
  
  // If not valid, try other common formats
  if (!isValid(date)) {
    // Try YYYY-MM-DD
    date = parseDate(dateStr, 'yyyy-MM-dd', new Date());
    
    // Try MM/DD/YYYY
    if (!isValid(date)) {
      date = parseDate(dateStr, 'MM/dd/yyyy', new Date());
    }
    
    // Try DD/MM/YYYY
    if (!isValid(date)) {
      date = parseDate(dateStr, 'dd/MM/yyyy', new Date());
    }
  }
  
  if (!isValid(date)) {
    throw new Error(`Invalid ${fieldName} format at row ${rowNum}: '${dateStr}'`);
  }
  
  return date.toISOString();
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

          const dateValue = String(row.getCell(columnIndices.date + 1).value || '');
          let date: string;
          
          try {
            date = validateAndParseDate(dateValue, rowNumber, "Date");
          } catch (error) {
            throw error;
          }

          const offer: Offer = {
            id: uuidv4(),
            date,
            offerType: String(row.getCell(columnIndices.offerType + 1).value || ''),
            channel: String(row.getCell(columnIndices.channel + 1).value || ''),
            caseNumber: columnIndices.caseNumber !== -1 ? String(row.getCell(columnIndices.caseNumber + 1).value || '') : '',
            notes: columnIndices.notes !== -1 ? String(row.getCell(columnIndices.notes + 1).value || '') : '',
            converted: columnIndices.converted !== -1 ? String(row.getCell(columnIndices.converted + 1).value || '').toLowerCase() === 'true' : undefined,
            csat: columnIndices.csat !== -1 ? row.getCell(columnIndices.csat + 1).value as 'positive' | 'neutral' | 'negative' | undefined : undefined,
            csatComment: columnIndices.csatComment !== -1 ? String(row.getCell(columnIndices.csatComment + 1).value || '') : '',
            followupDate: undefined
          };

          // Process follow-up date if provided
          if (columnIndices.followupDate !== -1) {
            const followupValue = String(row.getCell(columnIndices.followupDate + 1).value || '');
            if (followupValue && followupValue.trim() !== '') {
              try {
                offer.followupDate = validateAndParseDate(followupValue, rowNumber, "Follow-up Date");
              } catch (error) {
                console.warn(`Invalid follow-up date at row ${rowNumber}, skipping: ${error}`);
              }
            }
          }

          // Validate required fields
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
        
        // Parse CSV content and get headers
        const rows = text.split(/\r?\n/).map(row => 
          row.split(',').map(cell => {
            const value = cell.trim();
            return value.startsWith('"') && value.endsWith('"') 
              ? value.slice(1, -1).replace(/""/g, '"')
              : value;
          })
        ).filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));

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
          
          try {
            // Process and validate the date
            const dateValue = row[columnIndices.date];
            let date: string;
            
            try {
              date = validateAndParseDate(dateValue, i + 1, "Date");
            } catch (error) {
              throw error;
            }
            
            const offer: Offer = {
              id: uuidv4(),
              date,
              offerType: row[columnIndices.offerType] || '',
              channel: row[columnIndices.channel] || '',
              caseNumber: columnIndices.caseNumber !== -1 ? row[columnIndices.caseNumber] || '' : '',
              notes: columnIndices.notes !== -1 ? row[columnIndices.notes] || '' : '',
              converted: columnIndices.converted !== -1 ? row[columnIndices.converted]?.toLowerCase() === 'true' : undefined,
              csat: columnIndices.csat !== -1 ? 
                (row[columnIndices.csat] ? row[columnIndices.csat] as 'positive' | 'neutral' | 'negative' : undefined) : 
                undefined,
              csatComment: columnIndices.csatComment !== -1 ? row[columnIndices.csatComment] || '' : '',
              followupDate: undefined
            };

            // Process follow-up date if provided
            if (columnIndices.followupDate !== -1 && row[columnIndices.followupDate]) {
              try {
                offer.followupDate = validateAndParseDate(row[columnIndices.followupDate], i + 1, "Follow-up Date");
              } catch (error) {
                console.warn(`Invalid follow-up date at row ${i + 1}, skipping: ${error}`);
              }
            }

            // Validate required fields
            if (!offer.offerType) throw new Error(`Missing required field "Offer Type" at row ${i + 1}`);
            if (!offer.channel) throw new Error(`Missing required field "Channel" at row ${i + 1}`);

            offers.push(offer);
          } catch (error) {
            // Skip individual problematic rows with warning instead of failing the entire import
            console.warn(`Skipping row ${i + 1} due to error: ${error}`);
          }
        }

        if (offers.length === 0) {
          throw new Error('No valid offers found in the CSV file');
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