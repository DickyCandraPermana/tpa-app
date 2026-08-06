"use client";

import ItemCard from "@/components/ItemCard";

export default function TestPage() {
  return (
    <div className="flex flex-row items-center justify-center h-svh">
      <ItemCard
        name="nama"
        imgURL="https://placehold.co/350X200/png"
        description="deskripsi"
        price={100}
      ></ItemCard>
    </div>
  );
}
