import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function registerUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Buat dokumen user di Firestore (collection 'users', pakai UID sebagai ID dokumen)
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date(),
      totalPoint: 0,
      completedCourse: [],
      active: true,
      role: "user",
      avatarURL: "",
    });

    return { success: true, user };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    // 1. Sign in dulu
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 2. Ambil data user dari Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return {
        success: false,
        message: "User document not found in Firestore.",
      };
    }

    const userData = userDocSnap.data();

    return {
      success: true,
      userAuth: user,
      userData,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
