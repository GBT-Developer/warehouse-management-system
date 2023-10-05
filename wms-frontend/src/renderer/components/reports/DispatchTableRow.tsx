import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { Fragment } from 'react';
import { DispatchNote } from 'renderer/interfaces/DispatchNote';
import { Product } from 'renderer/interfaces/Product';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomColor: '#bff0fd',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 'auto',
    fontStyle: 'bold',
    paddingVertical: 6,
  },
  qty: {
    width: '20%',
    textAlign: 'center',
    paddingRight: 4,
  },
  description: {
    width: '80%',
    textAlign: 'left',
    paddingHorizontal: 4,
    paddingLeft: 4,
  },
});

const DispatchTableRow = ({
  items,
  dispatchNote,
}: {
  items?: Product[];
  dispatchNote?: DispatchNote;
}) => {
  console.log('item ' + items);
  const rows = items?.map((item) => {
    const currentProduct = dispatchNote?.dispatch_items.find(
      (dispatchNoteItem) => dispatchNoteItem.product_id === item.id
    );
    return (
      <View style={styles.row} key={item.id}>
        <Text style={styles.description}>
          {item.brand} {item.motor_type} {item.part} {item.available_color}
        </Text>
        <Text style={styles.qty}>{currentProduct?.amount}</Text>
      </View>
    );
  });
  return <Fragment>{rows}</Fragment>;
};

export default DispatchTableRow;
