// firebase.js
// Central Firebase initialization for RoomDrop.
// Import everything you need from THIS file in other files —
// never call initializeApp() anywhere else, or you'll get
// duplicate-app errors.

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
} from "firebase/firestore";

// ---------------------------------------------------------------
// Your Firebase project config (from console.firebase.google.com)
// This API key is safe to keep in client-side code — Firebase
// access is controlled by Firestore Security Rules, not by
// hiding this key. Do not also paste your private service-account
// keys here; those are different and must stay server-side only.
// ---------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDRcdyG8HwvUEOHNEAyh2HkLLNPG9zp3_8",
  authDomain: "room-drop-bfd4e.firebaseapp.com",
  projectId: "room-drop-bfd4e",
  storageBucket: "room-drop-bfd4e.firebasestorage.app",
  messagingSenderId: "1046954515982",
  appId: "1:1046954515982:web:17420e47328241a5c7a65f",
  measurementId: "G-VTSFMKETH3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// ---------------------------------------------------------------
// AUTH HELPERS
// ---------------------------------------------------------------

async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    if (
      err.code === "auth/popup-blocked" ||
      err.code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

async function checkRedirectResult() {
  const result = await getRedirectResult(auth);
  return result ? result.user : null;
}

async function signUpWithEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function loginAsGuest() {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

async function logout() {
  await signOut(auth);
}

function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

// ---------------------------------------------------------------
// FIRESTORE: ROOMS
// ---------------------------------------------------------------

const roomsCol = collection(db, "rooms");

async function createRoom({
  roomId,
  password,
  mode,
  region,
  language,
  totalSlots,
  startsInSeconds,
  creatorId,
  creatorName,
  creatorVerified = false,
}) {
  const startsAt = new Date(Date.now() + startsInSeconds * 1000);
  const docRef = await addDoc(roomsCol, {
    roomId,
    password,
    mode,
    region,
    language,
    totalSlots,
    filledSlots: 0,
    creatorId,
    creatorName,
    creatorVerified,
    startsAt,
    createdAt: serverTimestamp(),
    views: 0,
    joins: 0,
    trending: false,
    status: startsInSeconds <= 5 ? "live" : "scheduled",
  });
  return docRef.id;
}

async function updateRoom(roomDocId, updates) {
  await updateDoc(doc(db, "rooms", roomDocId), updates);
}

async function deleteRoom(roomDocId) {
  await deleteDoc(doc(db, "rooms", roomDocId));
}

function subscribeToActiveRooms(callback) {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  const q = query(
    roomsCol,
    where("startsAt", ">=", tenMinAgo),
    orderBy("startsAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rooms);
  });
}

function subscribeToMyRooms(creatorId, callback) {
  const q = query(
    roomsCol,
    where("creatorId", "==", creatorId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rooms);
  });
}

async function incrementRoomViews(roomDocId) {
  await updateDoc(doc(db, "rooms", roomDocId), { views: increment(1) });
}

async function incrementRoomJoins(roomDocId) {
  await updateDoc(doc(db, "rooms", roomDocId), { joins: increment(1) });
}
 async function incrementRoomSlot(roomDocId) {
  const roomRef = doc(db, "rooms", roomDocId);
  await updateDoc(roomRef, { filledSlots: increment(1) });
}

// ---------------------------------------------------------------
// FIRESTORE: FAVORITES (saved creators)
// ---------------------------------------------------------------

async function getFavorites(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().favoriteCreators || [] : [];
}

async function setFavorites(uid, favoriteCreators) {
  await updateDoc(doc(db, "users", uid), { favoriteCreators }).catch(
    async () => {
      const { setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "users", uid), { favoriteCreators });
    }
  );
}

export {
  app,
  auth,
  db,
  loginWithGoogle,
  checkRedirectResult,
  signUpWithEmail,
  loginWithEmail,
  loginAsGuest,
  logout,
  subscribeToAuthChanges,
  createRoom,
  updateRoom,
  deleteRoom,
  subscribeToActiveRooms,
  subscribeToMyRooms,
  incrementRoomViews,
  incrementRoomJoins,
  incrementRoomSlot,
  getFavorites,
  setFavorites,
};
