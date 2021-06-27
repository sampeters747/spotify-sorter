import { Button } from '@material-ui/core';
import ReactHowler from 'react-howler';
import React, { Component } from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

class AudioPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            volume: 1, 
            audio: null,
            loaded: false,
            playing: false, 
            audioUrl:null
        };
        this.togglePlay = this.togglePlay.bind(this)
        
    }
    togglePlay() {
        this.state.play = !this.state.play;
    }
    render() {
        return (
            <div>
                <Button><PlayArrowIcon onclick/></Button>
            </div>
        );
    }
}

export default AudioPlayer;