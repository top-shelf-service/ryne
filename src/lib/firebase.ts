// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "shyft-xphli",
  "appId": "1:182080370256:web:c59bb42577ff2170228355",
  "storageBucket": "shyft-xphli.firebasestorage.app",
  "apiKey": "AIzaSyDnVcmt5cTjPXz-_d8tSAzvBr07vIKdV20",
  "authDomain": "shyft-xphli.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "182080370256"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
