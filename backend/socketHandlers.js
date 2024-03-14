const moment = require("moment");
const port = process.env.PORT || 5000;
let users = [];
let admin;

const handleJoin = (socket, clientData) => {
    if (admin === undefined) {
        admin = {
            name: "Admin",
            color: getRandomColor(),
            time: moment().format("h:mm:ss a"),
        };
    }

    if (
        users.find((element) => element.name === clientData.name) === undefined
    ) {
        socket.emit("nameexists", { text: "" });
        sendWelcomeMessageToNewUser(socket, clientData);
        sendSomeoneJoinedToOthers(socket, clientData);
        socket.join(clientData.room);
        users.push({
            name: clientData.name,
            id: socket.id,
            room: clientData.room,
            socket: socket,
            color: getRandomColor(),
        });
    } else {
        socket.emit("nameexists", {
            text: "name already taken, try a different name",
        });
    }
};

const sendWelcomeMessageToNewUser = (socket, clientData) => {
    socket.emit("welcome", {
        text: `welcome ${clientData.name}`,
        from: admin.name,
        color: admin.color,
        time: moment().format("h:mm:ss a"),
    });
};

const sendSomeoneJoinedToOthers = (socket, clientData) => {
    socket.to(clientData.room).emit("someonejoined", {
        text: `${clientData.name} has joined the ${clientData.room} room!`,
        from: admin.name,
        color: admin.color,
        time: moment().format("h:mm:ss a"),
    });
};

const handleDisconnect = (socket) => {
    let userToRemove = users.find((element) => element.id === socket.id);
    users = users.filter((value, index, array) => {
        return value.id !== socket.id;
    });
    if (users.length !== 0 && userToRemove !== undefined) {
        socket.to(userToRemove.room).emit("someoneleft", {
            text: `${userToRemove.name} has left room ${userToRemove.room}`,
            from: admin.name,
            color: admin.color,
            time: moment().format("h:mm:ss a"),
        });
    }
};

const handleTyping = (socket, clientData) => {
    users.forEach((element) => {
        if (
            element.socket.id !== socket.id &&
            element.room === clientData.room
        ) {
            element.socket.emit("someoneistyping", {
                text: `${clientData.from} is typing...`,
            });
        }
    });
};

const getRandomColor = () => {
    // random colour generator from material design colour file
    const matColours = require("./matdes100colours.json");
    let coloridx = Math.floor(Math.random() * matColours.colours.length) + 1;
    return matColours.colours[coloridx];
};

const handleAddedMessage = (io, clientData) => {
    userSentColor = users.find((element) => element.name === clientData.from);
    io.to(userSentColor.room).emit("newmessage", {
        text: clientData.text,
        from: clientData.from,
        color: userSentColor.color,
        time: moment().format("h:mm:ss a"),
    });
};

const handleGetRoomsAndUsers = (io) => {
    let rooms = [];
    let userswithrooms = [];
    // rooms.push("main");
    users.forEach((user) => {
        if (!rooms.includes(user.room)) rooms.push(user.room);

        userswithrooms.push({name:user.name,room:user.room, color:user.color});//`${user.name} is in room ${user.room}`);
    });

    rooms.map((room) => {
        io.to(room).emit("sendroomsandusers", {
            room: rooms,
            users: userswithrooms
        });
    });
};

const handleSomeoneOpenedTab = (socket, clientData) => {
    let rooms = [];


    rooms.push("main");
    users.forEach((user) => {
        if (!rooms.includes(user.room)) 
            rooms.push(user.room);
    });
    socket.emit("getrooms", { rooms: rooms });


};

const handleGetAllOnlineUsers = (socket, clientData) => {
    socket.emit("sendonlineusers", {
        onlineUsers: users,
    });
};

module.exports = {
    handleJoin,
    handleDisconnect,
    handleTyping,
    handleAddedMessage,
    handleSomeoneOpenedTab,
    // handleGetAllOnlineUsers,
    handleGetRoomsAndUsers,
};
