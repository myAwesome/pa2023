import { useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SET_ERROR } from '../redux/rootReducer';

export const useDeleteMutation = (
  mutationFn,
  invalidateQueries,
  id,
  callback = () => {},
  additionalRefetchQuery,
  updater,
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
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
      dispatch({ type: SET_ERROR, payload: err.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries(invalidateQueries);
      if (additionalRefetchQuery) {
        queryClient.invalidateQueries(additionalRefetchQuery);
      }
    },
  });
};
