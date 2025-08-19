// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnVcmt5cTjPXz-_d8tSAzvBr07vIKdV20",
  authDomain: "shyft-xphli.firebaseapp.com",
  databaseURL: "https://shyft-xphli-default-rtdb.firebaseio.com",
  projectId: "shyft-xphli",
  storageBucket: "shyft-xphli.appspot.com",
  messagingSenderId: "182080370256",
  appId: "1:182080370256:web:92042e2eb8a90064228355"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
