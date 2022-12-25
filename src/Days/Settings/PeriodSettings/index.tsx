import React from 'react';
import moment from 'moment';
import { Grid, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import EditableTable from '../../../shared/components/EditableTable';
import {
  deletePeriod,
  getPeriods,
  postPeriod,
  putPeriod,
} from '../../../shared/api/routes';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { PeriodType } from '../../../shared/types';

const PeriodSettings = () => {
  const [isAdd, setIsAdd] = React.useState(false);
  const periodsData = useQuery(['periods'], getPeriods, { initialData: [] });
  const createMutation = useCreateMutation(
    (vals: PeriodType) => postPeriod(vals),
    ['periods'],
    (old: PeriodType[], val: PeriodType) => [...old, val],
    () => setIsAdd(false),
  );

  const handlePeriodAdd = (values: PeriodType) => {
    const data = {
      End: values.isendInProgress ? null : moment.utc(values.end).format(),
      Start: moment.utc(values.start).format(),
      Name: values.name,
    };
    // @ts-ignore
    createMutation.mutate(data);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">My periods: </Typography>
        <EditableTable
          items={periodsData.data}
          columns={[
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'start', label: 'Start date', type: 'date' },
            { name: 'end', label: 'End date', type: 'nullable-date' },
          ]}
          isAdd={isAdd}
          cancelAdd={() => setIsAdd(false)}
          onAddSubmit={handlePeriodAdd}
          editMutationFn={({ id, ...data }) => putPeriod(id, data)}
          invalidateQueries={['periods']}
          getNewItemFn={(v) => v}
          deleteMutationFn={(id) => deletePeriod(id)}
        />
        <IconButton onClick={() => setIsAdd(true)}>
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default PeriodSettings;
