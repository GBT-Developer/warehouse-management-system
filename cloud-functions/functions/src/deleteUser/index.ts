import { HttpsError, onCall } from "firebase-functions/v2/https";
import { firebaseAdmin } from "../index";

exports.deleteUser = onCall(async (request) => {
  // Only callable by owner
  if (request.auth?.token.owner !== true) {
    throw new HttpsError("permission-denied", "Only callable by owner");
  }

  const { uid } = request.data;

  try {
    await firebaseAdmin.auth().deleteUser(uid);
    return {
      message: "User deleted successfully",
    };
  } catch (error) {
    throw new HttpsError(`internal`, `${error}`);
  }
});
