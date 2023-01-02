import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { MutationFunction } from '@tanstack/query-core';
import UIContext from '../context/UIContext';

export const useCreateMutation = (
  mutationFn: MutationFunction<any, any>,
  invalidateQueries: QueryKey,
  updater: (old: any, payload: any) => any,
  callback?: () => void,
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
    onError: (err: Error, variables, previousValue) => {
      queryClient.setQueryData(invalidateQueries, previousValue);
      console.error(err);
      setError(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(invalidateQueries);
    },
  });
};
