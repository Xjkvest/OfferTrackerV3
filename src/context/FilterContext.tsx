import React, { createContext, useContext, useState } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  subWeeks,
  startOfQuarter, 
  endOfQuarter, 
  subMonths, 
  startOfYear, 
  subYears,
  subQuarters
} from 'date-fns';

type FilterRange = 
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth' 
  | 'lastMonth'
  | 'lastQuarter'
  | 'yearToDate'
  | 'lastYear'
  | 'custom';

export interface FilterState {
  dateRange: {
    range: FilterRange;
    start: Date | null;
    end: Date | null;
  };
  channels: string[];
  offerTypes: string[];
  csat: ('positive' | 'neutral' | 'negative')[] | null;
  converted: boolean | null;
  hasFollowup: boolean | null;
}

interface FilterContextType {
  filters: FilterState;
  setDateRange: (range: FilterRange, start?: Date, end?: Date) => void;
  setChannels: (channels: string[]) => void;
  setOfferTypes: (types: string[]) => void;
  setCsat: (csat: ('positive' | 'neutral' | 'negative')[] | null) => void;
  setConverted: (converted: boolean | null) => void;
  setHasFollowup: (hasFollowup: boolean | null) => void;
  resetFilters: () => void;
}

const now = new Date();
const thisMonthStart = startOfMonth(now);
const thisMonthEnd = endOfMonth(now);

const initialFilters: FilterState = {
  dateRange: {
    range: 'thisMonth',
    start: thisMonthStart,
    end: thisMonthEnd
  },
  channels: [],
  offerTypes: [],
  csat: null,
  converted: null,
  hasFollowup: null
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      range: 'thisMonth',
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    },
    channels: [],
    offerTypes: [],
    csat: null,
    converted: null,
    hasFollowup: null
  });

  const setDateRange = (range: FilterRange, start?: Date, end?: Date) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case 'thisWeek':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'lastWeek':
        startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        break;
      case 'thisMonth':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case 'lastQuarter':
        startDate = startOfQuarter(subQuarters(now, 1));
        endDate = endOfQuarter(subQuarters(now, 1));
        break;
      case 'yearToDate':
        startDate = startOfYear(now);
        endDate = now;
        break;
      case 'lastYear':
        startDate = startOfYear(subYears(now, 1));
        endDate = endOfMonth(subYears(now, 1));
        break;
      case 'custom':
        if (start && end) {
          startDate = start;
          endDate = end;
        } else {
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
        }
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    setFilters(prev => ({
      ...prev,
      dateRange: {
        range,
        start: startDate,
        end: endDate
      }
    }));
  };

  const setChannels = (channels: string[]) => {
    setFilters(prev => ({ ...prev, channels }));
  };

  const setOfferTypes = (offerTypes: string[]) => {
    setFilters(prev => ({ ...prev, offerTypes }));
  };

  const setCsat = (csat: ('positive' | 'neutral' | 'negative')[] | null) => {
    setFilters(prev => ({ ...prev, csat }));
  };

  const setConverted = (converted: boolean | null) => {
    setFilters(prev => ({ ...prev, converted }));
  };

  const setHasFollowup = (hasFollowup: boolean | null) => {
    setFilters(prev => ({ ...prev, hasFollowup }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setDateRange,
        setChannels,
        setOfferTypes,
        setCsat,
        setConverted,
        setHasFollowup,
        resetFilters
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
