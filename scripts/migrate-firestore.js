const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const path = require('path');

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/opt/data/credentials/firebase-service-account.json';

const app = initializeApp({
  credential: cert(require(credentialsPath)),
  projectId: 'tpa-app-d0d57'
});

const db = getFirestore();

async function migrateUsers() {
  console.log('\n--- 1. Normalizing Users ---');
  const usersSnap = await db.collection('users').get();
  console.log(`Found ${usersSnap.size} total users in Firestore.`);

  let updatedCount = 0;
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    const updates = {};

    // Normalize role: "user" -> "santri"
    if (data.role === 'user' || !data.role) {
      updates.role = 'santri';
    }

    if (data.totalPoint === undefined || data.totalPoint === null) {
      updates.totalPoint = 0;
    }

    if (!Array.isArray(data.completedCourse)) {
      updates.completedCourse = [];
    }

    if (data.active === undefined) {
      updates.active = true;
    }

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      console.log(`Updated user [${doc.id}]:`, updates);
      updatedCount++;
    }
  }
  console.log(`Successfully normalized ${updatedCount} users.`);
}

async function cleanMockData() {
  console.log('\n--- 2. Cleaning Mock/Broken Legacy Data ---');

  // A. Clean dummy course 'courseID'
  const dummyCourseDoc = await db.collection('courses').doc('courseID').get();
  if (dummyCourseDoc.exists) {
    await dummyCourseDoc.ref.delete();
    console.log('Deleted dummy course document: courseID');
  }

  // B. Clean broken questions with placeholder URLs
  const questionsSnap = await db.collection('questions').get();
  let deletedQuestions = 0;
  for (const doc of questionsSnap.docs) {
    const data = doc.data();
    const prompt = data.prompt || '';
    if (prompt.includes('your-app-id.appspot.com') || doc.id.startsWith('dummy_')) {
      await doc.ref.delete();
      console.log(`Deleted broken question [${doc.id}]: prompt = "${prompt.slice(0, 40)}..."`);
      deletedQuestions++;
    }
  }
  console.log(`Cleaned ${deletedQuestions} broken questions.`);

  // C. Clean mock redeem requests (redeem1, redeem2)
  const mockRedeemIds = ['redeem1', 'redeem2'];
  for (const id of mockRedeemIds) {
    const ref = db.collection('redeem_requests').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      console.log(`Deleted mock redeem request: ${id}`);
    }
  }

  // D. Clean mock rewards (reward1, reward2)
  const mockRewardIds = ['reward1', 'reward2'];
  for (const id of mockRewardIds) {
    const ref = db.collection('rewards').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      console.log(`Deleted mock reward: ${id}`);
    }
  }

  // E. Clean mock user_progress (progress1, progress2)
  const mockProgressIds = ['progress1', 'progress2'];
  for (const id of mockProgressIds) {
    const ref = db.collection('user_progress').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      console.log(`Deleted mock progress: ${id}`);
    }
  }
}

