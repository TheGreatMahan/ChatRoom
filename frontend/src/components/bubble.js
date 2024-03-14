import "../App.css";
const Bubble = (props) => {
    return (
        <div
            className="userBubble"
            style={{ backgroundColor: props.msg.color }}
        >
            <div className="displayInRow">
                <div>{props.msg.from} says:</div>
                <div style={{ position:"absolute", right:0 }}>
                    <div>room: {props.room}</div>
                    <div>@: {props.msg.time}</div>
                </div>
            </div>
            <br/>
            <div style={{ fontWeight: "bold" }}>{props.msg.text}</div>
        </div>
    );
};
export default Bubble;
