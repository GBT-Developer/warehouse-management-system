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
    width: '80%',
    textAlign: 'center',
    paddingVertical: 2,
  },
  qty: {
    width: '20%',
    textAlign: 'center',
    paddingRight: 4,
    paddingVertical: 2,
  },
});

const DispatchTableHeader = () => (
  <View style={styles.container}>
    <Text style={styles.description}>Nama Produk</Text>
    <Text style={styles.qty}>Jumlah</Text>
  </View>
);

export default DispatchTableHeader;
