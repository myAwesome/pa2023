import React from 'react';
import { Button, Collapse, Grid, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SyncIcon from '@mui/icons-material/Sync';
import { useQuery } from '@tanstack/react-query';
import EditableTable from '../../../shared/components/EditableTable';
import {
  deletePeriod,
  geocodeLocation,
  getPeriods,
  postPeriod,
  putPeriod,
} from '../../../shared/api/routes';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { PeriodType } from '../../../shared/types';
import { dateToMySQLFormat } from '../../../shared/utils/mappers';

const getFirstWord = (value: string) => {
  const [firstWord] = value.trim().split(/\s+/);
  return firstWord || value.trim();
};

const PeriodSettings = () => {
  const [isAdd, setIsAdd] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPopulating, setIsPopulating] = React.useState(false);
  const periodsData = useQuery({
    queryKey: ['periods'],
    queryFn: getPeriods,
    initialData: [],
  });
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
      is_location: !!values.is_location,
      location_details: values.location_details || null,
    };
    createMutation.mutate(data);
  };

  const handlePopulateLocationDetails = async () => {
    const periods = (periodsData.data || []) as PeriodType[];
    const targets = periods.filter(
      (period) => period.is_location && !period.location_details,
    );
    if (!targets.length) {
      return;
    }
    setIsPopulating(true);
    try {
      for (const period of targets) {
        const geocodeQuery = getFirstWord(period.name);
        const geocode = await geocodeLocation(geocodeQuery);
        if (geocode?.latitude == null || geocode?.longitude == null) {
          continue;
        }
        await putPeriod(period.id, {
          name: period.name,
          start: dateToMySQLFormat(period.start),
          end: period.end ? dateToMySQLFormat(period.end) : null,
          is_location: !!period.is_location,
          location_details: `${Number(geocode.latitude).toFixed(5)},${Number(
            geocode.longitude,
          ).toFixed(5)}`,
        });
      }
    } finally {
      setIsPopulating(false);
      periodsData.refetch();
    }
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
              {
                name: 'is_location',
                label: 'Location period',
                type: 'boolean',
                render: (row) => (row.is_location ? 'Yes' : 'No'),
              },
              {
                name: 'location_details',
                label: 'Lat,Lon',
                type: 'string',
                render: (row) => row.location_details || '',
              },
            ]}
            isAdd={isAdd}
            cancelAdd={() => setIsAdd(false)}
            onAddSubmit={(p) => handlePeriodAdd(p as PeriodType)}
            editMutationFn={({ id, ...data }: PeriodType) => {
              const values = {
                end: data.isendInProgress ? null : dateToMySQLFormat(data.end),
                start: dateToMySQLFormat(data.start),
                name: data.name,
                is_location: !!data.is_location,
                location_details: data.location_details || null,
              };
              return putPeriod(id, values);
            }}
            invalidateQueries={['periods']}
            getNewItemFn={(v: any) => v}
            deleteMutationFn={deletePeriod}
          />
          <IconButton onClick={() => setIsAdd(true)}>
            <AddIcon />
          </IconButton>
          <IconButton
            onClick={handlePopulateLocationDetails}
            disabled={isPopulating}
            title="Populate lat/lon for location periods"
          >
            <SyncIcon />
          </IconButton>
        </Collapse>
      </Grid>
    </Grid>
  );
};

export default PeriodSettings;
