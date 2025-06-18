import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface props {
  children: ReactNode;
  title: String;
  description: String;
}

const Container = ({ children, title, description }: props) => {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="flex flex-row h-[50px] items-center justify-center">
            <div className="w-1/3"></div>
            <div className=" w-full h-full text-2xl font-bold text-center flex items-center justify-center text-gray-800">
              <h1>{title}</h1>
              {description && (
                <p className="text-sm text-slate-500 text-left">
                  {description}
                </p>
              )}
            </div>
            <div className="w-1/3 flex justify-end">
              <button
                onClick={() => router.back()}
                className="p-1 font-bold bg-gray-100 text-red-400 hover:bg-red-400 hover:text-gray-100 size-8 rounded-full animate transition duration-200 ease-in-out"
              >
                X
              </button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default Container;
