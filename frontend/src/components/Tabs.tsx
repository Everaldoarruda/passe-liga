interface TabOption {
  value: string;
  label: string;
}

interface TabsProps {
  label: string;
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
}

function Tabs({ label, options, value, onChange }: TabsProps) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-md bg-gray-100 p-0.5">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`rounded px-3 py-1 text-sm ${
              selected ? 'bg-white font-medium text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
