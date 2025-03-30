import React, { useState, useRef } from "react";
import { useOffers } from "@/context/OfferContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, AlertTriangle, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { exportImportTemplate } from "@/utils/exportData";

// Accept both lowercase and uppercase column names for flexibility
const REQUIRED_HEADERS = ["date", "offerType", "channel"];
const OPTIONAL_HEADERS = ["notes", "converted", "csat", "csatComment", "caseNumber", "followupDate"];
const HEADERS = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];

const HEADER_ALTERNATIVES = {
  "date": ["date", "offer date", "offerdate"],
  "offerType": ["offertype", "offer type", "offer_type", "type"],
  "channel": ["channel", "channel type"],
  "notes": ["notes", "comment", "comments", "description"],
  "converted": ["converted", "isconverted", "is converted", "conversion"],
  "csat": ["csat", "satisfaction", "customer satisfaction", "rating"],
  "csatComment": ["csatcomment", "csat comment", "satisfaction comment", "rating comment"],
  "caseNumber": ["casenumber", "case number", "case", "case_number", "case id"],
  "followupDate": ["followupdate", "follow up date", "followup date", "follow-up date"]
};

// Column help text for the CSV import
const COLUMN_INSTRUCTIONS = {
  date: "REQUIRED: The date of the offer (YYYY-MM-DD format or ISO format)",
  offerType: "REQUIRED: The type of offer (must match one of your configured offer types)",
  channel: "REQUIRED: The channel through which the offer was made (must match one of your configured channels)",
  notes: "OPTIONAL: Any notes about the offer (leave blank for none)",
  converted: "OPTIONAL: Whether the offer was converted ('true' or 'false')",
  csat: "OPTIONAL: Customer satisfaction ('positive', 'neutral', 'negative', or blank for unknown)",
  csatComment: "OPTIONAL: Comments related to customer satisfaction (leave blank for none)",
  caseNumber: "OPTIONAL: The case number for the offer (leave blank for none)",
  followupDate: "OPTIONAL: The date for following up (YYYY-MM-DD format, ISO format, or blank for none)"
};

