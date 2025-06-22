import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import missingImage from "@/public/assets/missing_image.png"

const CourseCard = ({ course }: any) => {
  const router = useRouter();
  const { uid } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

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
      className="flex flex-col items-center justify-center w-full h-full bg-white rounded-md shadow-md cursor-pointer p-2 transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <Image
        src={imageUrl}
        alt={course.title}
        width={400}
        height={400}
        className="w-full h-48 object-cover rounded-t-md"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">{course.title}</h2>
        <p className="text-gray-600">{course.description}</p>
        <div>
          <p>Level: {course.level}</p>
          <p>Point: {course.point}</p>
          <p>0/{course.totalQuestions}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
