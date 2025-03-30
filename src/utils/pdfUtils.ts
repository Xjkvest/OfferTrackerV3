import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Offer } from '@/context/OfferContext';
import React from 'react';

// Register Helvetica font (built into PDF readers) - no external loading needed
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: undefined, fontWeight: 'normal' }, 
    { src: undefined, fontWeight: 'bold' }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontSize: 12,
    color: '#6b7280',
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#111827',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 10,
  },
  chart: {
    marginTop: 10,
    marginBottom: 10,
    height: 200,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    padding: 10,
  },
});

interface AnalyticsReportProps {
  dateRange: { start: Date; end: Date };
  dailyGoal: number;
  offers: Offer[];
  channelData: Array<{ id: string; label: string; value: number }>;
  offerTypeData: Array<{ id: string; label: string; value: number }>;
  csatData: Array<{ id: string; label: string; value: number }>;
  conversionData: Array<{ id: string; label: string; value: number }>;
  chartData: Array<{ date: string; count: number; goal: number }>;
}

// Using React.createElement to avoid JSX syntax errors
export const AnalyticsReport = (props: AnalyticsReportProps) => {
  const {
    dateRange,
    dailyGoal,
    offers,
    channelData,
    offerTypeData,
    csatData,
    conversionData,
    chartData,
  } = props;

  // Calculate summary statistics
  const totalOffers = offers.length;
  const convertedOffers = offers.filter(o => o.converted).length;
  const conversionRate = totalOffers > 0 ? (convertedOffers / totalOffers) * 100 : 0;
  const averageDailyOffers = totalOffers / Math.max(1, chartData.length);
  const goalAchievementRate = (averageDailyOffers / dailyGoal) * 100;

  // Helper function to format percentages
  const formatPercent = (value: number, total: number) => {
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Build document using React.createElement
  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      
      // Header Section
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          Text, 
          { style: styles.title }, 
          "Analytics Report"
        ),
        React.createElement(
          Text, 
          { style: styles.subtitle }, 
          `${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}`
        )
      ),
      
      // Summary Section
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text, 
          { style: styles.sectionTitle }, 
          "Summary"
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Total Offers:"),
          React.createElement(Text, { style: styles.value }, totalOffers.toString())
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Converted Offers:"),
          React.createElement(Text, { style: styles.value }, convertedOffers.toString())
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Conversion Rate:"),
          React.createElement(Text, { style: styles.value }, `${conversionRate.toFixed(1)}%`)
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Average Daily Offers:"),
          React.createElement(Text, { style: styles.value }, averageDailyOffers.toFixed(1))
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Daily Goal Achievement:"),
          React.createElement(Text, { style: styles.value }, `${goalAchievementRate.toFixed(1)}%`)
        )
      ),
      
      // Channel Distribution
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text, 
          { style: styles.sectionTitle }, 
          "Channel Distribution"
        ),
        React.createElement(
          View,
          { style: styles.table },
          React.createElement(
            View,
            { style: [styles.tableRow, styles.tableHeader] },
            React.createElement(Text, { style: styles.tableCell }, "Channel"),
            React.createElement(Text, { style: styles.tableCell }, "Count"),
            React.createElement(Text, { style: styles.tableCell }, "Percentage")
          ),
          ...channelData.map(channel => 
            React.createElement(
              View,
              { key: channel.id, style: styles.tableRow },
              React.createElement(Text, { style: styles.tableCell }, channel.label),
              React.createElement(Text, { style: styles.tableCell }, channel.value.toString()),
              React.createElement(
                Text, 
                { style: styles.tableCell }, 
                formatPercent(channel.value, totalOffers)
              )
            )
          )
        )
      ),
      
      // Offer Type Distribution
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text, 
          { style: styles.sectionTitle }, 
          "Offer Type Distribution"
        ),
        React.createElement(
          View,
          { style: styles.table },
          React.createElement(
            View,
            { style: [styles.tableRow, styles.tableHeader] },
            React.createElement(Text, { style: styles.tableCell }, "Type"),
            React.createElement(Text, { style: styles.tableCell }, "Count"),
            React.createElement(Text, { style: styles.tableCell }, "Percentage")
          ),
          ...offerTypeData.map(type => 
            React.createElement(
              View,
              { key: type.id, style: styles.tableRow },
              React.createElement(Text, { style: styles.tableCell }, type.label),
              React.createElement(Text, { style: styles.tableCell }, type.value.toString()),
              React.createElement(
                Text, 
                { style: styles.tableCell }, 
                formatPercent(type.value, totalOffers)
              )
            )
          )
        )
      ),
      
      // CSAT Distribution
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text, 
          { style: styles.sectionTitle }, 
          "Customer Satisfaction"
        ),
        React.createElement(
          View,
          { style: styles.table },
          React.createElement(
            View,
            { style: [styles.tableRow, styles.tableHeader] },
            React.createElement(Text, { style: styles.tableCell }, "Rating"),
            React.createElement(Text, { style: styles.tableCell }, "Count"),
            React.createElement(Text, { style: styles.tableCell }, "Percentage")
          ),
          ...csatData.map(csat => 
            React.createElement(
              View,
              { key: csat.id, style: styles.tableRow },
              React.createElement(Text, { style: styles.tableCell }, csat.label),
              React.createElement(Text, { style: styles.tableCell }, csat.value.toString()),
              React.createElement(
                Text, 
                { style: styles.tableCell }, 
                formatPercent(csat.value, totalOffers)
              )
            )
          )
        )
      ),
      
      // Conversion Analysis
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text, 
          { style: styles.sectionTitle }, 
          "Conversion Analysis"
        ),
        React.createElement(
          View,
          { style: styles.table },
          React.createElement(
            View,
            { style: [styles.tableRow, styles.tableHeader] },
            React.createElement(Text, { style: styles.tableCell }, "Status"),
            React.createElement(Text, { style: styles.tableCell }, "Count"),
            React.createElement(Text, { style: styles.tableCell }, "Percentage")
          ),
          ...conversionData.map(conv => 
            React.createElement(
              View,
              { key: conv.id, style: styles.tableRow },
              React.createElement(Text, { style: styles.tableCell }, conv.label),
              React.createElement(Text, { style: styles.tableCell }, conv.value.toString()),
              React.createElement(
                Text, 
                { style: styles.tableCell }, 
                formatPercent(conv.value, totalOffers)
              )
            )
          )
        )
      ),
      
      // Daily Progress
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text, 
          { style: styles.sectionTitle }, 
          "Daily Progress"
        ),
        React.createElement(
          View,
          { style: styles.table },
          React.createElement(
            View,
            { style: [styles.tableRow, styles.tableHeader] },
            React.createElement(Text, { style: styles.tableCell }, "Date"),
            React.createElement(Text, { style: styles.tableCell }, "Offers"),
            React.createElement(Text, { style: styles.tableCell }, "Goal"),
            React.createElement(Text, { style: styles.tableCell }, "Achievement")
          ),
          ...chartData.map(day => 
            React.createElement(
              View,
              { key: day.date, style: styles.tableRow },
              React.createElement(Text, { style: styles.tableCell }, day.date),
              React.createElement(Text, { style: styles.tableCell }, day.count.toString()),
              React.createElement(Text, { style: styles.tableCell }, day.goal.toString()),
              React.createElement(
                Text, 
                { style: styles.tableCell }, 
                formatPercent(day.count, day.goal)
              )
            )
          )
        )
      )
    )
  );
}; 