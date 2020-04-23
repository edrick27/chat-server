const socketIo = require("socket.io");

module.exports = (models, server) => {

    const io     = socketIo(server);
    const events = {
        CONNECTION         : 'connection',
        DISCONNECT         : 'disconnect',
        ON_ROOM            : 'room',
        ON_CHAT_MESSAGE    : 'on chat message',
        ON_USER_CONNECTED  : 'ON_USER_CONNECTED',
        ON_EXIT_ROOM       : 'ON_EXIT_ROOM',
        ON_CONNECTED_SIGNAL: 'ON_CONNECTED_SIGNAL'
    };

    function initSocket() {
        io.set('transports', ['websocket']);

        let cleanOnlineUsers = async () => {
            let result = await models.Room.removeAllOnlineUsers();
            await models.Online.removeAllOnlineUsers();

            startListingSockets();

            return result;
        };

        cleanOnlineUsers().then(function (result) {
            console.log(result)
        });
    }

    async function onPostChatMessage(msg) {
        let message = await models.Message.create(msg);

        console.log('### ARRIVE ###');
        models.Room.sendNotificationToOffline(msg);
        console.log('### SENDING ###');

        io.sockets.in(msg.roomId).emit(events.ON_CHAT_MESSAGE, message);
        await models.Room.notifyUsersInRoom(io.sockets, message);
    }

    async function onRoomConnection(socket, room) {
        console.log(room);
        console.log('Room connection request: ' + room.roomId);

        if (socket.room) {
            socket.leave(socket.room.roomId);
            console.log('Room disconnection request:' + socket.room.roomId);
            await models.Room.removeOnlineUser(socket.room.roomId, room.userId);
        }

        socket.room = room;
        let _room   = await models.Room.addOnlineUser(room.roomId, room.userId);
        socket.join(room.roomId);
    }

    async function exitRoom(socket) {
        if (socket.room) {
            socket.leave(socket.room.roomId);
            console.log('Room disconnection request:' + socket.room.roomId);
            await models.Room.removeOnlineUser(socket.room.roomId, socket.room.userId);
            socket.room = null;
        }
    }

    async function onUserConnected(socket, user) {
        await models.Online.addOnline(user, socket.id);
    }

    async function handleConnections(socket) {
        if (!(await models.Organization.checkToken(socket.handshake.query.token))) {
            console.log('Invalid access token disconnecting request: ' + socket.handshake.query.token);
            socket.disconnect();
            return;
        }

        console.log('a user connected', socket.handshake.query.token, socket.id);

        socket.on(events.ON_USER_CONNECTED, async (user) => {
            await onUserConnected(socket, user);
            socket.online_attends++;
        });

        socket.on(events.ON_ROOM, async = (room) => {
            onRoomConnection(socket, room)
        });

        socket.on(events.ON_EXIT_ROOM, async = (data) => {
            console.log('EXIT ROOM');
            exitRoom(socket);
        });

        socket.on(events.DISCONNECT, async function (status) {
            models.Online.removeOnlineBySocketId(socket.id);
            if (typeof socket.room !== 'undefined')
                await models.Room.removeOnlineUser(socket.room.roomId, socket.room.userId);
            console.log('user disconnected');
        });

        socket.on(events.ON_CHAT_MESSAGE, onPostChatMessage);
        socket.on(events.DISCONNECT, () => {
            forceDisconnect(socket);
        });
    }

    function startListingSockets() {
        io.on(events.CONNECTION, handleConnections);
    }

    async function forceDisconnect(socket) {

        if (socket.room) {
            socket.leave(socket.room.roomId);
            console.log('Room disconnection request:' + socket.room.roomId);
            await models.Room.removeOnlineUser(socket.room.roomId, socket.room.userId);
        }

        socket.disconnect();
    }


    return {
        initSocket
    }
};