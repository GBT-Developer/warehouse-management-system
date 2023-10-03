import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { Invoice } from 'renderer/interfaces/Invoice';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoiceSigningArea from './InvoiceSigningArea';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 55,
    paddingBottom: 90,
    paddingHorizontal: 55,
    lineHeight: 1.5,
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-between',
  },
  logo: {
    width: 74,
    height: 66,
    padding: 2,
  },
});

interface InvoiceProps {
  invoice: Invoice;
  companyInfo: {
    address: string;
    phoneNumber: string;
    logo: string;
  };
  destinationName: string;
}

const Invoice = ({ invoice, companyInfo, destinationName }: InvoiceProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <Image style={styles.logo} src={companyInfo.logo} />
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 3,
              }}
            >
              <Text>{companyInfo.address}</Text>
              <Text>{companyInfo.phoneNumber}</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <Text>Nama Tujuan: {destinationName}</Text>
            <Text>Tanggal: {invoice.date}</Text>
          </View>
        </View>
        <InvoiceItemsTable invoice={invoice} />
      </View>
      <InvoiceSigningArea />
    </Page>
  </Document>
);

export default Invoice;
