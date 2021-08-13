import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Grid } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import UserCard from './UserCard';


const useStyles = makeStyles({
    title: {
        flexGrow: 1,
        display: "inline-block"
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