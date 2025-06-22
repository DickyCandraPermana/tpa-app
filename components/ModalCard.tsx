import { useState } from "react";
import { useRouter } from "next/navigation";

interface ModalCardProps {
  children: React.ReactNode;
  buttonText: string;
}

const ModalCard = ({ children, buttonText }: ModalCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={openModal}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {buttonText}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded">
            {children}
            <button
              onClick={closeModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalCard;
