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
): Promise<Map<string, string>> => {
  const db = firebaseAdmin.firestore();
  const suppliers = await db.collection("supplier").get();

  const suppliersMap: Map<string, string> = new Map();
  if (suppliers.size < num_of_supplier) {
    for (let i = 0; i < num_of_supplier; i++) {
      const company_name = faker.company.name();
      const supplier = await db.collection("supplier").add({
        address: faker.location.streetAddress(),
        bank_number: faker.finance.accountNumber(),
        bank_owner: faker.finance.accountName(),
        city: faker.location.city(),
        company_name: company_name,
        contact_person: faker.person.fullName(),
        phone_number: faker.phone.number(),
      });
      suppliersMap.set(supplier.id, company_name);
    }
  } else {
    functions.logger.info("Enough supplier already");

    suppliers.forEach((supplier) => {
      suppliersMap.set(supplier.id, supplier.data().company_name);
    });
  }

  return suppliersMap;
};

export const seedProduct = async (
  num_of_product: number,
  suppliers: Map<string, string>
) => {
  const db = firebaseAdmin.firestore();
  const products = await db.collection("product").get();

  if (products.size < num_of_product) {
    const warehouse_positions = ["Gudang Jadi", "Gudang Bahan"];
    const productSupplierList = new Map<
      string,
      {
        id: string;
        name: string;
        quantity: number;
        sell_price: string;
      }[]
    >();

    for (let i = 0; i < num_of_product; i++) {
      const the_count = faker.number.int({ min: 1, max: 100 });
      const the_supplier_id = faker.number.int({
        min: 0,
        max: suppliers.size - 1,
      });
      const productColor = faker.color.human();
      const productBrand = faker.commerce.productName();
      const productMotorType = faker.vehicle.type();
      const productPart = faker.vehicle.model();
      const sell_price = faker.commerce.price({
        min: 50000,
        max: 1000000,
      });

      await db
        .collection("product")
        .add({
          available_color: productColor,
          brand: productBrand,
          motor_type: productMotorType,
          part: productPart,
          count: the_count.toString(),
          sell_price: sell_price,
          warehouse_position:
            warehouse_positions[
              faker.number.int({ min: 0, max: warehouse_positions.length - 1 })
            ],
          supplier: Array.from(suppliers.keys())[the_supplier_id],
        })
        .then(async (product) => {
          const id = product.id;
          const name = `${productBrand} ${productMotorType} ${productPart} ${productColor}`;
          const quantity = the_count;
          const supplier_id = Array.from(suppliers.keys())[the_supplier_id];

          let product_supplier_list = productSupplierList.get(supplier_id);

          if (!product_supplier_list) {
            product_supplier_list = [];
          }

          product_supplier_list.push({
            id,
            name,
            quantity,
            sell_price,
          });

          productSupplierList.set(supplier_id, product_supplier_list);
        });
    }

    productSupplierList.forEach(async (product_supplier_list, supplier_id) => {
      await db.collection("purchase_history").add({
        created_at: faker.date.past().toDateString(),
        supplier: supplier_id,
        purchase_price: product_supplier_list
          .reduce((acc, curr) => acc + parseInt(curr.sell_price), 0)
          .toString(),
        payment_status: "Paid",
        products: product_supplier_list,
      });
    });
  } else {
    functions.logger.info("Enough product already");
  }
};

export const seedBrokenProduct = async (
  num_of_product: number,
  suppliers: Map<string, string>
) => {
  const db = firebaseAdmin.firestore();
  const broken_products = await db.collection("broken_product").get();

  if (broken_products.size < num_of_product) {
    for (let i = 0; i < num_of_product; i++) {
      const the_count = faker.number.int({ min: 1, max: 10 });
      const the_supplier_id = faker.number.int({
        min: 0,
        max: suppliers.size - 1,
      });
      await db
        .collection("broken_product")
        .add({
          available_color: faker.color.human(),
          brand: faker.commerce.productName(),
          motor_type: faker.vehicle.type(),
          part: faker.vehicle.model(),
          count: the_count.toString(),
          supplier: {
            id: Array.from(suppliers.keys())[the_supplier_id],
            company_name: Array.from(suppliers.values())[the_supplier_id],
          },
        })
        .catch((error) => console.log(error));
    }
  } else {
    functions.logger.info("Enough product already");
  }
};
const productPicker = async (num_of_products: number) => {
  const db = firebaseAdmin.firestore();
  const productsRef = await db.collection("product").get();

  const productsList: {
    id?: string;
    product_id: string;
    brand: string;
    motor_type: string;
    part: string;
    available_color: string;
    warehouse_position: string;
    price: string;
    sell_price: string;
  }[] = [];
  // Fetch random products
  for (let i = 0; i < num_of_products; i++) {
    const index = faker.number.int({
      min: 0,
      max: productsRef.docs.length - 1,
    });
    const product_id = productsRef.docs[index].id;

    const product_data = (await db
      .collection("product")
      .doc(product_id)
      .get()
      .then((doc) => {
        return doc.data();
      })) as {
      brand: string;
      motor_type: string;
      part: string;
      available_color: string;
      warehouse_position: string;
      sell_price: string;
    };

    productsList.push({
      id: product_id,
      product_id: product_id,
      brand: product_data.brand,
      motor_type: product_data.motor_type,
      part: product_data.part,
      available_color: product_data.available_color,
      warehouse_position: product_data.warehouse_position,
      price: (parseFloat(product_data.sell_price) * 0.8).toFixed(2),
      sell_price: product_data.sell_price,
    });

    // Remove the product from the list
    productsRef.docs.splice(index, 1);

    // If there are no more products, break the loop
    if (productsRef.docs.length === 0) {
      break;
    }
  }

  return productsList;
};

export const seedCustomer = async (num_of_customer: number) => {
  const db = firebaseAdmin.firestore();
  const customers = await db.collection("customer").get();

  if (customers.size < num_of_customer) {
    for (let i = 0; i < num_of_customer; i++) {
      const numOfProducts = faker.number.int({ min: 1, max: 5 });
      const products = await productPicker(numOfProducts);
      await db.collection("customer").add({
        name: faker.person.fullName(),
        address: faker.location.streetAddress(),
        phone_number: faker.phone.number(),
        SpecialPrice: products.map((product) => {
          return {
            product_id: product.product_id,
            brand: product.brand,
            motor_type: product.motor_type,
            part: product.part,
            available_color: product.available_color,
            warehouse_position: product.warehouse_position,
            price: product.price,
            sell_price: product.sell_price,
          };
        }),
      });
    }
  } else {
    functions.logger.info("Enough customer already");
  }
};
