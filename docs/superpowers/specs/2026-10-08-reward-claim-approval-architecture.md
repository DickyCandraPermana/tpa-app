# SibaQ Reward Claim Approval Architecture & Code Contract Specification

- **Date:** 2026-10-08
- **Project:** SibaQ (`DickyCandraPermana/tpa-app`)
- **Author:** The Key & Dicky Candra Permana
- **Target Path:** `docs/superpowers/specs/2026-10-08-reward-claim-approval-architecture.md`
- **Status:** Approved Architecture & Implementation Contract

---

## 1. Executive Summary & Context

SibaQ adalah aplikasi web gamifikasi edukatif untuk santri Taman Pendidikan Al-Qur'an (TPA) dan asatidz pendamping. Santri mengumpulkan Koin Berkah melalui kuis tajwid dan hijaiyah, kemudian dapat menukarkannya dengan hadiah fisik (buku, pensil warna, tas TPA, dll.) di halaman `/dashboard/exchange`.

### Current Problem & Requirements:
1. **Model Data Firestore & Normalisasi Zod:**
   Dokumen penukaran di koleksi `redeem_requests` memiliki struktur: `id`, `userId`, `userName`, `rewardId`, `rewardName`, `pointsRequired`, `status` (`'PENDING' | 'APPROVED' | 'REJECTED'`), `createdAt`. Model Zod lama (`RedeemRequestSchema`) menggunakan `cost` dan status lowercase (`pending`), sehingga perlu dinormalisasi secara backward-compatible.
2. **Kompensasi Pengembalian Koin (Coin Refund Guarantee):**
   Ketika ustadz menolak (*reject*) klaim hadiah santri, koin santri **wajib dikembalikan secara atomik** (`users.totalPoint += pointsRequired`) dan dicatat dalam audit ledger `coin_transactions` sebagai transaksi `EARNED` dengan `source: 'REWARD_REFUND'`.
3. **Pemisahan Tampilan Berdasarkan Peran (Role-based Views):**
   Halaman `/dashboard/exchange` harus mengenali peran Ustadz (`role === 'ustadz' || role === 'ustaz' || role === 'admin'`) untuk menyajikan tab **"Klaim Santri"** dengan indikator jumlah klaim tertunda (*pending counter*), berdampingan dengan tab **"Katalog Hadiah"**. Santri hanya melihat katalog hadiah tanpa distraksi menu pengelolaan.
4. **Komponen Taktil UI `ClaimApprovalCard`:**
   Komponen visual berdesain taktil 3D (*SibaQ Tactile Design System*) yang menampilkan nama santri, rincian hadiah, biaya koin, tanggal permohonan, serta tombol aksi taktil *"Setujui"* (emerald) dan *"Tolak"* (coral/rose) dengan modal/drawer input alasan penolakan.

---

## 2. System Architecture & Atomic Data Lifecycle

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              REDEEM & APPROVAL LIFECYCLE                          │
└───────────────────────────────────────────────────────────────────────────────────┘

 1. Santri Initiates Claim:
    [Santri: /dashboard/exchange] ───> redeemReward(userId, points, reward)
         │
         ├──> 1. Deduct points from users/{userId} (totalPoint -= pointsRequired)
         ├──> 2. Create coin_transactions record (SPENT, source: REWARD_REDEEM)
         └──> 3. Create redeem_requests doc:
                 {
                   userId, userName, rewardId, rewardName, pointsRequired,
                   status: "PENDING", createdAt: serverTimestamp()
                 }

 2. Ustadz Reviews Claim:
    [Ustadz: /dashboard/exchange] ───> Reads getPendingRedeemRequests()
         │
         ├── Option A: APPROVE
         │   └──> approveRedeemRequest(requestId, ustadzId)
         │        ├── Guard: verify status === "PENDING"
         │        └── Update redeem_requests/{requestId}:
         │            { status: "APPROVED", ustadzId, resolvedAt: serverTimestamp() }
         │            (Points stay spent; physical item handed over to santri)
         │
         └── Option B: REJECT (Atomic Refund Protection)
             └──> rejectRedeemRequest(requestId, ustadzId, reason)
                  ├── Guard: verify status === "PENDING" (Idempotency guarantee)
                  ├── Update redeem_requests/{requestId}:
                  │   { status: "REJECTED", ustadzId, rejectionReason, resolvedAt }
                  ├── Restore points: users/{userId}.totalPoint += pointsRequired
                  └── Record ledger: coin_transactions doc:
                      {
                        userId, amount: pointsRequired, type: "EARNED",
                        source: "REWARD_REFUND", referenceId: requestId,
                        description: "Pengembalian koin: Hadiah ditolak..."
                      }
