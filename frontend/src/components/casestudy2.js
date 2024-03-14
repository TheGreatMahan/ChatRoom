import { useReducer, useEffect, useState } from "react";
import io from "socket.io-client";
import { ThemeProvider } from "@mui/material/styles";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
    Button,
    TextField,
    Typography,
    AppBar,
    Toolbar,
    Card,
    CardContent,
    RadioGroup,
    Radio,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import theme from "../theme";

// import ChatMsg from "./chatmsg";
import Logo from "./Logo.png";
import MessageList from "./messagebubble";
import TopBar from "./topbar";

const CaseStudy2 = () => {
    const initialState = {
        messages: [],
        status: "Please Enter Chat Name",
        roomStatus: "Please Enter Room Name",
        showjoinfields: true,
        alreadyexists: false,
        chatName: "",
        roomName: "",
        users: [],
        typingMsg: "",
        isTyping: false,
        message: "",
        listOfRooms: [],
        onlineUsers: []
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    const [open, setOpen] = useState(false);
    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => setOpen(false);

    useEffect(() => {
        serverConnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const serverConnect = () => {
        // connect to server
        const socket = io.connect("localhost:5000", {
            forceNew: true,
            transports: ["websocket"],
            autoConnect: true,
            reconnection: false,
            timeout: 5000,
        });

        // const socket = io.connect();

        socket.emit("tabopened");

        socket.on("nameexists", onExists);
        socket.on("welcome", addMessage);
        socket.on("someonejoined", addMessage);
        socket.on("someoneleft", addMessage);
        socket.on("someoneistyping", onTyping);
        socket.on("newmessage", onNewMessage);
        socket.on("getrooms", getAllRooms);
        socket.on("sendroomsandusers",getRoomsAndUsers);
        setState({ socket: socket });
    };
    const onExists = (dataFromServer) => {
        setState({ status: dataFromServer.text });
    };
    // generic handler for all other messages:
    const addMessage = (dataFromServer) => {
        let messages = state.messages;
        messages.push(dataFromServer);
        setState({
            messages: messages,
            users: dataFromServer.users,
            showjoinfields: false,
            alreadyexists: false,
        });
    };

    // handler for join button click
    const handleJoin = () => {
        state.socket.emit("join", {
            name: state.chatName,
            room: state.roomName,
        });
    };
    // handler for name TextField entry
    const onNameChange = (e) => {
        setState({ chatName: e.target.value, status: "" });
        if (e.target.value === "") {
            setState({ status: "Please Enter Chat Name" });
        }
    };
    // handler for room TextField entry
    const onRoomChange = (e) => {
        setState({ roomName: e.target.value, roomStatus: "" });
        if (e.target.value === "") {
            setState({ roomStatus: "Please Enter Room Name" });
        }
    };

    const onTyping = (dataFromServer) => {
        if (dataFromServer.from !== state.chatName) {
            setState({
                typingMsg: dataFromServer.text,
            });
        }
    };

    // keypress handler for message TextField
    const onMessageChange = (e) => {
        setState({ message: e.target.value });
        if (state.isTyping === false) {
            state.socket.emit(
                "typing",
                { from: state.chatName, room: state.roomName },
                (err) => {}
            );
            setState({ isTyping: true }); // flag first byte only
        }
    };

    const onNewMessage = (dataFromServer) => {
        addMessage(dataFromServer);
        setState({ typingMsg: "" });
    };

    // enter key handler to send message
    const handleSendMessage = (e) => {
        if (state.message !== "") {
            state.socket.emit(
                "message",
                { from: state.chatName, text: state.message },
                (err) => {}
            );
            setState({ isTyping: false, message: "" });
        }
    };

    const handleRadioButtonChange = (event) => {
        setState({
            roomName: event.target.value,
            roomStatus: "",
        });
    };

    const getRoomsAndUsers = (dataFromServer)=>{
        setState({
            // listOfRooms:dataFromServer.rooms,
            onlineUsers: dataFromServer.users,
        })
        console.log(dataFromServer.users);
    };

    const getAllRooms = (dataFromServer) => {
        setState({
            listOfRooms: dataFromServer.rooms,
        });


    };
    return (
        <ThemeProvider theme={theme}>
            <AppBar position="static">
                <Toolbar>
                    {state.showjoinfields && (
                        <Typography variant="h6" color="inherit">
                            Chat It Up!
                        </Typography>
                    )}
                    {!state.showjoinfields && (
                        <div>
                            <TopBar viewDialog={handleOpenDialog} />
                            <Dialog
                                open={open}
                                onClose={handleCloseDialog}
                                style={{ margin: 10, }}
                            >
                                <DialogTitle color="primary" style={{ textAlign: "center", color:"primary" }}>
                                    Who's Online?
                                </DialogTitle>
                                <DialogContent>
                                    {state.onlineUsers.map(user=>(
                                        <div className="displayInRow" key={user.name}>
                                        <AccountCircleIcon style={{color: `${user.color}`,marginLeft:-15,marginRight:15}}/>
                                        <Typography  style={{color:`${user.color}`, fontWeight:"bold"}}>{user.name} is in room {user.room}</Typography>
                                        <p></p>
                                        </div>
                                        
                                    ))}
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </Toolbar>
            </AppBar>
            {state.showjoinfields && (
                <div
                    style={{
                        padding: "3vw",
                        margin: "3vw",
                        textAlign: "center",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <img
                            src={Logo}
                            alt="Logo"
                            style={{
                                marginTop: 20,
                                width: "30%",
                            }}
                        />
                        <Typography
                            color="primary"
                            style={{ textAlign: "center" }}
                        >
                            Sign In
                        </Typography>
                    </div>
                    <Card>
                        <CardContent>
                            <TextField
                                style={{ width: "100%" }}
                                onChange={onNameChange}
                                placeholder="Chat name"
                                autoFocus={true}
                                required
                                value={state.chatName}
                                error={state.status !== ""}
                                helperText={state.status}
                            />
                        </CardContent>
                    </Card>
                    <p></p>
                    <Card>
                        <CardContent>
                            <Typography
                                color="primary"
                                style={{ marginBottom: 20 }}
                            >
                                Join Existing or Enter Room Name
                            </Typography>

                            <RadioGroup
                                style={{ justifyContent: "center" }}
                                value={state.radioButton}
                                onChange={handleRadioButtonChange}
                            >
                                {state.listOfRooms.map((room) => (
                                    <FormControlLabel
                                        key={room}
                                        value={room}
                                        control={<Radio />}
                                        label={room}
                                    />
                                ))}
                            </RadioGroup>
                            <TextField
                                style={{ width: "100%" }}
                                onChange={onRoomChange}
                                placeholder="Room name"
                                required
                                value={state.roomName}
                                error={state.roomStatus !== ""}
                                helperText={state.roomStatus}
                            />
                        </CardContent>
                    </Card>
                    <p></p>
                    <Button
                        variant="contained"
                        data-testid="submit"
                        color="primary"
                        style={{ marginLeft: "3%" }}
                        onClick={() => handleJoin()}
                        disabled={
                            state.chatName === "" || state.roomName === ""
                        }
                    >
                        Join
                    </Button>
                </div>
            )}

            {!state.showjoinfields && (
                <div>
                    <div className="scenario-container">
                        {state.messages.map((message, index) => (
                            <MessageList
                                msg={message}
                                room={state.roomName}
                                key={index}
                                alignTriangle={
                                    message.from === state.chatName
                                        ? "59%"
                                        : "7%"
                                }
                                alignment={
                                    message.from === state.chatName
                                        ? "41%"
                                        : "5%"
                                }
                            />
                        ))}
                    </div>
                </div>
            )}
            {!state.showjoinfields && (
                <div style={{ position: "fixed", bottom: 10, width: "98%" }}>
                    <div>
                        <Typography color="primary">
                            {state.typingMsg}
                        </Typography>
                    </div>
                    <TextField
                        style={{
                            width: "98%",
                            marginBottom: 10,
                        }}
                        onChange={onMessageChange}
                        placeholder="type something here"
                        autoFocus={true}
                        value={state.message}
                        onKeyPress={(e) =>
                            e.key === "Enter" ? handleSendMessage() : null
                        }
                    />
                </div>
            )}
        </ThemeProvider>
    );
};

export default CaseStudy2;
