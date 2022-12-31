import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import UIContext from '../context/UIContext';

export const useUpdateMutation = (
  mutationFn,
  invalidateQueries,
  id,
  getNewItem,
  callback,
  additionalRefetchQuery,
  updater,
) => {
  const queryClient = useQueryClient();
  const { setError } = useContext(UIContext);

  return useMutation(mutationFn, {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(invalidateQueries);

      const previousValue = queryClient.getQueryData(invalidateQueries);

      queryClient.setQueryData(invalidateQueries, (old) => {
        if (Array.isArray(old)) {
          const thisItemIndex = old.findIndex(
            (o) => o.id === id || o.id === payload.id,
          );
          const newItems = [...old];
          newItems[thisItemIndex] = {
            ...newItems[thisItemIndex],
            ...(getNewItem?.(payload, newItems[thisItemIndex]) || payload),
          };
          return newItems;
        }
        if (!old) {
          return old;
        }
        return updater(old, payload);
      });
      callback?.();

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