```

### 2.1 Concurrency & Idempotency Rules:
- **No Double Deduction:** Saat Ustadz menyetujui (`approve`), poin **tidak dipotong lagi** karena poin sudah dipotong di awal permohonan santri.
- **No Double Refund:** Operasi `rejectRedeemRequest` memvalidasi status dokumen secara ketat di dalam Firestore `runTransaction`. Jika dokumen sudah berstatus `APPROVED` atau `REJECTED`, transaksi langsung dibatalkan sebelum mutasi poin terjadi.
- **Audit Consistency:** Setiap pengembalian koin selalu memiliki pasangan dokumen di `coin_transactions` dengan `referenceId === requestId` untuk rekonsiliasi audit ledger.

---

## 3. Code Contracts & Type Definitions

### 3.1 `types/schema.ts` Updates

```typescript
import { z } from "zod";

/**
 * Status siklus hidup permohonan klaim hadiah santri.
 * Mendukung normalisasi case-insensitive untuk backward compatibility.
 */
export const RedeemRequestStatusSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const upper = val.toUpperCase();
    if (upper === "PENDING" || upper === "APPROVED" || upper === "REJECTED") {
      return upper;
    }
  }
  return val;
}, z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"));

export type RedeemRequestStatus = z.infer<typeof RedeemRequestStatusSchema>;

/**
 * Skema data permohonan penukaran hadiah santri.
 * Mengakomodasi legacy field 'cost' -> 'pointsRequired' dan 'timestamp' -> 'createdAt'.
 */
export const RedeemRequestSchema = z.preprocess((raw: any) => {
  if (raw && typeof raw === "object") {
    const points = raw.pointsRequired ?? raw.cost ?? 0;
    const createdAt = raw.createdAt ?? raw.timestamp;
    return {
      ...raw,
      pointsRequired: points,
      cost: points, // Memastikan backward compatibility untuk kode lama
      createdAt: createdAt,
      userName: raw.userName || "Santri",
      rewardName: raw.rewardName || "Hadiah Santri",
    };
  }
  return raw;
}, z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID wajib diisi"),
  userName: z.string().default("Santri"),
  rewardId: z.string().min(1, "Reward ID wajib diisi"),
  rewardName: z.string().default("Hadiah Santri"),
  pointsRequired: z.number().int().positive("Poin harus bilangan bulat positif"),
  cost: z.number().int().positive().optional(),
  status: RedeemRequestStatusSchema,
  ustadzId: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  createdAt: z.any().optional(),
  timestamp: z.any().optional(),
  resolvedAt: z.any().optional(),
  updatedAt: z.any().optional(),
}));

export type RedeemRequest = z.infer<typeof RedeemRequestSchema>;

/**
 * Sumber mutasi koin santri dalam audit ledger.
 * Menambahkan 'REWARD_REFUND' untuk pengembalian koin saat klaim ditolak.
 */
export const CoinTransactionSourceSchema = z.enum([
  "QUIZ",
  "REWARD_REDEEM",
  "MANUAL_ADJUSTMENT",
  "DAILY_BONUS",
  "REWARD_REFUND",
]);

export type CoinTransactionSource = z.infer<typeof CoinTransactionSourceSchema>;

export const CoinTransactionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  amount: z.number().int(),
  type: z.enum(["EARNED", "SPENT"]),
  source: CoinTransactionSourceSchema,
  referenceId: z.string().optional(),
  description: z.string().default(""),
  createdAt: z.any().optional(),
});

export type CoinTransaction = z.infer<typeof CoinTransactionSchema>;
```

---

## 4. Service Function Contracts (`lib/services/rewardService.ts`)

### 4.1 Exact Function Signatures

```typescript
/**
 * Mengambil seluruh klaim hadiah santri yang berstatus PENDING.
 * Digunakan pada antrean Ustadz untuk persetujuan.
 */
export const getPendingRedeemRequests = async (): Promise<RedeemRequest[]>;

/**
 * Mengambil seluruh riwayat klaim hadiah santri (PENDING, APPROVED, REJECTED)
 * dengan batas paginasi tertentu.
 */
export const getAllRedeemRequests = async (
  limitCount?: number
): Promise<RedeemRequest[]>;

/**
 * Menyetujui permohonan penukaran hadiah santri oleh Ustadz.
 * Memvalidasi status PENDING dan menandai serah terima hadiah.
 */
export const approveRedeemRequest = async (
  requestId: string,
  ustadzId: string
): Promise<{ success: boolean; error?: string }>;

