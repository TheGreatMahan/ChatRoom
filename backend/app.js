require("dotenv").config();
const socketIO = require("socket.io");
const express = require("express");
const app = express();
const http = require("http");
const port = process.env.PORT || 5000;
let server = http.createServer(app);
let io = socketIO(server);
const socketHandlers = require("./socketHandlers");

io.on("connection", (socket) => {
    socket.on("join", (clientData) => {
        socketHandlers.handleJoin(socket, clientData);
        socketHandlers.handleGetRoomsAndUsers(io);
    });

    socket.on("disconnect", () => {
        socketHandlers.handleDisconnect(socket);
        socketHandlers.handleGetRoomsAndUsers(io);
    });

    socket.on("typing", (clientData) => {
        socketHandlers.handleTyping(socket, clientData);
    });

    socket.on("message", (clientData) => {
        socketHandlers.handleAddedMessage(io, clientData);
    });

    socket.on("tabopened", (clientData) => {
        socketHandlers.handleSomeoneOpenedTab(socket, clientData);
    });
});

// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See
// http://expressjs.com/api#app-settings for more details.
app.enable("trust proxy");
// Add a handler to inspect the req.secure flag (see
// http://expressjs.com/api#req.secure). This allows us
// to know whether the request was via http or https.
app.use((req, res, next) => {
    req.secure
        ? // request was via https, so do no special handling
          next()
        : // request was via http, so redirect to https
          res.redirect("https://" + req.headers.host + req.url);
});

app.use(express.static("public"));
app.get("/*", (request, response) => {
    // needed for refresh
    response.sendFile(path.join(__dirname, "public/index.html"));
});

// will pass 404 to error handler
app.use((req, res, next) => {
    const error = new Error("No such route found");
    error.status = 404;
    next(error);
});
// error handler middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error.message || "Internal Server Error",
        },
    });
});
server.listen(port, () => console.log(`starting on port ${port}`));
