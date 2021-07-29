import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Divider } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import UserCard from './UserCard';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles({
    title: {
        flexGrow: 3,
    },
    blueAvatar: {
        display: 'inline-flex'
    },
  });


export default function TopAppBar(props) {
    const classes = useStyles();
    return (
        <AppBar position="sticky">
            <Toolbar>
                <MenuIcon onClick={props.menuFunction} />
                <Typography variant="h4" class={classes.title}>Playlist Generator</Typography>
                <UserCard/>
            </Toolbar>
        </AppBar>
    )
}