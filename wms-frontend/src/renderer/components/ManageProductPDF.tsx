import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { CompanyInfo } from 'renderer/interfaces/CompanyInfo';
import { Product } from 'renderer/interfaces/Product';

export interface ProductPdf {
  products: Product[];
  companyInfo: CompanyInfo | null;
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
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomColor: '#bff0fd',
    backgroundColor: '#bff0fd',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 24,
    textAlign: 'center',
    fontStyle: 'bold',
    flexGrow: 1,
  },
  header_description: {
    width: '90%',
    textAlign: 'center',
    paddingVertical: 2,
  },
  row_description: {
    width: '90%',
    textAlign: 'left',
    paddingHorizontal: 4,
    paddingLeft: 4,
  },
  header_qty: {
    width: '10%',
    textAlign: 'right',
    paddingRight: 4,
    paddingVertical: 2,
  },
  row_qty: {
    width: '10%',
    textAlign: 'right',
    paddingRight: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomColor: '#bff0fd',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 'auto',
    fontStyle: 'bold',
    paddingVertical: 6,
  },
});

export const ProductPdf = ({ products, companyInfo }: ProductPdf) => (
  <Document
    title={`Stok Produkt ${new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`}
  >
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
            <Text>
              Tanggal:{' '}
              {new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.container}>
            <Text style={styles.header_description}>Nama Produk</Text>
            <Text style={styles.header_qty}>Jumlah</Text>
          </View>
          {products.map((item) => (
            <View style={styles.row} key={item.id}>
              <Text style={styles.row_description}>
                {item.brand} {item.motor_type} {item.part}{' '}
                {item.available_color}
              </Text>
              <Text style={styles.row_qty}>{item.count}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
