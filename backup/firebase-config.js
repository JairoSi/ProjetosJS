// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDfZgVIAb6AFnnUrSB_RaI5Yk4Ni07ohFM",
  authDomain: "opsync-3cebf.firebaseapp.com",
  projectId: "opsync-3cebf",
  storageBucket: "opsync-3cebf.appspot.com",
  messagingSenderId: "1081718786408",
  appId: "1:1081718786408:web:xxxxxxxxxxxxxxxx",
  databaseURL: "https://opsync-3cebf-default-rtdb.firebaseio.com" // <-- ADICIONE ESSA LINHA
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const app = initializeApp(firebaseConfig);

export { app };