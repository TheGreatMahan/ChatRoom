import Accessibility from "@mui/icons-material/Accessibility";
import { IconButton, Toolbar, Typography } from "@mui/material";
const TopBar = (props) => {
    const onIconClicked = () => {props.viewDialog()}; // notify the parent
    return (

            <Toolbar color="primary" title="Sample Toolbar">
                <Typography variant="h6" color="inherit">
                    Chat It Up!! - Info3139 
                </Typography>
                <section style={{ height: 50, width: 50, marginLeft: "auto" }}>
                    <IconButton onClick={onIconClicked}>
                        <Accessibility
                            style={{ color: "white", height: 40, width: 40, marginLeft:50 }}
                        />
                    </IconButton>
                </section>
            </Toolbar>

    );
};
export default TopBar;
