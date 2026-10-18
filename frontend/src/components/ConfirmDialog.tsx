import type { ReactNode } from 'react';
import Button from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
  title: string;
  open: boolean;
  confirmLabel: string;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}

function ConfirmDialog({
  title,
  open,
  confirmLabel,
  submitting,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <div className="text-sm text-gray-700">{children}</div>
      <div className="mt-5 flex justify-end gap-2">
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button variant="danger" loading={submitting} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
