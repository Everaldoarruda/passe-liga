import { toast } from 'sonner';

export const notifySuccess = (message: string) => toast.success(message);

export const notifyError = (error: unknown) =>
  toast.error(error instanceof Error ? error.message : 'Erro inesperado.');
