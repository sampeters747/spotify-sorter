import React from "react";
import LoginButton from "./LoginComponent";
class App extends React.Component {
    render() {
        let params = new URLSearchParams(window.location.search.substring(1));
        let code = params.get("code");
        if (code) {
            return <p><LoginButton></LoginButton><br></br>{code}</p>
        
        } else {
            return <p><LoginButton></LoginButton></p>
        }
    }
}

export default App