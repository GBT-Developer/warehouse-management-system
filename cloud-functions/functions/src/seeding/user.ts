import { faker } from "@faker-js/faker";
import { firebaseAdmin } from "../index";
import * as functions from "firebase-functions";

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
