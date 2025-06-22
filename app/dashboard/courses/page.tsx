"use client";

import CourseCard from "@/components/CourseCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCourses } from "@/lib/courses";
import { CourseProvider } from "@/context/CourseContext";

interface Course {
  id: string;
  imageUrl?: string;
  title?: string;
  description?: string;
}

const Courses = () => {
  const { uid } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [router]);
  return (
    <CourseProvider>
      <div>
        <h2 className="mb-4 text-2xl font-bold">Your Courses</h2>
        <div className="grid grid-cols-4 gap-6">
          {loading ? (
            <p>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p>No courses available.</p>
          ) : (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>
      </div>
    </CourseProvider>
  );
};

export default Courses;