/**
 * Menolak permohonan penukaran hadiah santri oleh Ustadz.
 * Mengembalikan koin santri secara atomik dan mencatat transaksi REWARD_REFUND.
 */
export const rejectRedeemRequest = async (
  requestId: string,
  ustadzId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }>;
```

### 4.2 Detailed Implementation Logic

#### 1. `getPendingRedeemRequests`
```typescript
export const getPendingRedeemRequests = async (): Promise<RedeemRequest[]> => {
  try {
    const q = query(
      collection(db, "redeem_requests"),
      where("status", "in", ["PENDING", "pending"]),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => RedeemRequestSchema.parse({ id: d.id, ...d.data() }));
  } catch (error) {
    // Resilient fallback jika composite index belum aktif di Firestore
    const fallbackQ = query(
      collection(db, "redeem_requests"),
      where("status", "in", ["PENDING", "pending"])
    );
    const snap = await getDocs(fallbackQ);
    return snap.docs
      .map((d) => RedeemRequestSchema.parse({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }
};
```

#### 2. `approveRedeemRequest`
```typescript
export const approveRedeemRequest = async (
  requestId: string,
  ustadzId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const requestRef = doc(db, "redeem_requests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      return { success: false, error: "Permintaan klaim hadiah tidak ditemukan." };
    }

    const data = requestSnap.data();
    const currentStatus = String(data.status || "").toUpperCase();

    if (currentStatus !== "PENDING") {
      return {
        success: false,
        error: `Permintaan sudah diproses sebelumnya (Status saat ini: ${currentStatus}).`,
      };
    }

    await updateDoc(requestRef, {
      status: "APPROVED",
      ustadzId,
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error approving redeem request:", error);
    return { success: false, error: error?.message || "Gagal menyetujui klaim hadiah." };
  }
};
```

#### 3. `rejectRedeemRequest` (Atomic Refund + Audit Logging)
```typescript
export const rejectRedeemRequest = async (
  requestId: string,
  ustadzId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    let refundInfo: { userId: string; points: number; rewardName: string } | null = null;

    // Eksekusi transaksi atomik Firestore untuk menjamin integritas data
    await runTransaction(db, async (tx) => {
      const requestRef = doc(db, "redeem_requests", requestId);
      const requestSnap = await tx.get(requestRef);

      if (!requestSnap.exists()) {
        throw new Error("Permintaan klaim hadiah tidak ditemukan.");
      }

      const data = requestSnap.data();
      const currentStatus = String(data.status || "").toUpperCase();

      if (currentStatus !== "PENDING") {
        throw new Error(`Permintaan sudah diproses sebelumnya (${currentStatus}).`);
      }

      const pointsToRefund = data.pointsRequired ?? data.cost ?? 0;
      const targetUserId = data.userId;
      const rewardName = data.rewardName || "Hadiah Santri";

      refundInfo = { userId: targetUserId, points: pointsToRefund, rewardName };

      // 1. Perbarui status dokumen klaim ke REJECTED
      tx.update(requestRef, {
        status: "REJECTED",
        ustadzId,
        rejectionReason: reason?.trim() || "Penukaran hadiah ditolak oleh Ustadz",
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Kembalikan total poin ke akun santri secara atomik
      const userRef = doc(db, "users", targetUserId);
      tx.update(userRef, {
        totalPoint: increment(pointsToRefund),
      });
    });

    // 3. Catat audit ledger koin setelah transaksi database berhasil
    if (refundInfo) {
      const { userId, points, rewardName } = refundInfo;
      await recordCoinTransaction(
        userId,
        points,
        "EARNED",
        "REWARD_REFUND",
        requestId,
        `Pengembalian koin: Penukaran hadiah "${rewardName}" ditolak (${reason?.trim() || "Ditolak Ustadz"})`
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting redeem request:", error);
    return { success: false, error: error?.message || "Gagal menolak klaim hadiah." };
  }
};
```

---

## 5. Vitest Unit & Integration Test Specifications

### 5.1 Test Suite 1: Schema Normalization & Validation (`tests/schema.test.ts`)

```typescript
describe("RedeemRequestSchema & Normalization", () => {
  it("normalizes uppercase status correctly", () => {
    const raw = {
      userId: "u-1",
      rewardId: "r-1",
      pointsRequired: 20,
      status: "APPROVED",
    };
    const parsed = RedeemRequestSchema.parse(raw);
    expect(parsed.status).toBe("APPROVED");
    expect(parsed.pointsRequired).toBe(20);
    expect(parsed.cost).toBe(20);
  });

  it("normalizes legacy lowercase 'pending', 'approved', 'rejected' to uppercase", () => {
    const p1 = RedeemRequestSchema.parse({ userId: "u-1", rewardId: "r-1", cost: 10, status: "pending" });
    const p2 = RedeemRequestSchema.parse({ userId: "u-1", rewardId: "r-1", cost: 10, status: "approved" });
    const p3 = RedeemRequestSchema.parse({ userId: "u-1", rewardId: "r-1", cost: 10, status: "rejected" });

    expect(p1.status).toBe("PENDING");
    expect(p2.status).toBe("APPROVED");
    expect(p3.status).toBe("REJECTED");
  });

  it("maps legacy 'cost' to 'pointsRequired' and 'timestamp' to 'createdAt'", () => {
    const legacy = {
      userId: "u-2",
      rewardId: "r-2",
      cost: 35,
      timestamp: "2026-10-08T10:00:00Z",
    };
    const parsed = RedeemRequestSchema.parse(legacy);
    expect(parsed.pointsRequired).toBe(35);
    expect(parsed.cost).toBe(35);
    expect(parsed.createdAt).toBe("2026-10-08T10:00:00Z");
    expect(parsed.userName).toBe("Santri");
  });

  it("validates CoinTransactionSchema with 'REWARD_REFUND' source", () => {
    const refundTx = {
      id: "tx-ref-1",
      userId: "santri-123",
      amount: 25,
      type: "EARNED" as const,
      source: "REWARD_REFUND" as const,
      referenceId: "req-99",
      description: "Pengembalian koin: Stok hadiah habis",
    };
    const parsed = CoinTransactionSchema.parse(refundTx);
    expect(parsed.source).toBe("REWARD_REFUND");
    expect(parsed.type).toBe("EARNED");
    expect(parsed.amount).toBe(25);
  });
});
```

### 5.2 Test Suite 2: Reward Service Approval & Rejection Logic (`tests/services.test.ts`)

```typescript
describe("Reward Claim Service - Approval & Rejection", () => {
  describe("approveRedeemRequest", () => {
    it("successfully approves a pending request and attaches ustadzId and timestamp", async () => {
      // Mock Firestore getDoc returning status: 'PENDING'
      // Mock updateDoc capturing payload
      const result = await approveRedeemRequest("req-123", "ustadz- Ahmad");
      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: "APPROVED",
          ustadzId: "ustadz- Ahmad",
          resolvedAt: expect.anything(),
        })
      );
      // Verify NO point mutation happened
      expect(mockIncrement).not.toHaveBeenCalled();
    });

    it("rejects approval if request is already APPROVED or REJECTED (Idempotency Guard)", async () => {
      // Mock Firestore getDoc returning status: 'APPROVED'
      const result = await approveRedeemRequest("req-123", "ustadz- Ahmad");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/sudah diproses/i);
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it("returns error if request does not exist", async () => {
      // Mock Firestore getDoc returning exists() === false
      const result = await approveRedeemRequest("non-existent-id", "ustadz- Ahmad");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak ditemukan/i);
    });
  });

  describe("rejectRedeemRequest", () => {
    it("successfully rejects a pending request, refunds points to santri, and writes ledger", async () => {
      // Mock Firestore transaction returning pending request with pointsRequired: 25, userId: 'santri-7'
      const result = await rejectRedeemRequest("req-456", "ustadz- Ahmad", "Stok buku tulis habis");

      expect(result.success).toBe(true);
      // 1. Verify request status updated to REJECTED with reason
      expect(mockTxUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: "REJECTED",
          ustadzId: "ustadz- Ahmad",
          rejectionReason: "Stok buku tulis habis",
          resolvedAt: expect.anything(),
        })
      );
      // 2. Verify santri points restored via increment(+25)
      expect(mockTxUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          totalPoint: mockIncrement(25),
        })
      );
      // 3. Verify coin ledger recorded as EARNED / REWARD_REFUND
      expect(mockRecordCoinTransaction).toHaveBeenCalledWith(
        "santri-7",
        25,
        "EARNED",
        "REWARD_REFUND",
        "req-456",
        expect.stringContaining("Stok buku tulis habis")
      );
    });

    it("prevents double refund when request is already processed (Idempotency Guard)", async () => {
      // Mock Firestore transaction get returning status: 'REJECTED'
      const result = await rejectRedeemRequest("req-456", "ustadz- Ahmad", "Coba lagi");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/sudah diproses/i);
      expect(mockIncrement).not.toHaveBeenCalled();
      expect(mockRecordCoinTransaction).not.toHaveBeenCalled();
    });
  });
});
```

---

## 6. Tactile UI Component: `ClaimApprovalCard`

### 6.1 Component Props Contract

```typescript
export interface ClaimApprovalCardProps {
  request: RedeemRequest;
  onApprove: (requestId: string) => Promise<void> | void;
  onReject: (requestId: string, reason: string) => Promise<void> | void;
  isProcessing?: boolean;
}
```

### 6.2 Component Design & Layout Specification
- **Container:** `TactileCard` dengan padding `p-5`, sudut `rounded-3xl`, border `#F3E8D6`, bayangan lembut.
- **Header Section:**
  - Kiri: Avatar inisial santri (`w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center`), nama lengkap santri, dan tanggal permohonan.
  - Kanan: Lencana status (`PENDING` = amber pill dengan ikon Clock, `APPROVED` = emerald pill dengan ikon CheckCircle2, `REJECTED` = rose pill dengan ikon XCircle).
