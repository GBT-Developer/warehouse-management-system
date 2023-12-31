import * as functions from "firebase-functions";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { firebaseAdmin } from "..";

/**
 * This function will be triggered when a product is updated.
 * It will create a new stock history entry if the count has changed.
 */
exports.createPurchaseHistory = onDocumentUpdated(
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
      .collection("purchase_history")
      .add({
        count: newObject.count,
        created_at: new Date().toISOString().split("T")[0],
        payment_status: "Unpaid",
        product: productRef.id,
        purchase_price: "0.00", // Purchase price cannot be extracted from the product
        supplier: newObject.supplier,
      });
  }
);
