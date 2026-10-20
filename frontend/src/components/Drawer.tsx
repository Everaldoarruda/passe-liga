import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  label: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

function Drawer({ label, onClose, footer, children }: DrawerProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-gray-200 p-4">{footer}</div>}
      </aside>
    </div>
  );
}

export default Drawer;
