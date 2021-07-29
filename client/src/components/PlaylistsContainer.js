import React from "react";

import Playlist from "./Playlist.js"

import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Tab, TableBody, Container } from "@material-ui/core";

export default class PlaylistsContainer extends React.Component {
    render() {
        return (
            <Container>
                <TableContainer component={Paper} className="PlaylistsContainer" style={{ width: "100%" }}>
                    <Table stickyHeader aria-label="collapsible table" style={{ tableLayout: "fixed" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Tempo</TableCell>
                                <TableCell align="right">Acousticness</TableCell>
                                <TableCell align="right">Valence</TableCell>
                                <TableCell align="right">Danceability</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.props.playlists.map((playlist) => (
                                <Playlist {...playlist} /
                                >
                            )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        )
    }
}