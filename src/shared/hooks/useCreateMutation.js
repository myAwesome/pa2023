import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SET_ERROR } from '../redux/rootReducer';
import { useDispatch } from 'react-redux';

export const useCreateMutation = (mutationFn, invalidateQueries, updater, callback) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation(mutationFn, {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(invalidateQueries);

      const previousValue = queryClient.getQueryData(invalidateQueries);

      queryClient.setQueryData(invalidateQueries, (old) => updater(old, payload));
      callback?.();

      return previousValue;
    },
    onError: (err, variables, previousValue) => {
      queryClient.setQueryData(invalidateQueries, previousValue);
      console.error(err);
      dispatch({ type: SET_ERROR, payload: err.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries(invalidateQueries);
    },
  });
};
