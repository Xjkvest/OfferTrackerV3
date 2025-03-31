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
import { exportImportTemplate } from "@/utils/exportData";
import { importFromExcel, importFromCSV } from '@/utils/importData';
import { Offer } from '@/context/OfferContext';

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

interface ImportOffersProps {
  onImport: (offers: Offer[]) => void;
}

export const ImportOffers: React.FC<ImportOffersProps> = ({ onImport }) => {
  const { offers, addOffer, updateOffer } = useOffers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [csvData, setCsvData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importStatus, setImportStatus] = useState<{added: number, skipped: number}>({ added: 0, skipped: 0 });
  const [isImporting, setIsImporting] = useState(false);
  
  const downloadTemplate = () => {
    exportImportTemplate();
    
    toast({
      title: "Template Downloaded",
      description: "The CSV template has been downloaded with example data.",
    });
  };
  
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.debug('[ImportOffers] No file selected');
      return;
    }

    console.debug('[ImportOffers] Starting import for file:', file.name);
    setIsImporting(true);
    setErrors([]);
    setImportComplete(false);
    
    try {
      let importedOffers: Offer[];
      
      if (file.name.endsWith('.xlsx')) {
        console.debug('[ImportOffers] Processing Excel file');
        importedOffers = await importFromExcel(file);
      } else if (file.name.endsWith('.csv')) {
        console.debug('[ImportOffers] Processing CSV file');
        importedOffers = await importFromCSV(file);
      } else {
        throw new Error('Unsupported file format. Please use .xlsx or .csv files.');
      }

      console.debug('[ImportOffers] Imported offers:', importedOffers.length);
      if (importedOffers.length === 0) {
        throw new Error('No valid offers found in the file.');
      }

      // Validate the imported data
      const { validOffers, duplicateOffers, validationErrors } = validateImportedOffers(importedOffers);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (duplicateOffers.length > 0) {
        setDuplicates(duplicateOffers);
        setCsvData(validOffers);
        setShowDuplicateDialog(true);
        return;
      }

      // If no duplicates, proceed with import
      await importValidOffers(validOffers);

    } catch (error) {
      console.error('[ImportOffers] Import error:', error);
      toast({
        description: error instanceof Error ? error.message : 'Failed to import offers.',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validateImportedOffers = (importedOffers: Offer[]) => {
    const validationErrors: string[] = [];
    const validOffers: Offer[] = [];
    const duplicateOffers: Offer[] = [];

    importedOffers.forEach((offer, index) => {
      // Validate required fields
      if (!offer.date) {
        validationErrors.push(`Missing required field 'date' at row ${index + 1}`);
        return;
      }
      if (!offer.offerType) {
        validationErrors.push(`Missing required field 'offerType' at row ${index + 1}`);
        return;
      }
      if (!offer.channel) {
        validationErrors.push(`Missing required field 'channel' at row ${index + 1}`);
        return;
      }

      // Validate dates
      try {
        const date = new Date(offer.date);
        if (isNaN(date.getTime())) {
          validationErrors.push(`Invalid date format at row ${index + 1}: '${offer.date}'`);
          return;
        }

        if (offer.followupDate) {
          const followupDate = new Date(offer.followupDate);
          if (isNaN(followupDate.getTime())) {
            validationErrors.push(`Invalid followup date format at row ${index + 1}: '${offer.followupDate}'`);
            return;
          }
        }
      } catch (e) {
        validationErrors.push(`Error processing dates at row ${index + 1}`);
        return;
      }

      // Check for duplicates
      const isDuplicate = offer.caseNumber && offers.some(existingOffer => 
        existingOffer.caseNumber === offer.caseNumber && 
        existingOffer.caseNumber !== "" && 
        new Date(existingOffer.date).toDateString() === new Date(offer.date).toDateString()
      );

      if (isDuplicate) {
        duplicateOffers.push(offer);
      } else {
        validOffers.push(offer);
      }
    });

    return { validOffers, duplicateOffers, validationErrors };
  };

  const importValidOffers = async (validOffers: Offer[]) => {
    let successCount = 0;
    const importErrors: string[] = [];

    for (const offer of validOffers) {
      try {
        await addOffer({
          caseNumber: offer.caseNumber || "",
          channel: offer.channel,
          offerType: offer.offerType,
          notes: offer.notes || "",
          converted: offer.converted,
          csat: offer.csat || undefined,
          csatComment: offer.csatComment || "",
          followupDate: offer.followupDate ? new Date(offer.followupDate).toISOString() : undefined,
        });
        successCount++;
      } catch (error) {
        console.error("Error importing offer:", error, offer);
        importErrors.push(`Error importing offer with case number ${offer.caseNumber || 'unknown'}: ${error}`);
      }
    }

    if (importErrors.length > 0) {
      setErrors(importErrors);
    }

    setImportComplete(true);
    setImportStatus({
      added: successCount,
      skipped: duplicates.length
    });

    if (successCount > 0) {
      toast({
        title: "Import Successful",
        description: `✅ ${successCount} offers imported successfully`,
      });
    }
  };

  const handleSkipDuplicates = async () => {
    setShowDuplicateDialog(false);
    await importValidOffers(csvData);
  };

  const handleReplaceDuplicates = async () => {
    setShowDuplicateDialog(false);
    
    // First update existing offers
    for (const duplicate of duplicates) {
      const existingOffer = offers.find(offer => 
        offer.caseNumber === duplicate.caseNumber && 
        new Date(offer.date).toDateString() === new Date(duplicate.date).toDateString()
      );
      
      if (existingOffer) {
        await updateOffer(existingOffer.id, {
          offerType: duplicate.offerType,
          channel: duplicate.channel,
          notes: duplicate.notes,
          converted: duplicate.converted,
          csat: duplicate.csat,
          csatComment: duplicate.csatComment,
          followupDate: duplicate.followupDate
        });
      }
    }
    
    // Then import the non-duplicate entries
    await importValidOffers([...csvData, ...duplicates]);
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
                accept=".csv,.xlsx"
                onChange={handleFileImport}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
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
