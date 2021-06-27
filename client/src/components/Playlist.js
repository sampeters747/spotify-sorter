import { Box, TableCell, TableBody, TableHead, TableRow, Table, Collapse, Paper } from "@material-ui/core";
import React from "react";
import Song from "./Song.js"
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import IconButton from '@material-ui/core/IconButton';
import Valuebar from "./Valuebar.js"

export default class Playlist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        }
        this.setOpen = this.setOpen.bind(this)
    }

    setOpen() {
        this.setState({ open: !this.state.open });
    }

    render() {
        const songs = this.props.songs;
        const songListItems = songs.map((song) =>
            <Song {...song} />
        );
        return (
            <React.Fragment>
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell>{this.props.name} ({this.props.songCount}&nbsp;songs)</TableCell>
                    <TableCell align="right">
                        <Valuebar value={this.props.tempo} maxValue={200} title="Beats Per Minute" />
                    </TableCell>
                    <TableCell align="right" colSpan={1}>
                        <Valuebar value={this.props.acousticness} title="Acousticness" />
                    </TableCell>
                    <TableCell align="right" colSpan={1}>
                        <Valuebar value={this.props.valence} title="Valence" />
                    </TableCell>
                    <TableCell align="right">
                        <Valuebar value={this.props.danceability} title="Danceability" />
                    </TableCell>
                    <TableCell>
                        <IconButton aria-label="expand row" size="small" onClick={this.setOpen}>
                            {this.state.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 , width: 100}} colSpan={6}>
                        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                            <Box component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>Title</TableCell>
                                            <TableCell align="right">Artist</TableCell>
                                            
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {songListItems}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    }
}