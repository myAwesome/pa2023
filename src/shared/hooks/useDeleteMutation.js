import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import UIContext from '../context/UIContext';

export const useDeleteMutation = (
  mutationFn,
  invalidateQueries,
  id,
  callback = () => {},
  additionalRefetchQuery,
  updater,
) => {
  const queryClient = useQueryClient();
  const { setError } = useContext(UIContext);

  return useMutation(mutationFn, {
    onMutate: async (payloadId) => {
      await queryClient.cancelQueries(invalidateQueries);

      const previousValue = queryClient.getQueryData(invalidateQueries);

      queryClient.setQueryData(invalidateQueries, (old) => {
        if (Array.isArray(old)) {
          return old.filter((o) => o.id !== (id || payloadId));
        }
        return updater(old, payloadId);
      });
      callback();

      return previousValue;
    },
    onError: (err, variables, previousValue) => {
      queryClient.setQueryData(invalidateQueries, previousValue);
      setError(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(invalidateQueries);
      if (additionalRefetchQuery) {
        queryClient.invalidateQueries(additionalRefetchQuery);
      }
    },
  });
};
