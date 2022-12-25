import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import UIContext from '../context/UIContext';

export const useCreateMutation = (
  mutationFn,
  invalidateQueries,
  updater,
  callback,
) => {
  const queryClient = useQueryClient();
  const { setError } = useContext(UIContext);
  return useMutation(mutationFn, {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(invalidateQueries);

      const previousValue = queryClient.getQueryData(invalidateQueries);

      queryClient.setQueryData(invalidateQueries, (old) =>
        updater(old, payload),
      );
      callback?.();

      return previousValue;
    },
    onError: (err, variables, previousValue) => {
      queryClient.setQueryData(invalidateQueries, previousValue);
      console.error(err);
      setError(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(invalidateQueries);
    },
  });
};
