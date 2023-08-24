import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { firebaseAdmin } from "..";

exports.updateProductStock = onDocumentWritten("product/{docId}", (event) => {
  console.log(`Document products is updated`, event);
  if (!event.data) {
    console.log(`Document ${event.params.docId} updated at ${event.data}`);
    return;
  }
  const newObject = event.data.after.data() as any;
  const previousObject = event.data.before.data() as any;
  const difference = newObject.count - previousObject.count;
  console.log(`Difference is ${difference}`);

  firebaseAdmin.firestore().collection("stock_history").add({
    product_id: event.params.docId,
    product_name: newObject.brand,
    count: difference,
    created_at: new Date(),
  });
});
