"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourseById } from "@/lib/courses";

const CourseDetail = ({ params }: { params: Promise<{ course: string }> }) => {
  type Course = {
    id: string;
    imageUrl?: string;
    title?: string;
    description?: string;
    category?: string;
    level?: string;
    totalQuestions?: number;
  };
  const { course } = React.use(params);
  const [courseData, setCourseData] = useState<Course>({ id: course });
  const { uid } = useAuth();
  const router = useRouter();

  const handleTakeExam = () => {
    if (uid) {
      router.push(`/dashboard/courses/${course}/take`);
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const fetchedCourse = await getCourseById(course);
        if (fetchedCourse) {
          setCourseData(fetchedCourse);
        } else {
          console.error("Course not found");
          // Optionally, set a message to display to the user
          // setCourseData({ ...courseData, title: "Course not found" });
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };
    fetchCourse();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <img
        src="https://via.placeholder.com/300x150"
        alt="Course Image"
        className="w-full h-60 object-cover rounded-xl shadow"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {courseData.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kategori: <span className="font-medium">{courseData.category}</span>
          </p>
        </div>
        <span className="mt-2 sm:mt-0 inline-block px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
          {courseData.level}
        </span>
      </div>

      <p className="text-gray-700 leading-relaxed">{courseData.description}</p>

      <div className="flex items-center space-x-6 text-sm text-gray-600 border-t pt-4">
        <div className="flex items-center space-x-1">
          <span className="font-semibold">Total Soal:</span>
          <span>{courseData.totalQuestions}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="font-semibold">ID:</span>
          <span>{courseData.id}</span>
        </div>
      </div>

      <div>
        <button
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-800 transition"
          onClick={handleTakeExam}
        >
          Mulai Belajar
        </button>
      </div>
    </div>
  );
};

export default CourseDetail;
