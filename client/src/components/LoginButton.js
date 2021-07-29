import { Button } from "@material-ui/core";
import React, { Component } from "react";
export const authEndpoint = 'https://accounts.spotify.com/authorize';
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI;
const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-library-read"
];
const authHref = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&show_dialog=true`;

export default class LoginButton extends Component {
  render () {
    return (
    <Button href={authHref} color="inherit">
      Login to Spotify
    </Button>
    )
  }
}