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
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
console.log(getRandomInt(7,8))
