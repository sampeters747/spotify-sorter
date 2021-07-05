import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { UserContextContainer } from './components/UserContextContainer';

// ========================================
const song1 = {
  title: "Blood on the Leaves",
  artist: "Kanye West",
};
const song2 = {
  title: "We are the Champions",
  artist: "Kanye West",
};
const song3 = {
  title: "Sundress",
  artist: "A$AP Rocky",
};
const songs = [song1, song2, song3];
const dummy_playlist = {
  name: "First playlist",
  songs: songs,
  songCount: 3,
  acousticness: 0.8,
  valence: 0.7,
  tempo: 150,
  danceability: 0.2,
}
ReactDOM.render(
  <UserContextContainer/>,
  document.getElementById('root')
);


