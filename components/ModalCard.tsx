import { useState } from "react";
import { useRouter } from "next/navigation";

const ModalCard = () => {
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
        Open Modal
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Modal Title</h2>
            <p className="mb-4">Modal content goes here.</p>
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
