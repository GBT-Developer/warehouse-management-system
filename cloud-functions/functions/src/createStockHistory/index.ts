import * as functions from "firebase-functions";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { firebaseAdmin } from "..";

/**
 * This function will be triggered when a product is updated.
 * It will create a new stock history entry if the count has changed.
 */
exports.createStockHistory = onDocumentUpdated(
  "product/{docId}",
  async (event) => {
    if (!event.data) {
      return;
    }
    const newObject = event.data.after.data() as any;
    const previousObject = event.data.before.data() as any;

    functions.logger.log("newObject", newObject);
    functions.logger.log("previousObject", previousObject);

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
        count: newObject.count,
        old_count: previousObject.count,
        created_at: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        difference: newObject.count - previousObject.count,
        product: productRef.id,
        type: "update",
        warehouse_position: newObject.warehouse_position,
      });
  }
);
