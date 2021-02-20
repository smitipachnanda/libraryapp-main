import * as firebase from firebase
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyDkIxawnWeN9C4ZMDMoFykXaZIa8GRka2s",
    authDomain: "willy-fdaf8.firebaseapp.com",
    projectId: "willy-fdaf8",
    storageBucket: "willy-fdaf8.appspot.com",
    messagingSenderId: "152516701890",
    appId: "1:152516701890:web:0162ee113fa86d0e5cd55b"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
export default firebase.firestore();