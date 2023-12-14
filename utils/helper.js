import crypto from "crypto";
import passwordValidator from "password-validator";

const createRandomBytes = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);

      const token = buff.toString("hex");
      resolve(token);
    });
  });

const generateRandomPassword = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const password = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    password.push(characters.charAt(randomIndex));
  }

  const newPassword = password.join("");

  const passwordSchema = new passwordValidator();

  passwordSchema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(16) // Maximum length 16
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .not()
    .spaces(); // Should not have spaces

  if (passwordSchema.validate(newPassword)) {
    return newPassword;
  } else {
    // Regenerate password if it doesn't meet the schema
    return generateRandomPassword(length);
  }
};

export { createRandomBytes, generateRandomPassword };
