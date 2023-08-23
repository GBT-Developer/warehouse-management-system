import { setGlobalOptions } from "firebase-functions/v2/options";
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

setGlobalOptions({
  region: "asia-southeast2",
  memory: "256MiB",
});

export const firebaseAdmin = admin.initializeApp();

export * from "./createUser";
export * from "./deleteUser";
export * from "./getUsers";

if (process.env.NODE_ENV === "development") {
  const NUM_USERS = 10;
  import("./seeding/user").then((module) => {
    module.seedUser(NUM_USERS);
  });
}