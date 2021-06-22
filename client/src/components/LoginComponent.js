import React, { Component } from "react";
export const authEndpoint = 'https://accounts.spotify.com/authorize';
// http://localhost:3000/?code=AQB2PiAy_hk1vatSovHBKocaeNdfbtF9l0KYn9yJUsmzAxbtXGmI5v_1zzcRgPb1IY0WQE5Hf63wt4KCactb07dPlAT3NWv1Tna8KYsEIzcB3Vdkhg83q-EfSU3-1ib8uA-gDi19g9zfEjZARyuY3DMBuT9ZLJv0Q6_UeZ1KQ-6LnxDzrIT9XKwEDfsGxWNoVA7r6Xdhd-64kt78Oa4X7V-zf145xzv1ziGsokN_8gQ
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = "http://localhost:3000";
const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state",
];
const authHref = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&show_dialog=true`;

class LoginButton extends Component {
  render () {
    return (
    <a 
    href={authHref}
    >
      Login to Spotify
    </a>
    )
  }
}