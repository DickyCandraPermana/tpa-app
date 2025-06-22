"use client";

import { useState } from "react";

interface QuestionCardProps {
  question: string;
  options: string[];
  answer: string;
  imageUrl: string;
  audioUrl: string;
  selected: string | null;
  onOptionClick: (option: string) => void;
}

interface OptionProps {
  opt: string;
  onClick: (option: string) => void;
  selected: boolean;
}

const Option = ({ opt, onClick, selected }: OptionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(opt)}
      className={`block w-full text-left p-3 rounded-md border transition
        ${
          isHovered
            ? "bg-green-100 border-green-500"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
        } 
        ${
          selected
            ? "bg-green-100 border-green-500"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
        }
      `}
    >
      {opt}
    </button>
  );
};

const QuestionCard = ({
  question,
  options,
  answer,
  imageUrl,
  selected,
  audioUrl,
  onOptionClick,
}: QuestionCardProps) => {
  return (
    <div className="p-6 bg-gray-200 shadow-md rounded-xl">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Soal"
          className="object-contain w-32 h-32 mb-4"
        />
      )}
      <p className="mb-4">{question}</p>

      <div className="gap-2 grid grid-cols-2">
        {options.map((opt, i) => (
          <Option
            key={i}
            opt={opt}
            onClick={onOptionClick}
            selected={opt === selected}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
