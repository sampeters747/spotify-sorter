import React from "react";
import TopAppBar from "./TopAppBar";
import SongData from "./songdata.json"
import Playlist from "./Playlist";
import PlaylistsContainer from "./PlaylistsContainer";


export default class Main extends React.Component {
    render () {
        return (
            <div>
                <TopAppBar></TopAppBar>
                <PlaylistsContainer playlists={[SongData]}></PlaylistsContainer>
            </div>
        )
    }
}
