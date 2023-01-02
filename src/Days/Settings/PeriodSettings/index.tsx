import React from 'react';
import { Button, Collapse, Grid, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
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
import { dateToMySQLFormat } from '../../../shared/utils/mappers';

const PeriodSettings = () => {
  const [isAdd, setIsAdd] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const periodsData = useQuery(['periods'], getPeriods, { initialData: [] });
  const createMutation = useCreateMutation(
    (vals: PeriodType) => postPeriod(vals),
    ['periods'],
    (old: PeriodType[], val: PeriodType) => [...old, val],
    () => setIsAdd(false),
  );

  const handlePeriodAdd = (values: PeriodType) => {
    const data = {
      end: values.isendInProgress ? null : dateToMySQLFormat(values.end),
      start: dateToMySQLFormat(values.start),
      name: values.name,
    };
    createMutation.mutate(data);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button
          sx={{ textTransform: 'initial', padding: 0, color: 'inherit' }}
          endIcon={isOpen ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Typography variant="h6">My periods:</Typography>
        </Button>
        <Collapse in={isOpen} collapsedSize={210}>
          <EditableTable
            items={periodsData.data}
            columns={[
              { name: 'name', label: 'Name', type: 'string' },
              {
                name: 'start',
                label: 'Start date',
                type: 'date',
                render: (row) => row.start.slice(0, 10),
              },
              {
                name: 'end',
                label: 'End date',
                type: 'nullable-date',
                render: (row) => (row.end ? row.end.slice(0, 10) : ''),
              },
            ]}
            isAdd={isAdd}
            cancelAdd={() => setIsAdd(false)}
            onAddSubmit={(p) => handlePeriodAdd(p as PeriodType)}
            editMutationFn={({ id, ...data }) => {
              const values = {
                end: data.isendInProgress ? null : dateToMySQLFormat(data.end),
                start: dateToMySQLFormat(data.start),
                name: data.name,
              };
              return putPeriod(id, values);
            }}
            invalidateQueries={['periods']}
            getNewItemFn={(v) => v}
            deleteMutationFn={deletePeriod}
          />
          <IconButton onClick={() => setIsAdd(true)}>
            <AddIcon />
          </IconButton>
        </Collapse>
      </Grid>
    </Grid>
  );
};

export default PeriodSettings;
