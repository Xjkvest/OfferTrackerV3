import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Offer } from '@/context/OfferContext';
import { useFilters } from '@/context/FilterContext';
import { getFilteredOffers } from '@/utils/performanceUtils';
import { formatDateForStorage } from '@/utils/dateUtils';

const ConversionVelocityAnalysis = ({ offers }: { offers: Offer[] }) => {
  const { filters } = useFilters();

  // Use the filters from FilterContext to filter offers
  const filteredOffers = useMemo(() => {
    return getFilteredOffers(
      offers,
      filters.dateRange.start && filters.dateRange.end 
        ? { 
            start: filters.dateRange.start instanceof Date 
              ? formatDateForStorage(filters.dateRange.start) 
              : String(filters.dateRange.start), 
            end: filters.dateRange.end instanceof Date 
              ? formatDateForStorage(filters.dateRange.end) 
              : String(filters.dateRange.end) 
          } 
        : null,
      filters.channels.length > 0 ? filters.channels : null,
      filters.offerTypes.length > 0 ? filters.offerTypes : null,
      filters.csat ? filters.csat[0] : null,
      filters.converted,
      filters.hasFollowup
    );
  }, [offers, filters]);

  // Calculate conversion velocity metrics
  const metrics = useMemo(() => {
    // Debug logging
    console.log('Filtered offers:', filteredOffers.length);
    
    const convertedOffers = filteredOffers.filter(offer => {
      if (!offer.converted || !offer.conversionDate) {
        return false;
      }
      
      // Validate conversion date
      try {
        const convDate = new Date(offer.conversionDate);
        return !isNaN(convDate.getTime());
      } catch (e) {
        console.error('Invalid conversion date:', offer.conversionDate);
        return false;
      }
    });
    
    console.log('Converted offers:', convertedOffers.length);
    
    if (convertedOffers.length === 0) {
      return {
        averageDaysToConversion: 0,
        conversionRate: 0,
        totalOffers: filteredOffers.length,
        convertedOffers: 0
      };
    }

    // Calculate average days to conversion
    const totalDaysToConversion = convertedOffers.reduce((sum, offer) => {
      try {
        const offerDate = new Date(offer.date);
        const conversionDate = new Date(offer.conversionDate!);
        
        // Validate both dates
        if (isNaN(offerDate.getTime()) || isNaN(conversionDate.getTime())) {
          console.error('Invalid date in calculation:', { offerDate, conversionDate });
          return sum;
        }
        
        const days = Math.max(0, Math.round((conversionDate.getTime() - offerDate.getTime()) / (1000 * 60 * 60 * 24)));
        console.log('Offer:', offer.offerType, 'Days to conversion:', days);
        return sum + days;
      } catch (e) {
        console.error('Error calculating days to conversion:', e);
        return sum;
      }
    }, 0);

    const averageDaysToConversion = convertedOffers.length > 0 ? 
      Math.round(totalDaysToConversion / convertedOffers.length) : 0;
    const conversionRate = filteredOffers.length > 0 ? 
      (convertedOffers.length / filteredOffers.length) * 100 : 0;

    return {
      averageDaysToConversion,
      conversionRate,
      totalOffers: filteredOffers.length,
      convertedOffers: convertedOffers.length
    };
  }, [filteredOffers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Velocity Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Average Days to Conversion</h3>
              <p className="text-2xl font-bold">{metrics.averageDaysToConversion} days</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
              <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Total Offers</h3>
              <p className="text-2xl font-bold">{metrics.totalOffers}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Converted Offers</h3>
              <p className="text-2xl font-bold">{metrics.convertedOffers}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionVelocityAnalysis; 