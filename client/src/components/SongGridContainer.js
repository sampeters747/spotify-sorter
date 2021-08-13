import React, { Component } from 'react'
import { getUserLibrary } from '../services/requests';
import SongGrid from './SongGrid';

export default class SongGridContainer extends Component {
    constructor() {
        super()
        this.state = {
             tracks: [],
             loading: true,
             selected: []
        };
        this.loadUserLibrary = this.loadUserLibrary.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }
    setSelected(newSelections) {
        this.setState({ selected: newSelections});
    }

    async loadUserLibrary(delay=300) {
        const [data, error] = await getUserLibrary();
        console.log("loading", delay)
        if (error || data.songs.length === 0) {
            console.log("Failed loading library, retrying")
            setTimeout(() => {this.loadUserLibrary(delay*2)}, delay);
        } else {
            this.setState({
                tracks: data.songs,
                loading: false
            });
        }

    }
    componentDidMount() {
        this.loadUserLibrary();
    }

    render() {
        if (this.state.loading) {
            return (
                <div>
                    <p>loading {this.state.tracks.length}</p>
                </div>
            )
        } else {
            return (
                <SongGrid setSelection={this.setSelected} tracks={this.state.tracks}/>
            )
        }
    }
}
