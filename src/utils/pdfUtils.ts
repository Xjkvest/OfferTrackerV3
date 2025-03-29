import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';
import { Offer } from '@/context/OfferContext';

// Add type declarations for PDF components
declare module '@react-pdf/renderer' {
  interface DocumentProps {
    children: React.ReactNode;
  }
  interface PageProps {
    size?: string;
    style?: any;
    children: React.ReactNode;
  }
  interface TextProps {
    style?: any;
    children: React.ReactNode;
  }
  interface ViewProps {
    style?: any;
    children: React.ReactNode;
  }
}

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7.woff2', fontWeight: 600 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
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
    fontWeight: 600,
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
    display: 'table',
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
    fontWeight: 600,
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

export const AnalyticsReport = ({
  dateRange,
  dailyGoal,
  offers,
  channelData,
  offerTypeData,
  csatData,
  conversionData,
  chartData,
}: AnalyticsReportProps) => {
  // Calculate summary statistics
  const totalOffers = offers.length;
  const convertedOffers = offers.filter(o => o.converted).length;
  const conversionRate = totalOffers > 0 ? (convertedOffers / totalOffers) * 100 : 0;
  const averageDailyOffers = totalOffers / Math.max(1, chartData.length);
  const goalAchievementRate = (averageDailyOffers / dailyGoal) * 100;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics Report</Text>
          <Text style={styles.subtitle}>
            {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Offers:</Text>
            <Text style={styles.value}>{totalOffers}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Converted Offers:</Text>
            <Text style={styles.value}>{convertedOffers}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Conversion Rate:</Text>
            <Text style={styles.value}>{conversionRate.toFixed(1)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Daily Offers:</Text>
            <Text style={styles.value}>{averageDailyOffers.toFixed(1)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Daily Goal Achievement:</Text>
            <Text style={styles.value}>{goalAchievementRate.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Channel Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Channel Distribution</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Channel</Text>
              <Text style={styles.tableCell}>Count</Text>
              <Text style={styles.tableCell}>Percentage</Text>
            </View>
            {channelData.map((channel) => (
              <View key={channel.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{channel.label}</Text>
                <Text style={styles.tableCell}>{channel.value}</Text>
                <Text style={styles.tableCell}>
                  {((channel.value / totalOffers) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Offer Type Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offer Type Distribution</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Type</Text>
              <Text style={styles.tableCell}>Count</Text>
              <Text style={styles.tableCell}>Percentage</Text>
            </View>
            {offerTypeData.map((type) => (
              <View key={type.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{type.label}</Text>
                <Text style={styles.tableCell}>{type.value}</Text>
                <Text style={styles.tableCell}>
                  {((type.value / totalOffers) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CSAT Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Satisfaction</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Rating</Text>
              <Text style={styles.tableCell}>Count</Text>
              <Text style={styles.tableCell}>Percentage</Text>
            </View>
            {csatData.map((csat) => (
              <View key={csat.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{csat.label}</Text>
                <Text style={styles.tableCell}>{csat.value}</Text>
                <Text style={styles.tableCell}>
                  {((csat.value / totalOffers) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Conversion Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversion Analysis</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Status</Text>
              <Text style={styles.tableCell}>Count</Text>
              <Text style={styles.tableCell}>Percentage</Text>
            </View>
            {conversionData.map((conv) => (
              <View key={conv.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{conv.label}</Text>
                <Text style={styles.tableCell}>{conv.value}</Text>
                <Text style={styles.tableCell}>
                  {((conv.value / totalOffers) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Progress</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Offers</Text>
              <Text style={styles.tableCell}>Goal</Text>
              <Text style={styles.tableCell}>Achievement</Text>
            </View>
            {chartData.map((day) => (
              <View key={day.date} style={styles.tableRow}>
                <Text style={styles.tableCell}>{day.date}</Text>
                <Text style={styles.tableCell}>{day.count}</Text>
                <Text style={styles.tableCell}>{day.goal}</Text>
                <Text style={styles.tableCell}>
                  {((day.count / day.goal) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}; 