// backend/firebaseService.js
const admin = require('firebase-admin');

// Certifique-se de que 'firebase-service-account.json' está no mesmo diretório
// IMPORTANTE: Este arquivo contém credenciais sensíveis e deve ser mantido em .gitignore
const serviceAccount = require('./firebase-service-account.json');

// Inicializa o Firebase Admin SDK APENAS UMA VEZ
// Adicionamos a verificação para garantir que não será inicializado novamente
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://whatsapp-sales-assistant-default-rtdb.firebaseio.com" // Verifique se esta URL está correta
  });
}

const db = admin.firestore();
const auth = admin.auth();

console.log('🔥 Firebase Admin inicializado.');

// Exporta 'db' e 'auth' para que outros módulos possam acessá-los.
// Exporta 'admin' também, pois FieldValue.serverTimestamp() é um método de 'admin.firestore.FieldValue'.
module.exports = { db, admin, auth };