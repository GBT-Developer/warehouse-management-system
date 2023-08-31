import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { firebaseAdmin } from "..";

exports.updateProductStock = onDocumentUpdated(
  "product/{docId}",
  async (event) => {
    if (!event.data) {
      return;
    }
    const newObject = event.data.after.data() as any;
    const previousObject = event.data.before.data() as any;

    const productRef = firebaseAdmin
      .firestore()
      .collection("product")
      .doc(event.params.docId);

    // If the count is not set or the count is the same, we don't need to do anything
    if (
      !newObject.count ||
      !previousObject.count ||
      newObject.count === previousObject.count
    ) {
      return;
    }

    await firebaseAdmin
      .firestore()
      .collection("stock_history")
      .add({
        product: productRef,
        old_count: previousObject.count,
        new_count: newObject.count,
        difference: newObject.count - previousObject.count,
        updated_at: new Date(),
      });
  }
);
