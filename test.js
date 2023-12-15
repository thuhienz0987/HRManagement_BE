// import { MongoClient } from 'mongodb';

// async function dropUniqueIndex() {
//   const uri = 'mongodb://localhost:27017';
//   const client = new MongoClient(uri);

//   try {
//     await client.connect();
//     const database = client.db('HRManagement');
//     const collection = database.collection('users');

//     // Xóa chỉ mục duy nhất trên trường TeamId
//     await collection.dropIndex('TeamId_1');

//     console.log('Chỉ mục duy nhất trên TeamId đã được xóa thành công');
//   } catch (error) {
//     console.error('Lỗi:', error);
//   } finally {
//     await client.close();
//   }
// }

// dropUniqueIndex();
import crypto from "crypto";
import passwordValidator from "password-validator";

const generateRandomPassword = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const password = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    password.push(characters.charAt(randomIndex));
  }

  return password.join("");
};

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

const generatedPassword = generateRandomPassword(8);
const isPasswordValid = passwordSchema.validate(generatedPassword);

console.log("Generated Password:", generatedPassword);
console.log("Is Password Valid:", isPasswordValid);
