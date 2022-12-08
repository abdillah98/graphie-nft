// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjsv54Ozbuu6FqT0vbUbstoqby6U1IL7o",
  authDomain: "graphie-nft-image.firebaseapp.com",
  projectId: "graphie-nft-image",
  storageBucket: "graphie-nft-image.appspot.com",
  messagingSenderId: "666060279922",
  appId: "1:666060279922:web:3d6944ba95ef6323d132eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)