import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { firebaseAdmin } from "..";

exports.createPurchaseHistory = onDocumentCreated(
  "product/{docId}",
  async (event) => {
    if (!event.data) {
      return;
    }
    const newObject = event.data.data() as any;

    const productRef = firebaseAdmin
      .firestore()
      .collection("product")
      .doc(event.params.docId);

    const supplierRef = firebaseAdmin
      .firestore()
      .collection("supplier")
      .doc(newObject.supplier.id);

    await firebaseAdmin.firestore().collection("purchase_history").add({
      product: productRef,
      supplier: supplierRef,
      count: newObject.count,
      payment_status: "Unpaid",
      created_at: new Date(),
    });
  }
);
