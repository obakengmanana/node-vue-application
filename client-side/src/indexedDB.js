// client-side/src/indexedDB.js
import { openDB } from 'idb';
import CryptoJS from 'crypto-js';

async function initDB() {
  return openDB('secureDB', 1, {
    upgrade(db) {
      db.createObjectStore('users', { keyPath: 'id' });
    },
  });
}

export async function addUser(user) {
  const db = await initDB();
  const encryptedUser = encryptData(user);
  await db.put('users', encryptedUser);
}

function encryptData(data) {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret-key').toString();
  return { ...data, data: ciphertext };
}
