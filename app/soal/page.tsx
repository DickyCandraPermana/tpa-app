import QuestionCard from "@/components/QuestionCard";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Belajar Huruf Hijaiyah</h1>
      <QuestionCard courseId="huruf-hijaiyah" />
    </main>
  );
}