async function seedCoursesAndQuestions() {
  console.log('\n--- 3. Seeding Authentic Courses & Question Bank ---');

  const courses = [
    {
      id: 'huruf-hijaiyah',
      title: 'Pengenalan Huruf Hijaiyah',
      description: 'Belajar mengenal 28 huruf hijaiyah, makhraj dasar, dan pelafalan yang fasih.',
      category: 'Tahsin & Hijaiyah',
      level: 'Iqro 1 (Pemula)',
      imageUrl: 'https://res.cloudinary.com/dogolfub6/image/upload/v1791468936/sibaq/course-hijaiyah-banner.png',
      totalQuestions: 5,
      order: 1,
      questions: [
        {
          id: 'q_hijaiyah_1',
          prompt: "Huruf apakah yang berbunyi 'Ta'?",
          options: ['ت', 'ث', 'ط', 'د'],
          correctAnswer: 'ت',
          transliteration: 'Ta',
          arabicText: 'ت',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_hijaiyah_2',
          prompt: "Manakah huruf 'Jim'?",
          options: ['ج', 'ح', 'خ', 'ع'],
          correctAnswer: 'ج',
          transliteration: 'Jim',
          arabicText: 'ج',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_hijaiyah_3',
          prompt: "Huruf apakah ini: 'ش'?",
          options: ['Syin', 'Sin', 'Shad', 'Dhad'],
          correctAnswer: 'Syin',
          transliteration: 'Syin',
          arabicText: 'ش',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_hijaiyah_4',
          prompt: 'Huruf hijaiyah pertama dalam urutan abjad Arab adalah?',
          options: ['ا (Alif)', 'ب (Ba)', 'ت (Ta)', 'ي (Ya)'],
          correctAnswer: 'ا (Alif)',
          transliteration: 'Alif',
          arabicText: 'ا',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_hijaiyah_5',
          prompt: 'Huruf yang memiliki titik satu di bawah adalah?',
          options: ['ب (Ba)', 'ت (Ta)', 'ث (Tsa)', 'ن (Nun)'],
          correctAnswer: 'ب (Ba)',
          transliteration: 'Ba',
          arabicText: 'ب',
          points: 10,
          type: 'multiple_choice'
        }
      ]
    },
    {
      id: 'tahsin-dasar',
      title: 'Harakat & Tanda Baca',
      description: 'Mengenal harakat fathah, kasrah, dhammah, sukun, tanwin, dan tasydid.',
      category: 'Tahsin & Hijaiyah',
      level: 'Iqro 2 (Dasar)',
      imageUrl: 'https://res.cloudinary.com/dogolfub6/image/upload/c_fill,w_1000,h_560,e_tint:15:004020/v1791468936/sibaq/course-hijaiyah-banner.png',
      totalQuestions: 5,
      order: 2,
      questions: [
        {
          id: 'q_harakat_1',
          prompt: "Tanda baca garis miring di atas huruf yang berbunyi 'A' adalah?",
          options: ['Fathah ( َ )', 'Kasrah ( ِ )', 'Dhammah ( ُ )', 'Sukun ( ْ )'],
          correctAnswer: 'Fathah ( َ )',
          transliteration: 'Fathah',
          arabicText: 'َ',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_harakat_2',
          prompt: "Bunyi huruf 'ب' yang diberi tanda Kasrah ( ِ ) adalah?",
          options: ['Bi', 'Ba', 'Bu', 'Ban'],
          correctAnswer: 'Bi',
          transliteration: 'Bi',
          arabicText: 'بِ',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_harakat_3',
          prompt: 'Tanda baca Sukun ( ْ ) berfungsi untuk?',
          options: ['Mematikan bunyi huruf', 'Memanjangkan bacaan', 'Mendobelkan huruf', 'Mendengungkan suara'],
          correctAnswer: 'Mematikan bunyi huruf',
          transliteration: 'Sukun',
          arabicText: 'ْ',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_harakat_4',
          prompt: 'Tanda Tasydid / Syaddah ( ّ ) berfungsi untuk?',
          options: ['Mendobelkan/menekan pelafalan huruf', 'Membuat bunyi menjadi samar', 'Menghentikan bacaan', 'Membalik bunyi huruf'],
          correctAnswer: 'Mendobelkan/menekan pelafalan huruf',
          transliteration: 'Tasydid',
          arabicText: 'ّ',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_harakat_5',
          prompt: "Harakat Tanwin Dhammahtain ( ٌ ) pada huruf 'د' menghasilkan bunyi?",
          options: ['Dun', 'Dan', 'Din', 'Du'],
          correctAnswer: 'Dun',
          transliteration: 'Dun',
          arabicText: 'دٌ',
          points: 10,
          type: 'multiple_choice'
        }
      ]
    },
    {
      id: 'tajwid-mad',
      title: 'Hukum Mad & Qalqalah',
      description: 'Mempelajari panjang bacaan Mad Thabi\'i dan sifat pantulan huruf Qalqalah.',
      category: 'Kaidah Tajwid',
      level: 'Al-Qur\'an (Menengah)',
      imageUrl: 'https://res.cloudinary.com/dogolfub6/image/upload/c_fill,w_1000,h_560,e_tint:20:201000/v1791469040/sibaq/course-nun-sukun-banner.jpg',
      totalQuestions: 5,
      order: 3,
      questions: [
        {
          id: 'q_tajwid_1',
          prompt: 'Berapakah huruf Mad Thabi\'i (Mad Asli)?',
          options: ['3 huruf (Alif, Wawu, Ya)', '2 huruf (Alif, Ya)', '4 huruf (Alif, Wawu, Ya, Nun)', '5 huruf'],
          correctAnswer: '3 huruf (Alif, Wawu, Ya)',
          transliteration: 'Alif, Wawu, Ya',
          arabicText: 'ا - و - ي',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_tajwid_2',
          prompt: 'Berapakah panjang ketukan/harakat untuk Mad Thabi\'i?',
          options: ['2 harakat (1 alif)', '4 harakat (2 alif)', '6 harakat (3 alif)', '1 harakat'],
          correctAnswer: '2 harakat (1 alif)',
          transliteration: '2 Harakat',
          arabicText: '٢ حركات',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_tajwid_3',
          prompt: 'Huruf-huruf Qalqalah (memantul) terangkum dalam kalimat?',
          options: ['Baju Di Thoko (ب, ج, د, ط, ق)', 'Alif Ba Ta Tsa', 'Yarmalun (ي, ر, م, ل, و, ن)', 'Kha Kho Ain Ghain'],
          correctAnswer: 'Baju Di Thoko (ب, ج, د, ط, ق)',
          transliteration: 'Qutbu Jadin',
          arabicText: 'قُطْبُ جَدٍّ',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_tajwid_4',
          prompt: "Hukum Nun Sukun (نْ) bertemu huruf Ba (ب) dibaca mendengung ke bunyi 'Mim' disebut?",
          options: ['Iqlab', 'Idgham Bighunnah', 'Izhhar Halqi', 'Ikhfa Haqiqi'],
          correctAnswer: 'Iqlab',
          transliteration: 'Iqlab',
          arabicText: 'إِقْلَاب',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_tajwid_5',
          prompt: 'Apa arti sifat bacaan Qalqalah secara bahasa?',
          options: ['Memantul / bergetar', 'Jelas / terang', 'Samar-samar', 'Memasukkan bunyi'],
          correctAnswer: 'Memantul / bergetar',
          transliteration: 'Memantul',
          arabicText: 'قَلْقَلَة',
          points: 10,
          type: 'multiple_choice'
        }
      ]
    },
    {
      id: 'hukum-nun-sukun',
      title: 'Hukum Nun Sukun & Tanwin',
      description: 'Memahami kaidah Izhar Halqi, Idgham Bighunnah, Idgham Bilaghunnah, Iqlab, dan Ikhfa Haqiqi.',
      category: 'Kaidah Tajwid',
      level: 'Al-Qur\'an (Lanjutan)',
      imageUrl: 'https://res.cloudinary.com/dogolfub6/image/upload/v1791469040/sibaq/course-nun-sukun-banner.jpg',
      totalQuestions: 5,
      order: 4,
      questions: [
        {
          id: 'q_nun_1',
          prompt: 'Nun Sukun (نْ) atau Tanwin bertemu huruf Alif (ء), Ha (هـ), \'Ain (ع), Ghain (غ), Ha (ح), Kha (خ) dibaca jelas tanpa dengung disebut?',
          options: ['Izhar Halqi', 'Idgham Bighunnah', 'Ikhfa Haqiqi', 'Iqlab'],
          correctAnswer: 'Izhar Halqi',
          transliteration: 'Izhar Halqi',
          arabicText: 'إِظْهَار حَلْقِي',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_nun_2',
          prompt: 'Berapakah jumlah huruf Idgham Bighunnah (ي, ن, م, و)?',
          options: ['4 Huruf', '6 Huruf', '2 Huruf', '15 Huruf'],
          correctAnswer: '4 Huruf',
          transliteration: '4 Huruf (Yanmu)',
          arabicText: '٤ حروف (ي ن م و)',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_nun_3',
          prompt: 'Huruf apakah yang termasuk dalam hukum Idgham Bilaghunnah (lebur tanpa dengung)?',
          options: ['Lam (ل) dan Ra (ر)', 'Wawu (و) dan Ya (ي)', 'Nun (ن) dan Mim (م)', 'Kaf (ك) dan Qaf (ق)'],
          correctAnswer: 'Lam (ل) dan Ra (ر)',
          transliteration: 'Lam & Ra',
          arabicText: 'ل - ر',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_nun_4',
          prompt: 'Ikhfa Haqiqi artinya menyamarkan bacaan antara Izhar dan Idgham disertai dengung. Berapakah jumlah huruf Ikhfa?',
          options: ['15 Huruf', '6 Huruf', '4 Huruf', '8 Huruf'],
          correctAnswer: '15 Huruf',
          transliteration: '15 Huruf',
          arabicText: '١٥ حرفاً',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_nun_5',
          prompt: 'Contoh bacaan Iqlab pada lafaz \'مِنْ بَعْدِ\' ditandai dengan perubahan suara huruf Nun Sukun menjadi bunyi?',
          options: ['Mim (م)', 'Wawu (و)', 'Sin (س)', 'Nun tebal (ن)'],
          correctAnswer: 'Mim (م)',
          transliteration: 'Mim (M)',
          arabicText: 'م',
          points: 10,
          type: 'multiple_choice'
        }
      ]
    },
    {
      id: 'adab-dan-doa-harian',
      title: 'Adab Santri & Doa Harian',
      description: 'Mempelajari adab mulia menuntut ilmu, adab tilawah Al-Qur\'an, serta hafalan doa harian penuntun santri.',
      category: 'Adab & Akhlak',
      level: 'Semua Tingkat',
      imageUrl: 'https://res.cloudinary.com/dogolfub6/image/upload/v1791469066/sibaq/course-adab-doa-banner.png',
      totalQuestions: 5,
      order: 5,
      questions: [
        {
          id: 'q_adab_1',
          prompt: 'Sebelum mulai mengaji dan menyentuh mushaf Al-Qur\'an, santri disunnahkan untuk?',
          options: ['Berwudhu & suci dari hadats', 'Makan kenyang', 'Berlari-lari', 'Memakai sepatu'],
          correctAnswer: 'Berwudhu & suci dari hadats',
          transliteration: 'Berwudhu',
          arabicText: 'وُضُوء',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_adab_2',
          prompt: "Lafaz doa sebelum belajar: 'Rabbi zidnii 'ilman wa...?'",
          options: ['warzuqnii fahmaa', 'warhamhumaa kamaa rabbayaanii', 'wa baarik lanaa fiimaa razaqtanaa', 'wa qinaa \'adzaaban naar'],
          correctAnswer: 'warzuqnii fahmaa',
          transliteration: "warzuqnii fahmaa",
          arabicText: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_adab_3',
          prompt: 'Sikap santri yang beradab ketika Ustadz atau Ustazah sedang menerangkan materi adalah?',
          options: ['Duduk tertib dan menyimak dengan seksama', 'Bermain gawai / HP', 'Mengobrol dengan teman sebelah', 'Tidur di meja'],
          correctAnswer: 'Duduk tertib dan menyimak dengan seksama',
          transliteration: 'Tawadhu & Khusyuk',
          arabicText: 'أَدَبُ الْمَجْلِسِ',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_adab_4',
          prompt: "Kelanjutan doa untuk kedua orang tua: 'Rabbighfir lii wa liwaalidayya warhamhumaa kamaa...?'",
          options: ['rabbayaanii shaghiiraa', 'khalaqtani musliman', 'razaqtani katsiiraa', 'a\'thaytani na\'iimaa'],
          correctAnswer: 'rabbayaanii shaghiiraa',
          transliteration: 'rabbayaanii shaghiiraa',
          arabicText: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
          points: 10,
          type: 'multiple_choice'
        },
        {
          id: 'q_adab_5',
          prompt: "Doa penutup majelis: 'Subhaanakallaahumma wa bihamdika, asyhadu allaa ilaaha illaa Anta, astaghfiruka wa...?'",
          options: ['atuubu ilaik', 'rahmatuka wasi\'at', 'adkhilnal jannah', 'taqabbal minnaa'],
          correctAnswer: 'atuubu ilaik',
          transliteration: 'atuubu ilaik',
          arabicText: 'أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
          points: 10,
          type: 'multiple_choice'
        }
      ]
    }
  ];

  for (const c of courses) {
    const { questions, ...courseData } = c;
    await db.collection('courses').doc(c.id).set(courseData, { merge: true });
    console.log(`Seeded course: ${c.id} (${c.title})`);

    for (const q of questions) {
      await db.collection('questions').doc(q.id).set({
        courseId: c.id,
        ...q
      }, { merge: true });
      console.log(`  - Seeded question: [${q.id}] ${q.prompt.slice(0, 35)}...`);
    }
  }
}

