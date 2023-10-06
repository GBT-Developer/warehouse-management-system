import { StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
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
  description: {
    width: '57%',
    textAlign: 'center',
    paddingVertical: 2,
  },
  qty: {
    width: '10%',
    textAlign: 'right',
    paddingRight: 4,
    paddingVertical: 2,
  },
  rate: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 4,
    paddingVertical: 2,
  },
  amount: {
    width: '18%',
    textAlign: 'right',
    paddingRight: 4,
    paddingVertical: 2,
  },
});

const InvoiceTableHeader = () => (
  <View style={styles.container}>
    <Text style={styles.qty}>Jumlah</Text>
    <Text style={styles.description}>Nama Produk</Text>
    <Text style={styles.rate}>Harga / Pcs</Text>
    <Text style={styles.amount}>Harga Total</Text>
  </View>
);

export default InvoiceTableHeader;
