import { useEffect, useRef } from "react";
import { ListItem } from "@mui/material";
import Bubble from "./bubble";
import Triangle from "./triangle";
const MessageBubble = (props) => {
    const userRef = useRef(null);
    useEffect(() => {
        userRef.current.scrollIntoView(true);
    }, []);
    return (
        <div style={{marginLeft:props.alignment}}>
            <ListItem
                ref={userRef}
                style={{width:"100%", textAlign: "left", marginBottom: "2vh" , }}
            >
                <Bubble msg={props.msg} room={props.room}/>
                <Triangle color={props.msg.color} alignTriangle={props.alignTriangle}/>
            </ListItem>
            <p></p>
        </div>
    );
};
export default MessageBubble;