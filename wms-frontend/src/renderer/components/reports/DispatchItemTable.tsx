import { StyleSheet, View } from '@react-pdf/renderer';

import { Product } from 'renderer/interfaces/Product';
import DispatchTableHeader from './DispatchTableHeader';
import DispatchTableRow from './DispatchTableRow';

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
  },
});

const DispatchItemsTable = ({ products }: { products: Product[] }) => (
  <View style={styles.tableContainer}>
    <DispatchTableHeader />
    <DispatchTableRow items={products} />
  </View>
);

export default DispatchItemsTable;
