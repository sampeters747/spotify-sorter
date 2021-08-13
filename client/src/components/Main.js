import React from "react";
import TopAppBar from "./TopAppBar";
import SongData from "./songdata.json"
import SongGridContainer from "./SongGridContainer";
import { Box } from "@material-ui/core";


export default class Main extends React.Component {
    render () {
        return (
            <div>
                <TopAppBar></TopAppBar>
                <Box height="90vh" width="100vw" > <SongGridContainer>
                    </SongGridContainer>
                </Box>
            </div>
        )
    }
}
