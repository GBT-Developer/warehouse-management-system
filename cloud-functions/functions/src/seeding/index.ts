import { faker } from "@faker-js/faker";
import * as functions from "firebase-functions";
import * as path from "path";
import { firebaseAdmin } from "../index";

export const seedUser = async (num_of_user: number) => {
  await createRootUser();
  const users = await firebaseAdmin.auth().listUsers();
  if (users.users.length < num_of_user) {
    for (let i = 0; i < num_of_user; i++) {
      const theEmail = faker.internet.email();
      const thePassword = faker.internet.password();
      const theDisplayName = faker.person.fullName();
      await firebaseAdmin.auth().createUser({
        email: theEmail,
        emailVerified: false,
        password: thePassword,
        displayName: theDisplayName,
        disabled: false,
      });

      const roles = ["Gudang Jadi", "Gudang Bahan"];
      await firebaseAdmin
        .firestore()
        .collection("user")
        .add({
          email: theEmail,
          display_name: theDisplayName,
          role: roles[faker.number.int({ min: 0, max: roles.length - 1 })],
        });
    }
  } else {
    functions.logger.info("Enough user already");
  }
};

const createRootUser = async () => {
  await firebaseAdmin
    .auth()
    .getUserByEmail("test@gmail.com")
    .then(() => {
      functions.logger.info("Root user already exists");
    })
    .catch(async () => {
      await firebaseAdmin
        .auth()
        .createUser({
          email: "test@gmail.com",
          emailVerified: false,
          password: "123456",
          displayName: "Test",
          disabled: false,
        })
        .then(async (theUser) => {
          await firebaseAdmin.firestore().runTransaction(async (t) => {
            t.set(
              firebaseAdmin.firestore().collection("user").doc(theUser.uid),
              {
                email: "test@gmail.com",
                display_name: "Test",
                role: "Owner",
              }
            );
          });
        })
        .catch((error) => {
          functions.logger.error(error);
        });
    });
};

export const seedCompanyInfo = async () => {
  const db = firebaseAdmin.firestore();
  const company_info = await db.collection("company_info").get();

  if (company_info.size === 0) {
    await db.runTransaction(async (t) => {
      const company_info_ref = db.collection("company_info").doc("my_company");
      t.set(company_info_ref, {
        name: "PT. Permata Motor",
        address: "Jl. Raya Ciputat No. 1",
        phone_number: "081234567890",
        logo: "company_info/company_logo",
      });
    });

    const currentDir = path.resolve(__dirname);
    const fileName = path.resolve(currentDir, "../../One_piece_logo.png");

    const bucket = firebaseAdmin.storage().bucket();
    await bucket.upload(fileName, {
      destination: "company_info/company_logo",
      metadata: {
        contentType: "image/png",
      },
    });
  } else {
    functions.logger.info("Company info already exists");
  }
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
        warehouse_pos: string;
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
      const warehouse =
        warehouse_positions[
          faker.number.int({ min: 0, max: warehouse_positions.length - 1 })
        ];
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
          count: the_count,
          sell_price: parseInt(sell_price),
          purchase_price: parseFloat(sell_price) * 0.8,
          warehouse_position: warehouse,
          supplier: Array.from(suppliers.keys())[the_supplier_id],
        })
        .then(async (product) => {
          const id = product.id;
          const name = `${productBrand} ${productMotorType} ${productPart} ${productColor}`;
          const quantity = the_count;
          const warehouse_pos = warehouse;
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
            warehouse_pos,
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
        warehouse_position: product_supplier_list[0].warehouse_pos,
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
    const warehouse_positions = ["Gudang Jadi", "Gudang Bahan"];
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
          count: the_count,
          supplier: Array.from(suppliers.keys())[the_supplier_id],
          sell_price: parseInt(
            faker.commerce.price({
              min: 50000,
              max: 1000000,
            })
          ),
          warehouse_position:
            warehouse_positions[
              faker.number.int({ min: 0, max: warehouse_positions.length - 1 })
            ],
        })
        .catch((error) => console.log(error));
    }
  } else {
    functions.logger.info("Enough broken product already");
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
    sell_price: number;
    purchase_price: number;
    count: number;
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
      sell_price: number;
      purchase_price: number;
      count: number;
    };

    productsList.push({
      id: product_id,
      product_id: product_id,
      brand: product_data.brand,
      motor_type: product_data.motor_type,
      part: product_data.part,
      available_color: product_data.available_color,
      warehouse_position: product_data.warehouse_position,
      sell_price: product_data.sell_price,
      purchase_price: product_data.sell_price * 0.8,
      count: product_data.count,
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
            purchase_price: product.purchase_price,
            sell_price: product.sell_price,
          };
        }),
      });
    }
  } else {
    functions.logger.info("Enough customer already");
  }
};

export const seedTransaction = async (num_of_transaction: number) => {
  const db = firebaseAdmin.firestore();
  const transactions = await db.collection("invoice").get();

  if (transactions.size < num_of_transaction) {
    let totalSales = 0;
    let daily_sales: Record<string, number> = {};
    for (let i = 0; i < num_of_transaction; i++) {
      const numOfProducts = faker.number.int({ min: 1, max: 5 });
      const products = await productPicker(numOfProducts);
      const totalPrice = products.reduce(
        (acc, curr) => acc + curr.sell_price,
        0
      );
      // Generate date of this month
      const purchaseDate = faker.date
        .between({
          from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          to: new Date(),
        })
        .toISOString(); // ex: 2021-03-10T07:00:00.000Z
      // Take the date
      const date = purchaseDate.split("T")[0]; // ex: 2021-03-10
      // Get the time of the day, format: HH:MM:SS
      const time = purchaseDate.split("T")[1].split(".")[0]; // ex: 07:00:00
      // Take the day
      const day = date.split("-")[2]; // ex: 10
      totalSales += totalPrice;
      const hasPrice = daily_sales[day];
      if (hasPrice) {
        daily_sales[day] += totalPrice;
      } else {
        daily_sales[day] = totalPrice;
      }
      await db.collection("invoice").add({
        customer_id: "",
        customer_name: faker.person.fullName(),
        date: purchaseDate.split("T")[0],
        time: time,
        payment_method: "Cash",
        warehouse_position: products[0].warehouse_position,
        total_price: totalPrice,
        items: products.map((product) => {
          return {
            available_color: product.available_color,
            brand: product.brand,
            count: faker.number.int({ min: 1, max: 5 }),
            id: product.product_id,
            is_returned: false,
            motor_type: product.motor_type,
            part: product.part,
            purchase_price: product.purchase_price,
            sell_price: product.sell_price,
            warehouse_position: product.warehouse_position,
          };
        }),
      });
    }
    await db
      .collection("invoice")
      .doc("--stats--")
      .set({
        total_sales: totalSales,
        transaction_count: num_of_transaction,
        daily_sales: daily_sales,
        month: parseInt(
          new Date().toLocaleDateString("en-US", {
            month: "numeric",
          })
        ),
      });
  } else {
    functions.logger.info("Enough transaction already");
  }
};
