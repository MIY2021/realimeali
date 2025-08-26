
interface CategoryButtonProps {
  option: { value: string; label: string; icon: string };
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryButton({ option, isSelected, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all text-left relative ${
        isSelected
          ? 'border-green-500 bg-green-50 text-green-700'
          : 'border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white/70'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{option.icon}</span>
        <span className="text-sm">{option.label}</span>
      </div>
      {isSelected && (
        <div className="absolute top-1 right-1">
          <div className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            ✓
          </div>
        </div>
      )}
    </button>
  );
}
