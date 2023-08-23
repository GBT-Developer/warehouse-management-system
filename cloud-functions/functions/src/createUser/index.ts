import { HttpsError, onCall } from "firebase-functions/v2/https";
import { firebaseAdmin } from "../index";

exports.createUser = onCall(async (request) => {
  // Only callable by owner
  if (request.auth?.token.owner !== true) {
    throw new HttpsError("permission-denied", "Only callable by owner");
  }

  const { email, password } = request.data;

  try {
    await firebaseAdmin.auth().createUser({
      email,
      password,
    });
    return {
      message: "User created successfully",
    };
  } catch (error) {
    throw new HttpsError(`internal`, `${error}`);
  }
});
