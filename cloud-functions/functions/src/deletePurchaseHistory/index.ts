import * as functions from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { firebaseAdmin } from "..";

/**
 * This function will be triggered when a product is deleted.
 * It will reduce the stock of the product in the warehouse.
 */
exports.deletePurchaseHistory = onDocumentDeleted(
  "purchase_history/{docId}",
  async (event) => {
    if (!event.data) {
      return;
    }

    const theObject = event.data.data() as {
      product: string;
      supplier: string;
      payment_status: string;
      count: string;
      purchase_price: string;
      created_at: string;
    };

    functions.logger.log("theObject", theObject);

    const productRef = firebaseAdmin
      .firestore()
      .doc(`product/${theObject.product}`);

    // Take the current stock of the product
    const productDoc = await productRef.get();
    const productData = productDoc.data();
    if (!productData) {
      return;
    }

    const currentStock = productData.count as string;

    const newStock = (
      parseInt(currentStock) - parseInt(theObject.count)
    ).toString();

    // Update the stock of the product
    await productRef.update({
      count: newStock,
    });
  }
);
