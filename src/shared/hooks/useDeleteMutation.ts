import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { MutationFunction } from '@tanstack/query-core';
import UIContext from '../context/UIContext';

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

  return useMutation<any, any, any>(mutationFn, {
    onMutate: async (payloadId) => {
      await queryClient.cancelQueries(invalidateQueries);

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