- **Body Section:**
  - Judul hadiah (`request.rewardName`) dengan ikon kado (`Gift`).
  - Lencana koin: `<GoldBadge type="coin" value={`${request.pointsRequired} Poin`} size="sm" />`.
  - Jika ditolak: Kotak notifikasi warna rose dengan ikon AlertTriangle menampilkan alasan penolakan.
- **Interactive Action Footer (Saat status `PENDING`):**
  - Mode Normal:
    - Tombol **Setujui** (`TactileButton variant="primary" size="sm"`): Warna emerald dengan bevel 3D, memanggil `onApprove(request.id)`.
    - Tombol **Tolak** (`TactileButton variant="coral" size="sm"`): Warna rose/merah ramah dengan bevel 3D, membuka form alasan penolakan.
  - Mode Input Alasan Penolakan (Expandable Drawer / Inline):
    - Input teks: `placeholder="Alasan penolakan (misal: stok habis di lemari TPA)..."`.
    - Chip opsi cepat: `[Stok Habis]`, `[Klaim Dobel]`, `[Santri Berubah Pikiran]`.
    - Tombol konfirmasi tolak: *"Tolak & Refund Koin"* (`variant="coral"`).
    - Tombol batal: *"Batal"* (`variant="ghost"`).

---

## 7. Dashboard Integration (`/dashboard/exchange`)

