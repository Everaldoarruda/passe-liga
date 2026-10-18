import { useState } from 'react';
import { notifyError, notifySuccess } from '../lib/notify';

// Envia uma ação para a API: desabilita o botão durante o envio e mostra o sucesso ou o message da API
export function useSubmit() {
  const [submitting, setSubmitting] = useState(false);

  const submit = async <T>(action: () => Promise<T>, successMessage: (result: T) => string) => {
    setSubmitting(true);
    try {
      const result = await action();
      notifySuccess(successMessage(result));
      return true;
    } catch (error) {
      notifyError(error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submit };
}
