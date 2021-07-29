import React from 'react';
import { getMe } from "../services/requests";
import Main from './Main';
import CssBaseline from '@material-ui/core/CssBaseline';


const userContext = React.createContext({user: {}})

class App extends React.Component {
    constructor() {
        super()

        this.state = {
             user: {},
             userLoadFinished: false
        };
        this.loadUserInfo = this.loadUserInfo.bind(this);
        this.logout = this.logout.bind(this);
    }

    logout() {
        this.setState({ user: {} });
    }

    async loadUserInfo() {
        try {
            const identity = await getMe();
            this.setState({ user: identity });
            console.log("Successfully retrieved user profile");
        } catch (error) {
            console.log(error.message);
        }
    }

    componentDidMount() {
        this.loadUserInfo().finally(() => {
            this.setState({userLoadFinished: true})
        });
    }
    
    render() {
        const userValue = {
            user: this.state.user,
            logout: this.logout
        };
        if (this.state.userLoadFinished) {
            return (
                <userContext.Provider value={userValue}>
                    <CssBaseline />
                    <Main/>
                </userContext.Provider>
            )
        } else {
            return <div></div>
        }
    }
}


export { userContext, App }