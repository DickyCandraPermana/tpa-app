import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface props {
  children: ReactNode;
  title: string;
  description?: string;
}

const Container = ({ children, title, description }: props) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-200 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 z-10 border border-white">
        <div className="flex flex-row items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm font-medium text-slate-500 mt-2">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 ml-4 rounded-full bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4 w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Container;
