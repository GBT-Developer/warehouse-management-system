import { StyleSheet, View } from '@react-pdf/renderer';
import { Invoice } from 'renderer/interfaces/Invoice';
import InvoiceTableFooter from './InvoiceTableFooter';
import InvoiceTableHeader from './InvoiceTableHeader';
import InvoiceTableRow from './InvoiceTableRow';

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
  },
});

const InvoiceItemsTable = ({ invoice }: { invoice: Invoice }) => (
  <View style={styles.tableContainer}>
    <InvoiceTableHeader />
    <InvoiceTableRow items={invoice.items} />
    <InvoiceTableFooter items={invoice.items} />
  </View>
);

export default InvoiceItemsTable;
