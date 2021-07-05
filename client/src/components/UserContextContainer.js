import React from 'react';
import { getAPIToken, getMe } from "../services/requests";
import App from './App';

const userContext = React.createContext({user: {}})

class UserContextContainer extends React.Component {
    constructor() {
        super()

        this.state = {
             user: {}
        };
        this.loadUserInfo = this.loadUserInfo.bind(this);
        this.logout = this.logout.bind(this);
    }

    logout() {
        console.log("logging out");
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

    async componentDidMount() {
        await this.loadUserInfo();
    }
    
    render() {
        const userValue = {
            user: this.state.user,
            logout: this.logout
        };
        return (
            <userContext.Provider value={userValue}>
                <App/>
            </userContext.Provider>
        )
    }
}


export { userContext, UserContextContainer }