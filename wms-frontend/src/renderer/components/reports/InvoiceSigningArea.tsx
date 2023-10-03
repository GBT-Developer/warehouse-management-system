import { StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    marginTop: 160,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  reportTitle: {
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    backgroundColor: '#90e5fc',
    width: '30%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
});

const InvoiceSigningArea = () => (
  <View style={styles.titleContainer}>
    <Text style={styles.reportTitle}></Text>
  </View>
);

export default InvoiceSigningArea;
