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
    width: '10%',
    textAlign: 'right',
    paddingRight: 8,
  },
  description: {
    width: '57%',
    textAlign: 'left',
    paddingHorizontal: 4,
    paddingLeft: 4,
  },
  rate: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 4,
    paddingLeft: 4,
  },
  amount: {
    width: '18%',
    textAlign: 'right',
    paddingRight: 4,
    paddingLeft: 4,
  },
});

const InvoiceTableRow = ({
  items,
}: {
  items?: (Product & {
    is_returned?: boolean;
  })[];
}) => {
  const rows = items?.map((item) => (
    <View style={styles.row} key={item.id}>
      <Text style={styles.qty}>{item.count}</Text>
      <Text style={styles.description}>
        {item.brand} {item.motor_type} {item.part} {item.available_color}
      </Text>
      <Text style={styles.rate}>
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(item.sell_price)}
      </Text>
      <Text style={styles.amount}>
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(item.count * item.sell_price)}
      </Text>
    </View>
  ));
  return <Fragment>{rows}</Fragment>;
};

export default InvoiceTableRow;
