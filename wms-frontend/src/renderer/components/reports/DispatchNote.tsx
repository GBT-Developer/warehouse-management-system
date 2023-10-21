import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { CompanyInfo } from 'renderer/interfaces/CompanyInfo';
import { DispatchNote } from 'renderer/interfaces/DispatchNote';
import { Product } from 'renderer/interfaces/Product';
import DispatchItemsTable from './DispatchItemTable';
import InvoiceSigningArea from './InvoiceSigningArea';

export interface DispatchProps {
  products: Product[];
  theDispatchNote: DispatchNote | undefined;
  companyInfo: CompanyInfo | null;
  destinationName: string;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 55,
    paddingBottom: 90,
    paddingHorizontal: 55,
    lineHeight: 1.5,
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-between',
  },
  logo: {
    width: 125,
    padding: 2,
  },
});

const DispatchNotePdf = ({
  products,
  theDispatchNote,
  companyInfo,
  destinationName,
}: DispatchProps) => (
  <Document title={`Surat Jalan ${theDispatchNote?.id ?? ''}`}>
    <Page size="B5" style={styles.page}>
      <View>
        <View>
          <Text
            style={{
              textAlign: 'left',
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            SURAT JALAN
          </Text>
        </View>

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
            <Text>Tanggal: {theDispatchNote?.date}</Text>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 6,
          }}
        >
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
          <View>
            <Text>No. Surat Jalan: {theDispatchNote?.id}</Text>
          </View>
        </View>
        <DispatchItemsTable
          products={products}
          dispatchNote={theDispatchNote}
        />
      </View>
      <InvoiceSigningArea />
    </Page>
  </Document>
);

export default DispatchNotePdf;
