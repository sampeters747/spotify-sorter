import React from 'react'
import { DataGrid } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        '&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus': {
            outline: 'none',
        },
        
    }
});

const columns = [
    { field: 'id', hide: true },
    {
      field: 'title',
      headerName: 'Title',
      minWidth: 50,
      flex: 2,
      editable: false,
    },
    {
      field: 'artist_name',
      headerName: 'Artist',
      minWidth: 50,
      flex: 1.8,
      editable: false,
    },
    {
        field: 'acousticness',
        headerName: 'Acousticness',
        flex: 1,
        editable: false,
        type: 'number'
    },
    {
        field: 'danceability',
        headerName: 'Danceability',
        flex: 1,
        editable: false,
        type: 'number'
    },
    {
        field: 'energy',
        headerName: 'Energy',
        flex: 1,
        editable: false,
        type: 'number'
    },
    {
        field: 'instrumentalness',
        headerName: 'Instrumentalness',
        flex: 1,
        editable: false,
        type: 'number'
    },
    {
        field: 'key',
        headerName: 'Key',
        flex: 1,
        editable: false,
        type: 'number'
    },
    {
        field: 'liveness',
        headerName: 'Liveness',
        flex: 1,
        editable: false,
        type: 'number'
    },
    {
        field: 'loudness',
        headerName: 'Loudness',
        flex: 1,
        editable: false,
        type: 'number'
    },
    {
        field: 'speechiness',
        headerName: 'Speechiness',
        flex: 1,
        editable: false,
        type: 'number'
    },
    {
        field: 'tempo',
        headerName: 'Tempo',
        flex: 1,
        editable: false,
        type: 'number'
    },
  ];

export default function SongGrid(props) {
        const classes = useStyles();
        return (
                <DataGrid
                    className={classes.root}
                    scrollbarSize={30}
                    rows={props.tracks}
                    columns={columns}
                    checkboxSelection
                    disableSelectionOnClick
                    onSelectionModelChange={(newSelectionModel) => {
                        console.log(newSelectionModel);
                        props.setSelection(newSelectionModel);
                    }}
                />
        )
    }
