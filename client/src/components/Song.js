import { TableCell, TableRow } from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import React from "react";

export default class Song extends React.Component {
    render() {
        return (
            <TableRow>
                <TableCell component="th" scope="row"> <PlayArrowIcon /> <PlaylistAddIcon/></TableCell>
                <TableCell >{this.props.title}</TableCell>
                <TableCell align="right">{this.props.artist}</TableCell>
                
            </TableRow>
        );
    }
}