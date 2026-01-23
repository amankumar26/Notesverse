import { encrypt, decrypt } from './utils/encryption.js';

// 1. Example of how it works
console.log("--- Encryption/Decryption Test ---");

const mySecretData = "user@upi";
console.log("Original Data:   ", mySecretData);

// Encrypt it
const encryptedData = encrypt(mySecretData);
console.log("Encrypted (DB):  ", encryptedData);

// Decrypt it
const decryptedData = decrypt(encryptedData);
console.log("Decrypted (UI):  ", decryptedData);

console.log("\n--- How to decrypt a specific string ---");
// You can replace the string below with one from your database to test
const dbString = encryptedData;
console.log(`Decrypting '${dbString}':`, decrypt(dbString));
