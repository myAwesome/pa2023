import {
  MutationFunction,
  QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useContext } from 'react';
import UIContext from '../context/UIContext';
import { getApiErrorMessage } from '../api/error';

export const useDeleteMutation = (
  mutationFn: MutationFunction<any, any | undefined>,
  invalidateQueries: QueryKey,
  id?: number | string | null,
  callback?: () => void,
  additionalRefetchQuery?: QueryKey,
  updater?: (old: any, payload: any) => any,
) => {
  const queryClient = useQueryClient();
  const { setError } = useContext(UIContext);

  return useMutation<any, any, any>({
    mutationFn,
    onMutate: async (payloadId) => {
      await queryClient.cancelQueries({ queryKey: invalidateQueries });

      const previousValue = queryClient.getQueryData(invalidateQueries);

      queryClient.setQueryData(invalidateQueries, (old) => {
        if (Array.isArray(old)) {
          return old.filter((o) => o.id !== (id || payloadId));
        }
        return updater?.(old, payloadId);
      });
      callback?.();

      return previousValue;
    },
    onError: (err: Error, variables, previousValue) => {
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
