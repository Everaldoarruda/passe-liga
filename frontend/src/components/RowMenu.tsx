import { Ellipsis, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
}

interface RowMenuProps {
  label: string;
  items: MenuItem[];
}

// Altura aproximada do menu com 3 opções, para ele não sair pela parte de baixo da janela
const MENU_HEIGHT = 120;

function RowMenu({ label, items }: RowMenuProps) {
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const open = position !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setPosition(null);
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    // O "true" também pega a rolagem da própria tabela, não só a da página
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // Menu fixo na janela, porque o overflow da tabela cortaria um menu comum
  const toggle = () => {
    if (open || !wrapperRef.current) return setPosition(null);
    const rect = wrapperRef.current.getBoundingClientRect();
    setPosition({
      top: Math.min(rect.bottom + 4, window.innerHeight - MENU_HEIGHT),
      right: window.innerWidth - rect.right,
    });
  };

  return (
    <div ref={wrapperRef} className="inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={toggle}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      >
        <Ellipsis size={16} aria-hidden="true" />
      </button>
      {position && (
        <div
          style={{ top: position.top, right: position.right }}
          className="fixed z-40 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {items.map(({ label: itemLabel, icon: Icon, onSelect, danger }) => (
            <button
              key={itemLabel}
              type="button"
              onClick={() => {
                setPosition(null);
                onSelect();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${danger ? 'text-red-600' : 'text-gray-700'}`}
            >
              <Icon size={14} aria-hidden="true" />
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RowMenu;
