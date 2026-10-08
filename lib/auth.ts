import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
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
      username: user.email ? user.email.split("@")[0] : "",
    });

    return { success: true, user };
  } catch (err: any) {
    console.error("Error during registration:", err);
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

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function changeUserPassword(newPassword: string) {
  if (!auth.currentUser) {
    return { success: false, message: "Pengguna belum login." };
  }
  try {
    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (err: any) {
    console.error("Gagal mengubah kata sandi:", err);
    if (err.code === "auth/requires-recent-login") {
      return {
        success: false,
        message:
          "Demi keamanan akun, silakan keluar dan login ulang sebelum mengganti kata sandi.",
      };
    }
    return {
      success: false,
      message: err.message || "Gagal mengubah kata sandi.",
    };
  }
}


