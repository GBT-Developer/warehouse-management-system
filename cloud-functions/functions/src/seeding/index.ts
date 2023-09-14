import { faker } from "@faker-js/faker";
import * as functions from "firebase-functions";
import { firebaseAdmin } from "../index";

export const seedUser = async (num_of_user: number) => {
  await createRootUser();
  const users = await firebaseAdmin.auth().listUsers();
  if (users.users.length < num_of_user) {
    for (let i = 0; i < num_of_user; i++) {
      await firebaseAdmin.auth().createUser({
        email: faker.internet.email(),
        emailVerified: false,
        password: faker.internet.password(),
        displayName: faker.person.fullName(),
        disabled: false,
      });
    }
  } else {
    functions.logger.info("Enough user already");
  }
};

const createRootUser = async () => {
  firebaseAdmin
    .auth()
    .getUserByEmail("test@gmail.com")
    .then(() => {
      functions.logger.info("Root user already exists");
    })
    .catch(() => {
      firebaseAdmin
        .auth()
        .createUser({
          email: "test@gmail.com",
          emailVerified: false,
          password: "123456",
          displayName: "Test",
          disabled: false,
        })
        .then((userRecord) => {
          // Set custom claims
          firebaseAdmin
            .auth()
            .setCustomUserClaims(userRecord.uid, { owner: true });
          functions.logger.info("Root user created");
        })
        .catch((error) => {
          functions.logger.error(error);
        });
    });
};

export const seedSupplier = async (
  num_of_supplier: number
): Promise<string[]> => {
  const db = firebaseAdmin.firestore();
  const suppliers = await db.collection("supplier").get();

  const supplier_ids: string[] = [];
  if (suppliers.size < num_of_supplier) {
    for (let i = 0; i < num_of_supplier; i++) {
      const supplier = await db.collection("supplier").add({
        address: faker.location.streetAddress(),
        bank_number: faker.finance.accountNumber(),
        bank_owner: faker.finance.accountName(),
        city: faker.location.city(),
        company_name: faker.company.name(),
        contact_person: faker.person.fullName(),
        phone_number: faker.phone.number(),
      });
      supplier_ids.push(supplier.id);
    }
  } else {
    functions.logger.info("Enough supplier already");

    suppliers.forEach((supplier) => {
      supplier_ids.push(supplier.id);
    });
  }

  return supplier_ids;
};

export const seedProduct = async (
  num_of_product: number,
  supplier_ids: string[]
) => {
  const db = firebaseAdmin.firestore();
  const products = await db.collection("product").get();

  if (products.size < num_of_product) {
    const warehouse_positions = ["Gudang Jadi", "Gudang Bahan"];
    for (let i = 0; i < num_of_product; i++) {
      const the_count = faker.number.int({ min: 0, max: 100 });
      const the_supplier_id = faker.number.int({
        min: 0,
        max: supplier_ids.length - 1,
      });
      await db
        .collection("product")
        .add({
          available_color: faker.color.human(),
          brand: faker.commerce.productName(),
          count: the_count.toString(),
          motor_type: faker.vehicle.type(),
          part: faker.vehicle.model(),
          sell_price: faker.commerce.price(),
          warehouse_position:
            warehouse_positions[
              faker.number.int({ min: 0, max: warehouse_positions.length - 1 })
            ],
          supplier: supplier_ids[the_supplier_id],
        })
        .then(async (product) => {
          await db.collection("purchase_history").add({
            count: the_count.toString(),
            payment_status: "Paid",
            purchase_price: faker.commerce.price(),
            created_at: faker.date.past().toISOString(),
            product: product.id,
            supplier: supplier_ids[the_supplier_id],
          });
        });
    }
  } else {
    functions.logger.info("Enough product already");
  }
};
