type ToggleButtonProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function ToggleButton({
  label,
  checked,
  onChange,
  disabled = false,
}: ToggleButtonProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label className="inline-flex items-center justify-between w-full cursor-pointer">
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`
            relative w-11 h-6 rounded-full transition-colors
            ${disabled
              ? 'bg-gray-200 cursor-not-allowed'
              : 'bg-gray-200 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600 cursor-pointer'}
            dark:bg-gray-700
          `}
        >
          <div
            className={`
              absolute top-[2px] start-[2px] bg-white border border-gray-300 rounded-full
              w-5 h-5 transition-transform duration-200 ease-in-out
              ${checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}
              ${disabled ? 'opacity-50' : ''}
            `}
          />
        </div>
      </div>
    </label>
  );
}