### 7.1 Role-Based Navigation
- Role check: `const isUstadz = role === "ustadz" || role === "ustaz" || role === "admin";`
- Bila `isUstadz === true`:
  - Menampilkan Tab Switcher mengambang dengan 2 pilihan:
    1. **🎁 Katalog Hadiah:** Melihat daftar hadiah yang tersedia untuk santri.
    2. **📋 Klaim Santri:** Antrean persetujuan penukaran hadiah santri, dilengkapi dengan **Counter Badge** (contoh: pill oranye bertuliskan angka klaim `PENDING`).
- Bila `isUstadz === false` (Santri):
  - Langsung menampilkan antarmuka toko hadiah tanpa tab switcher pengurus, menjaga kesederhanaan untuk santri anak-anak.

### 7.2 State & Optimistic UI Workflow
1. Saat Ustadz menekan tombol "Setujui":
   - Item secara optimis diperbarui menjadi `status: "APPROVED"`.
   - Counter klaim pending berkurang 1.
   - Panggilan `approveRedeemRequest` berjalan di latar belakang.
   - Toast sukses: *"Alhamdulillah! Klaim hadiah berhasil disetujui untuk serah-terima fisik."*
2. Saat Ustadz menekan tombol "Tolak":
   - Item secara optimis diperbarui menjadi `status: "REJECTED"`.
   - Counter klaim pending berkurang 1.
   - Panggilan `rejectRedeemRequest` berjalan di latar belakang.
   - Toast info: *"Klaim ditolak. Koin sejumlah X telah dikembalikan ke saldo santri."*
3. Bila terjadi kegagalan jaringan:
   - State dikembalikan ke kondisi semula (*rollback*).
   - Ditampilkan Toast error ramah anak.

---

## 8. Verification & Test Plan

1. **Unit Testing:**
   - Menjalankan `npm test` untuk memverifikasi parser skema Zod dan transisi status service.
2. **Type Checking:**
   - Menjalankan `npx tsc --noEmit` untuk memastikan semua kontrak tipe, signature, dan return types valid.
3. **Component Testing:**
   - Pengujian Happy-DOM untuk interaksi klik tombol Setujui, pembukaan dialog alasan Tolak, dan rendering status badge.
