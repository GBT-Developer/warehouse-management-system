import { StyleSheet, View } from '@react-pdf/renderer';

import { DispatchNote } from 'renderer/interfaces/DispatchNote';
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

const DispatchItemsTable = ({
  products,
  dispatchNote,
}: {
  products: Product[];
  dispatchNote?: DispatchNote;
}) => (
  <View style={styles.tableContainer}>
    <DispatchTableHeader />
    <DispatchTableRow items={products} dispatchNote={dispatchNote} />
  </View>
);

export default DispatchItemsTable;
