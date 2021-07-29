import { userContext } from "./App";
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useContext } from "react";
import LoginButton from "./LoginButton";


const useStyles = makeStyles({
    blueAvatar: {
      display: 'inline-flex'
    },
  });


export default function UserCard(props) {
    const classes = useStyles();
    const {user, logout} = useContext(userContext);
    let userAvatar;
    let userText;
    let loginLogoutButton;
    if ("display_name" in user) {
        userText = <Typography variant="button">{user.display_name}</Typography>
        // Adding logout button
        loginLogoutButton = <Button onClick={logout} color="inherit">Logout</Button>;
        // Creating user avatar circle
        if (user.images?.length > 0) {
            const avatarImage = user.images[0].url;
            // If they have a profile pic we use that
            userAvatar = <Avatar alt={user.display_name} src={avatarImage}></Avatar>;
        } else {
            const first = user.display_name.charAt(0);
            // If not we use the first character of their display name for the avatar
            userAvatar = <Avatar alt={user.display_name}>{first}</Avatar>;
        }
    } else {
        userText = null;
        userAvatar = null;
        loginLogoutButton = <LoginButton/>;
    }
        return (
                <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
                    <Grid item spacing={1}>{userAvatar}</Grid>
                    <Grid item>{userText}</Grid>
                    <Grid item>{loginLogoutButton}</Grid>
                </Grid>
        )
}