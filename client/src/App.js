import React, { Component, useState } from "react";
import axios from 'axios';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class App extends Component {
  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    let accessCode = params.get('code');
    let errorMsg = params.get('error');

    axios.get(`https://jsonplaceholder.typicode.com/users`)
  }
}
export default App;

function Dashboard() {
  return <h2>Home</h2>;
}

function Preferences() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}
