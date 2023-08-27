import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { firebaseAdmin } from "..";

exports.updateProductStock = onDocumentWritten("product/{docId}", (event) => {
  if (!event.data) {
    return;
  }
  const newObject = event.data.after.data() as any;
  const previousObject = event.data.before.data() as any;

  const productRef = firebaseAdmin
    .firestore()
    .collection("product")
    .doc(event.params.docId);

  firebaseAdmin
    .firestore()
    .collection("stock_history")
    .add({
      product: productRef,
      old_count: previousObject.count,
      new_count: newObject.count,
      count: newObject.count - previousObject.count,
      updated_at: new Date(),
    });
});
