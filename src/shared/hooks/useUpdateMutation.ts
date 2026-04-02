import {
  MutationFunction,
  QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useContext } from 'react';
import UIContext from '../context/UIContext';
import { getApiErrorMessage } from '../api/error';

export const useUpdateMutation = (
  mutationFn: MutationFunction<any, any>,
  invalidateQueries: QueryKey,
  id?: number | string | null,
  getNewItem?: (payload: any, item: any) => any,
  callback?: () => void,
  additionalRefetchQuery?: QueryKey,
  updater?: (old: any, payload: any) => any,
) => {
  const queryClient = useQueryClient();
  const { setError } = useContext(UIContext);

  return useMutation<any, any, any>({
    mutationFn,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: invalidateQueries });

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
        return updater?.(old, payload);
      });
      callback?.();

      return previousValue;
    },
    onError: (err, variables, previousValue) => {
      queryClient.setQueryData(invalidateQueries, previousValue);
      setError(getApiErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: invalidateQueries });
      if (additionalRefetchQuery) {
        queryClient.invalidateQueries({ queryKey: additionalRefetchQuery });
      }
    },
  });
};
