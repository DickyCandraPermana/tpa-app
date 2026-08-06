"use client";

interface QuestionCardProps {
  question: string;
  options: string[];
  answer: string;
  imageUrl: string;
  audioUrl: string;
  selected: string | null;
  className?: string;
  onOptionClick: (option: string) => void;
}

interface OptionProps {
  opt: string;
  onClick: (option: string) => void;
  selected: boolean;
}

const Option = ({ opt, onClick, selected }: OptionProps) => {
  return (
    <button
      onClick={() => onClick(opt)}
      className={`relative flex items-center justify-center min-w-32 md:min-w-44 min-h-32 md:min-h-44 w-full text-center rounded-3xl border-b-[6px] border-x-2 border-t-2 transition-all duration-150 transform hover:-translate-y-2 hover:shadow-xl active:translate-y-1 active:border-b-2 text-3xl font-extrabold
        ${
          selected
            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-inner"
            : "bg-white border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700"
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
  className = "",
}: QuestionCardProps) => {
  return (
    <div
      className={`p-8 md:p-12 bg-white/90 backdrop-blur-md flex flex-col gap-10 justify-center items-center shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] w-full max-w-4xl mx-auto ${className}`}
    >
      {imageUrl && (
        <div className="p-4 bg-indigo-50 rounded-3xl shadow-sm border border-indigo-100">
          <img
            src={imageUrl}
            alt="Soal"
            className="object-contain w-40 h-40 md:w-56 md:h-56"
          />
        </div>
      )}
      
      <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 text-center leading-tight">
        {question}
      </h2>

      <div className="grid grid-cols-2 md:flex md:flex-row gap-6 w-full justify-center">
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
