import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2/options";

dotenv.config();

setGlobalOptions({
  region: "asia-southeast2",
  memory: "256MiB",
});

export const firebaseAdmin = admin.initializeApp();

export * from "./createUser";
export * from "./deletePurchaseHistory";
export * from "./deleteUser";
export * from "./getUsers";

if (process.env.NODE_ENV === "development") {
  const NUM_USERS = 10;
  const NUM_SUPPLIERS = 15;
  const NUM_PRODUCTS = 100;
  const NUM_BROKEN_PRODUCTS = 10;
  const NUM_CUSTOMER = 15;

  import("./seeding").then(async (module) => {
    await module.seedUser(NUM_USERS); // Create 10 users and one 'owner' user
    const suppliers = await module.seedSupplier(NUM_SUPPLIERS); // Create 10 suppliers
    if (suppliers.size > 0) {
      await module.seedProduct(NUM_PRODUCTS, suppliers); // Create 100 products
    }
    await module.seedBrokenProduct(NUM_BROKEN_PRODUCTS, suppliers); // Create 10 broken products
    await module.seedCustomer(NUM_CUSTOMER); // Create 15 customers
  });
}
