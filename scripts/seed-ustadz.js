const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/opt/data/credentials/firebase-service-account.json';

const app = initializeApp({
  credential: cert(require(credentialsPath)),
  projectId: 'tpa-app-d0d57'
});

const auth = getAuth();
const db = getFirestore();

async function seedUstadz() {
  console.log('=== SEEDING USTADZ ACCOUNT & HALAQAH DATA ===');

  const ustadzEmail = 'ustadz@sibaq.id';
  const ustadzPassword = 'UstadzBerkah2026!';
  const ustadzName = 'Ustadz Ahmad Al-Farisi';

  let ustadzUser;
  try {
    ustadzUser = await auth.getUserByEmail(ustadzEmail);
    console.log(`Found existing Auth user: ${ustadzUser.uid}`);
    await auth.updateUser(ustadzUser.uid, {
      password: ustadzPassword,
      displayName: ustadzName
    });
    console.log('Updated user password and display name.');
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log(`Creating new user for ${ustadzEmail}...`);
      ustadzUser = await auth.createUser({
        email: ustadzEmail,
        password: ustadzPassword,
        displayName: ustadzName
      });
      console.log(`Created new Auth user with UID: ${ustadzUser.uid}`);
    } else {
      throw err;
    }
  }

  const ustadzDoc = {
    uid: ustadzUser.uid,
    email: ustadzEmail,
    username: ustadzName,
    role: 'ustaz',
    active: true,
    avatarURL: 'https://res.cloudinary.com/dogolfub6/image/upload/c_fill,w_300,h_300,g_face/v1791469066/sibaq/course-adab-doa-banner.png',
    totalPoint: 1500,
    completedCourse: [
      'huruf-hijaiyah',
      'tahsin-dasar',
      'tajwid-mad',
      'hukum-nun-sukun',
      'adab-dan-doa-harian'
    ],
    halaqahId: 'halaqah-al-fatihah',
    updatedAt: FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(ustadzUser.uid).set(ustadzDoc, { merge: true });
  console.log(`Firestore document 'users/${ustadzUser.uid}' successfully set.`);

  const halaqahData = {
    id: 'halaqah-al-fatihah',
    name: 'Halaqah Abu Bakar Ash-Shiddiq',
    ustadzId: ustadzUser.uid,
    description: 'Bimbingan Tahsin, Makhraj Huruf, dan Tajwid Santri Pemula & Menengah',
    updatedAt: FieldValue.serverTimestamp()
  };

  await db.collection('halaqah').doc(halaqahData.id).set(halaqahData, { merge: true });
  console.log(`Halaqah '${halaqahData.id}' linked to Ustadz UID: ${ustadzUser.uid}.`);

  // Seed sample pending claims in redeem_requests for testing
  const sampleClaims = [
    {
      id: 'claim-sample-1',
      userId: 'santri-faris',
      userName: 'Muhammad Faris',
      rewardId: 'reward-stiker-doa',
      rewardName: 'Set Stiker Doa Harian Islami',
      pointsRequired: 25,
      status: 'PENDING',
      createdAt: FieldValue.serverTimestamp()
    },
    {
      id: 'claim-sample-2',
      userId: 'santri-aisyah',
      userName: 'Aisyah Humaira',
      rewardId: 'reward-buku-juz-amma',
      rewardName: 'Buku Saku Hafalan Juz \'Amma',
      pointsRequired: 150,
      status: 'PENDING',
      createdAt: FieldValue.serverTimestamp()
    }
  ];

  for (const claim of sampleClaims) {
    await db.collection('redeem_requests').doc(claim.id).set(claim, { merge: true });
    console.log(`Seeded pending claim: [${claim.id}] ${claim.rewardName} for ${claim.userName}`);
  }

  console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
  console.log(`Email:    ${ustadzEmail}`);
  console.log(`Password: ${ustadzPassword}`);
  console.log(`Role:     ustaz`);
}

seedUstadz().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
