import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import missingImage from "@/public/assets/missing_image.png";
import { Play, Star, ListChecks } from "lucide-react";

const CourseCard = ({ course }: any) => {
  const router = useRouter();
  const { uid } = useAuth();

  const handleCardClick = () => {
    if (uid) {
      router.push(`/dashboard/courses/${course.id}`);
    } else {
      router.push("/login");
    }
  };

  const imageUrl =
    course.imageUrl &&
    typeof course.imageUrl === "string" &&
    (course.imageUrl.startsWith("http://") ||
      course.imageUrl.startsWith("https://"))
      ? course.imageUrl
      : missingImage.src;

  return (
    <div
      className="group flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-200 overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform delay-75">
            <Play className="w-8 h-8 ml-1" />
          </div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h2 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.title}</h2>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase">Level</span>
            <span className="text-sm font-semibold text-slate-700">{course.level || "Pemula"}</span>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
              <ListChecks className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-bold">{course.totalQuestions || 0} Soal</span>
            </div>
            
            <div className="flex items-center gap-1 text-slate-600 bg-amber-50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-sm font-bold text-amber-600">{course.point || 0} Poin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
