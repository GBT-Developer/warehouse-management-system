import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { Product } from 'renderer/interfaces/Product';

const styles = StyleSheet.create({
  row: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height: 'auto',
    fontWeight: 'extrabold',
    fontSize: 11,
  },
  description: {
    width: '80%',
    textAlign: 'right',
    paddingRight: 4,
    paddingVertical: 4,
    fontWeight: 'extrabold',
  },
  total: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 4,
    paddingVertical: 4,
    fontWeight: 'extrabold',
  },
});

const InvoiceTableFooter = ({
  items,
}: {
  items?: (Product & {
    is_returned?: boolean;
  })[];
}) => {
  const total = items
    ?.map((item) => item.count * item.sell_price)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return (
    <View style={styles.row}>
      <Text style={styles.description}>Total</Text>
      <Text style={styles.total}>
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(total ?? 0)}
      </Text>
    </View>
  );
};

export default InvoiceTableFooter;
