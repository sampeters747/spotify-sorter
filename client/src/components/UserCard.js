import { userContext } from "./UserContextContainer";
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
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
    let loginLogoutButton;
    if ("display_name" in user) {
        // Adding logout button
        loginLogoutButton = <Button onClick={logout}>Logout</Button>;
        
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
        userAvatar = null;
        loginLogoutButton = <LoginButton/>;
    }
        return (
            <Paper>
                <Grid container direction="row" justify="flex-end" alignItems="center">
                    {userAvatar}
                    {loginLogoutButton}
                </Grid>
            </Paper>
        )
}