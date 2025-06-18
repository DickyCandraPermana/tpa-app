import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seed() {
  // 1. Users
  const users = [
    {
      uid: "user1",
      name: "Froerybell",
      email: "froerybell@example.com",
      totalPoints: 150,
      completedCourses: ["courseA"],
      createdAt: new Date(),
    },
    {
      uid: "user2",
      name: "Aisyah",
      email: "aisyah@example.com",
      totalPoints: 80,
      completedCourses: [],
      createdAt: new Date(),
    },
  ];

  for (const user of users) {
    await db.collection("users").doc(user.uid).set(user);
  }

  // 2. Rewards
  const rewards = [
    {
      id: "reward1",
      name: "Buku Tulis TPA",
      description: "Buku tulis untuk belajar huruf hijaiyah",
      imageUrl: "https://dummyimage.com/200x200/eee/000&text=Buku+TPA",
      requiredPoints: 100,
    },
    {
      id: "reward2",
      name: "Pensil Santri",
      description: "Pensil bertema TPA lucu",
      imageUrl: "https://dummyimage.com/200x200/eee/000&text=Pensil+TPA",
      requiredPoints: 50,
    },
  ];

  for (const reward of rewards) {
    await db.collection("rewards").doc(reward.id).set(reward);
  }

  // 3. Redeem Requests
  const redeemRequests = [
    {
      userId: "user1",
      rewardId: "reward1",
      status: "pending",
      requestedAt: new Date(),
    },
    {
      userId: "user2",
      rewardId: "reward2",
      status: "approved",
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 hari lalu
    },
  ];

  for (const [index, req] of redeemRequests.entries()) {
    await db
      .collection("redeem_requests")
      .doc(`redeem${index + 1}`)
      .set(req);
  }

  // 4. User Progress
  const userProgress = [
    {
      userId: "user1",
      courseId: "courseA",
      completedQuestions: ["q1", "q2", "q3"],
      score: 30,
      lastAccessed: new Date(),
    },
    {
      userId: "user2",
      courseId: "courseA",
      completedQuestions: ["q1"],
      score: 10,
      lastAccessed: new Date(),
    },
  ];

  for (const [index, progress] of userProgress.entries()) {
    await db
      .collection("user_progress")
      .doc(`progress${index + 1}`)
      .set(progress);
  }

  console.log("🔥 SEED DATA BERHASIL DISUNTIKKAN KE FIRESTORE 🔥");
}

seed().catch((err) => {
  console.error("❌ ERROR SEEDING:", err);
});
