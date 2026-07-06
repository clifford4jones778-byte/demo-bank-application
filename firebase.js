// Firebase v10+

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    get,
    push,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase Configuration

const firebaseConfig = {

    apiKey: "AIzaSyBA_gGITL3vOX_wymV8m3c7h_2kYxUEL0A",

    authDomain: "email-5e336.firebaseapp.com",

    databaseURL: "https://email-5e336-default-rtdb.firebaseio.com",

    projectId: "email-5e336",

    storageBucket: "email-5e336.appspot.com",

    messagingSenderId: "561655323170",

    appId: "1:561655323170:web:42fcf886c34f2d5a16487b",

    measurementId: "G-J92WNBY5RL"

};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);

export {

    auth,

    db,

    ref,

    set,

    get,

    push,

    update,

    onValue

};

