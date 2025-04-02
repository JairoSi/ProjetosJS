// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";




const firebaseConfig = {
  apiKey: "AIzaSyDfZgVIAb6AFnnUrSB_RaI5Yk4Ni07ohFM",
  authDomain: "opsync-3cebf.firebaseapp.com",
  projectId: "opsync-3cebf",
  storageBucket: "opsync-3cebf.appspot.com",
  messagingSenderId: "1081718786408",
  appId: "1:1081718786408:web:xxxxxxxxxxxxxxxx",
  databaseURL: "https://opsync-3cebf-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

