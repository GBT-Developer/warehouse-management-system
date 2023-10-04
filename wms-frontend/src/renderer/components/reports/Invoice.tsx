import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { CompanyInfo } from 'renderer/interfaces/CompanyInfo';
import { Invoice } from 'renderer/interfaces/Invoice';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoiceSigningArea from './InvoiceSigningArea';

export interface InvoiceProps {
  invoice: Invoice;
  companyInfo: CompanyInfo | null;
  destinationName: string;
}

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
    width: 150,
    padding: 2,
  },
});

const Invoice = ({ invoice, companyInfo, destinationName }: InvoiceProps) => (
  <Document title={`Invoice ${invoice.id ?? ''}`}>
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
            {companyInfo && companyInfo.logo ? (
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
            ) : (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {companyInfo?.name ?? ''}
                </Text>
              </View>
            )}
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 3,
              }}
            >
              <Text>{companyInfo?.address}</Text>
              <Text>{companyInfo?.phone_number}</Text>
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