export function ImportOffers() {
  const { offers, addOffer, updateOffer } = useOffers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [csvData, setCsvData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importStatus, setImportStatus] = useState<{added: number, skipped: number}>({ added: 0, skipped: 0 });
  
  const downloadTemplate = () => {
    exportImportTemplate();
    
    toast({
      title: "Template Downloaded",
      description: "The CSV template has been downloaded with example data.",
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setErrors([]);
    setCsvData([]);
    setDuplicates([]);
    setImportComplete(false);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        if (!evt.target?.result) return;
        
        const workbook = XLSX.read(evt.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        // Process the data
        if (data.length <= 1) {
          setErrors(["The file appears to be empty or only contains headers."]);
          return;
        }
        
        // Map the headers to our expected headers, accounting for alternatives
        const headerRow = data[0] as string[];
        const normalizedHeaders = headerRow.map(header => {
          if (typeof header !== 'string') return String(header);
          const headerLower = header.toLowerCase().trim();
          
          // Find the matching standard header key
          for (const [standardKey, alternatives] of Object.entries(HEADER_ALTERNATIVES)) {
            if (alternatives.includes(headerLower)) {
              return standardKey;
            }
          }
          return headerLower; // Return as-is if no match
        });
        
        // Check for missing required headers
        const missingRequiredHeaders = [];
        for (const requiredHeader of REQUIRED_HEADERS) {
          if (!normalizedHeaders.includes(requiredHeader)) {
            missingRequiredHeaders.push(requiredHeader);
          }
        }
        
        if (missingRequiredHeaders.length > 0) {
          setErrors([`Missing required columns: ${missingRequiredHeaders.join(', ')}`]);
          return;
        }
        
        // Convert data to objects with normalized keys
        const jsonData = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i] as any[];
          if (row.every(cell => cell === "")) continue; // Skip completely empty rows
          
          const obj: Record<string, any> = {};
          for (let j = 0; j < normalizedHeaders.length; j++) {
            if (j < row.length) {
              obj[normalizedHeaders[j]] = row[j];
            }
          }
          jsonData.push(obj);
        }
        
        validateCsvData(jsonData);
      } catch (error) {
        console.error("CSV parsing error:", error);
        setErrors(["Failed to parse CSV file. Please ensure it's properly formatted."]);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  const validateCsvData = (data: any[]) => {
    if (data.length === 0) {
      setErrors(["The file appears to be empty."]);
      return;
    }
    
    const newErrors: string[] = [];
    const validData: any[] = [];
    const duplicateData: any[] = [];
    
    // Validate data types and find duplicates
    data.forEach((row, index) => {
      // Skip entirely empty rows
      if (Object.values(row).every(val => val === "")) return;
      
      // Check required fields
      if (!row.date) {
        newErrors.push(`Missing required field 'date' at row ${index + 1}`);
        return;
      }
      
      if (!row.offerType) {
        newErrors.push(`Missing required field 'offerType' at row ${index + 1}`);
        return;
      }
      
      if (!row.channel) {
        newErrors.push(`Missing required field 'channel' at row ${index + 1}`);
        return;
      }
      
      // Convert boolean strings to actual booleans
      if (typeof row.converted === 'string') {
        row.converted = row.converted.toLowerCase() === 'true';
      }
      
      // Validate CSAT values
      if (row.csat && !['positive', 'neutral', 'negative'].includes(row.csat.toLowerCase())) {
        // Convert number ratings to sentiment strings
        const csatNum = parseInt(row.csat);
        if (!isNaN(csatNum)) {
          if (csatNum >= 4) row.csat = 'positive';
          else if (csatNum >= 2) row.csat = 'neutral';
          else row.csat = 'negative';
        } else {
          // Try to normalize text values
          const csatLower = row.csat.toLowerCase();
          if (csatLower.includes('good') || csatLower.includes('great') || csatLower.includes('pos')) {
            row.csat = 'positive';
          } else if (csatLower.includes('bad') || csatLower.includes('neg')) {
            row.csat = 'negative';
          } else if (csatLower.includes('neut') || csatLower.includes('ok')) {
            row.csat = 'neutral';
          } else {
            newErrors.push(`Invalid CSAT value at row ${index + 1}: '${row.csat}' (must be 'positive', 'neutral', or 'negative')`);
          }
        }
      }
      
      // Ensure proper date format
      try {
        if (row.date) {
          const date = new Date(row.date);
          if (isNaN(date.getTime())) {
            newErrors.push(`Invalid date format at row ${index + 1}: '${row.date}'`);
            return;
          }
        }
        
        if (row.followupDate && row.followupDate !== "") {
          const followupDate = new Date(row.followupDate);
          if (isNaN(followupDate.getTime())) {
            newErrors.push(`Invalid followup date format at row ${index + 1}: '${row.followupDate}'`);
            return;
          }
        }
      } catch (e) {
        newErrors.push(`Error processing dates at row ${index + 1}`);
        return;
      }
      
      // Check for duplicates based on case number and date
      const isDuplicate = row.caseNumber && offers.some(offer => 
        offer.caseNumber === row.caseNumber && 
        offer.caseNumber !== "" && // Only check if case number is not empty
        new Date(offer.date).toDateString() === new Date(row.date).toDateString()
      );
      
      if (isDuplicate) {
        duplicateData.push(row);
      } else {
        validData.push(row);
      }
    });
    
    setErrors(newErrors);
    setCsvData(validData);
    setDuplicates(duplicateData);
    
    // If we have duplicates, show the dialog
    if (duplicateData.length > 0) {
      setShowDuplicateDialog(true);
    } else if (newErrors.length === 0 && validData.length > 0) {
      importOffers(validData);
    }
  };
  
  const handleSkipDuplicates = () => {
    setShowDuplicateDialog(false);
    importOffers(csvData);
  };
  
  const handleReplaceDuplicates = () => {
    setShowDuplicateDialog(false);
    
    // First update existing offers
    duplicates.forEach(duplicate => {
      const existingOffer = offers.find(offer => 
        offer.caseNumber === duplicate.caseNumber && 
        new Date(offer.date).toDateString() === new Date(duplicate.date).toDateString()
      );
      
      if (existingOffer) {
        updateOffer(existingOffer.id, {
          offerType: duplicate.offerType,
          channel: duplicate.channel,
          notes: duplicate.notes,
          converted: duplicate.converted,
          csat: duplicate.csat,
          csatComment: duplicate.csatComment,
          followupDate: duplicate.followupDate
        });
      }
    });
    
    // Then import the non-duplicate entries
    importOffers([...csvData, ...duplicates]);
  };
  
  const importOffers = (data: any[]) => {
    // Add all valid offers
    let successCount = 0;
    
    data.forEach(row => {
      try {
        addOffer({
          caseNumber: row.caseNumber || "",
          channel: row.channel,
          offerType: row.offerType,
          notes: row.notes || "",
          converted: row.converted,
          csat: row.csat || undefined,
          csatComment: row.csatComment || "",
          followupDate: row.followupDate ? new Date(row.followupDate).toISOString() : undefined,
        });
        successCount++;
      } catch (error) {
        console.error("Error importing offer:", error, row);
        setErrors(prev => [...prev, `Error importing row with case number ${row.caseNumber || 'unknown'}: ${error}`]);
      }
    });
    
    setImportComplete(true);
    setImportStatus({
      added: successCount,
      skipped: duplicates.length
    });
    
    // Show toast
    toast({
      title: "Import Successful",
      description: `✅ ${successCount} offers imported successfully`,
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="rounded-2xl bg-muted/10 p-2 shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-bold text-amber-600 dark:text-amber-400">Offer Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="csvFile">Import Offers from CSV</Label>
          <p className="text-sm text-muted-foreground">
            Import offers from a CSV file. Download the template to see the correct format.
          </p>
          
          <div className="bg-muted/30 p-4 rounded-md">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
              CSV Format Instructions
            </h3>
            
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground/90">Required Columns:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 mt-2">
                {REQUIRED_HEADERS.map(header => (
                  <div key={header} className="flex flex-col">
                    <div className="flex items-center">
                      <Badge variant="destructive" className="mr-2">{header}</Badge>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                            <HelpCircle className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <p className="text-xs font-medium">{COLUMN_INSTRUCTIONS[header as keyof typeof COLUMN_INSTRUCTIONS]}</p>
                            <p className="text-xs">
                              <span className="font-medium">Alternatives:</span> {HEADER_ALTERNATIVES[header as keyof typeof HEADER_ALTERNATIVES].join(', ')}
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="font-medium text-foreground/90 mt-4">Optional Columns:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 mt-2">
                {OPTIONAL_HEADERS.map(header => (
                  <div key={header} className="flex flex-col">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">{header}</Badge>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                            <HelpCircle className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <p className="text-xs font-medium">{COLUMN_INSTRUCTIONS[header as keyof typeof COLUMN_INSTRUCTIONS]}</p>
                            <p className="text-xs">
                              <span className="font-medium">Alternatives:</span> {HEADER_ALTERNATIVES[header as keyof typeof HEADER_ALTERNATIVES].join(', ')}
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-1 mt-3">
                <p className="font-medium text-foreground/90">CSV Import Notes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Only the date, offerType, and channel fields are required</li>
                  <li>For text fields (notes, csatComment): Leave the cell blank or use an empty string ""</li>
                  <li>For optional dates (followupDate): Leave the cell blank or use an empty string ""</li>
                  <li>For csat rating: Leave blank for unknown, or use "positive", "neutral", "negative"</li>
                  <li>For converted: Use "true" or "false", or leave blank for undetermined</li>
                  <li>Case numbers are optional but help identify duplicates</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 my-4">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
            <div className="relative flex-1 sm:flex-none">
              <Input
                ref={fileInputRef}
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button 
                variant="default" 
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </div>
          </div>
          
          {errors.length > 0 && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md p-3 mt-4">
              <div className="flex items-center text-red-700 dark:text-red-400 font-medium mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Import Errors
              </div>
              <ul className="space-y-1 pl-4 text-sm">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-600 dark:text-red-400">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {importComplete && errors.length === 0 && (
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md p-3 mt-4">
              <div className="flex items-center text-green-700 dark:text-green-400 font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Import Complete
              </div>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                ✅ {importStatus.added} offers imported successfully
                {importStatus.skipped > 0 && `, ${importStatus.skipped} duplicates skipped`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              Duplicate Offers Found
            </DialogTitle>
            <DialogDescription>
              {duplicates.length} offer(s) with the same case number and date already exist. How would you like to proceed?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
            <p className="text-sm font-medium mb-2">Duplicates:</p>
            {duplicates.map((dup, index) => (
              <div key={index} className="text-sm mb-1 flex">
                <Badge variant="outline" className="mr-2">Case #{dup.caseNumber}</Badge>
                <span className="text-muted-foreground">{new Date(dup.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSkipDuplicates} className="sm:w-auto w-full">
              Skip Duplicates
            </Button>
            <Button onClick={handleReplaceDuplicates} className="sm:w-auto w-full">
              Replace Existing Offers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