async function seedRewards() {
  console.log('\n--- 4. Seeding Authentic Santri Rewards Catalog ---');

  const rewards = [
    {
      id: 'reward-stiker-doa',
      name: 'Stiker Doa & Dzikir Harian',
      description: 'Stiker lucu berisi doa harian untuk ditempel di kamar dan meja belajar.',
      pointsRequired: 10,
      stock: 100
    },
    {
      id: 'reward-buku-prestasi',
      name: 'Buku Mutaba\'ah & Prestasi',
      description: 'Buku catatan harian tilawah dan hafalan Al-Qur\'an.',
      pointsRequired: 25,
      stock: 50
    },
    {
      id: 'reward-tasbih-digital',
      name: 'Tasbih Digital Mini',
      description: 'Tasbih digital praktis untuk menghitung dzikir dan istighfar.',
      pointsRequired: 50,
      stock: 30
    },
    {
      id: 'reward-peci-santri',
      name: 'Peci / Kopiah Santri',
      description: 'Peci eksklusif santri dengan bahan nyaman dan rapi.',
      pointsRequired: 100,
      stock: 20
    },
    {
      id: 'reward-sajadah-travel',
      name: 'Sajadah Travel Anak',
      description: 'Sajadah lipat mini lembut, mudah dibawa saat mengaji dan bepergian.',
      pointsRequired: 200,
      stock: 15
    },
    {
      id: 'reward-quran-tajwid',
      name: 'Mushaf Al-Qur\'an Saku Tajwid',
      description: 'Mushaf saku dengan panduan warna tajwid lengkap.',
      pointsRequired: 350,
      stock: 10
    }
  ];

  for (const r of rewards) {
    await db.collection('rewards').doc(r.id).set(r, { merge: true });
    console.log(`Seeded reward: [${r.id}] ${r.name} (${r.pointsRequired} poin)`);
  }
}

async function seedDefaultHalaqah() {
  console.log('\n--- 5. Initializing Halaqah Structure ---');

  const halaqahData = {
    id: 'halaqah-al-fatihah',
    name: 'Halaqah Al-Fatihah',
    ustadzId: 'ustadz-utama',
    description: 'Bimbingan Tahsin, Makhraj Huruf, dan Tajwid Santri Pemula',
    createdAt: FieldValue.serverTimestamp()
  };

  await db.collection('halaqah').doc(halaqahData.id).set(halaqahData, { merge: true });
  console.log(`Seeded halaqah: [${halaqahData.id}] ${halaqahData.name}`);
}

async function main() {
  console.log('=== STARTING SIBAQ FIRESTORE NORMALIZATION & SEEDING ===');
  try {
    await migrateUsers();
    await cleanMockData();
    await seedCoursesAndQuestions();
    await seedRewards();
    await seedDefaultHalaqah();
    console.log('\n=== MIGRATION & SEEDING SUCCESSFULLY COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n!!! MIGRATION FAILED:', error);
    process.exit(1);
  }
}

main();
