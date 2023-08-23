import { HttpsError, onCall } from "firebase-functions/v2/https";
import { firebaseAdmin } from "../index";

exports.getUsers = onCall(async (request) => {
  // Only callable by owner

  try {
    const users = await firebaseAdmin.auth().listUsers();
    return users.users;
  } catch (error) {
    throw new HttpsError(`internal`, `${error}`);
  }
});
