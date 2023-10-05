import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { Fragment } from 'react';
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
}: {
  items?: (Product & {
    amount?: number;
  })[];
}) => {
  console.log('item ' + items);
  const rows = items?.map((item) => (
    <View style={styles.row} key={item.id}>
      <Text style={styles.description}>
        {item.brand} {item.motor_type} {item.part} {item.available_color}
      </Text>
      <Text style={styles.qty}>{item.count}</Text>
    </View>
  ));
  return <Fragment>{rows}</Fragment>;
};

export default DispatchTableRow;
