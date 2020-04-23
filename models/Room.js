let slugify = require('slugify');

module.exports = (r, models) => {

    let Online = require('./Online')(r, models);

    const {Room} = models;

    async function getCheckerTimestamp(organization_id) {
        let messages = await models.Message
                                   .filter({
                                               organization_id: organization_id
                                           })
                                   .orderBy(r.desc('created_at'))
                                   .limit(1);

        return messages.length > 0 ? await r.ISO8601(messages[0].created_at.toISOString()).toEpochTime() : 0;
    }

    return {

        getCheckerTimestamp,

        // getUserPosts: function(userId) {
        //     // const user  = await User.get(userId)
        //     // const posts = user.getJoin({ posts: true })
        //     return posts
        // },
        //
        create: async function (params) {

            let rooms = await Room.filter({
                                              organization_id: params.organization_id,
                                              type           : params.type,
                                              type_id        : params.type_id
                                          }).run();

            if (rooms.length > 0) {
                return rooms[0];
            }

            const room = new Room({
                                      name           : params.name,
                                      slug           : slugify(params.name, {
                                          replacement: '-',
                                          remove     : null,
                                          lower      : true
                                      }),
                                      organization_id: params.organization_id,
                                      type           : slugify(params.type, {
                                          replacement: '-',
                                          remove     : null,
                                          lower      : true
                                      }),
                                      type_id        : params.type_id

                                  });

            return room.saveAll();

        },

        getByRoomId: async function (id) {
            let rooms = await Room.filter({id: id}).getJoin();

            return rooms.length > 0 ? rooms[0] : null;


            // get(id).getJoin();//.getJoin({onlineUsers: true});
        },

        getRoomOnlyById: async function (id) {
            let rooms = await Room.filter({id: id});

            return rooms.length > 0 ? rooms[0] : null;
        },

        addOnlineUser   : async function (roomId, dd_user_id, organization_id) {
            let room = await this.getByRoomId(roomId);

            if (!room) return null;

            // console.log(roomId, dd_user_id);
            let users = await models.ChatUser.filter({
                                                         id: dd_user_id.toString(),
                                                         // organization_id: organization_id
                                                     }).run();


            let user = users.length > 0 ? users[0] : null;

            if (!user) return null;

            room.addRelation('onlineUsers', user);// = [user];

            await room.saveAll({onlineUsers: true});

            return room;
        },
        removeOnlineUser: async function (roomId, userId) {
            let room = await this.getByRoomId(roomId);

            if (!room) return null;

            let users = await models.ChatUser.filter({
                                                         id: userId
                                                     }).run();

            let user = users.length > 0 ? users[0] : null;

            if (!user) return null;

            await room.removeRelation('onlineUsers', {id: user.id});

            await room.saveAll({onlineUsers: true});

            return room;
        },

        removeAllOnlineUsers: async function () {
            return await r.table('ChatUser_Room_onlineUsers').delete().run();
        },

        sendNotificationToOffline: async (msg) => {

            let rooms = await Room
                .filter(
                    {
                        id: msg.roomId
                    })
                .getJoin({onlineUsers: true, chatUsers: true});

            if (rooms.length == 0) return false;

            let room         = rooms[0];
            let offlineUsers = room.chatUsers.filter(function (chatUser) {
                return room.onlineUsers.filter(function (onlineUser) {
                    return onlineUser.id == chatUser.id;
                }).length == 0
            });

            /**
             * @TODO send push notifications
             */

            // let miPrimeraPromise = new Promise((resolve, reject) => {
            //     setTimeout(function(){
            //         resolve("¡Éxito!"); // ¡Todo salió bien!
            //     }, 5000);
            // });
            //
            // miPrimeraPromise.then((successMessage) => {
            //     // succesMessage es lo que sea que pasamos en la función resolve(...) de arriba.
            //     // No tiene por qué ser un string, pero si solo es un mensaje de éxito, probablemente lo sea.
            //     console.log(offlineUsers);
            //     console.log("¡Sí! " + successMessage);
            // });
        },

        notifyUsersInRoom: async function (socket, msg) {
            let rooms = await Room
                .filter(
                    {
                        id: msg.room_id
                    })
                .getJoin({onlineUsers: false, chatUsers: true});

            if (rooms.length == 0) return false;

            let room  = rooms[0];
            let users = room.chatUsers;

            users.forEach(async (user) => {
                let usrSocket = await Online.userSocket(user.id);

                if (usrSocket && usrSocket.user_id != msg.from_id) {
                    console.log('Sending to: ' + usrSocket.user_id);
                    socket.in(usrSocket.socket_id).emit('NEW_MESSAGE_NTF', msg);
                }

            });
        },

        getRoomInfo: async (roomId) => {
            let rooms = await Room
                .filter(
                    {
                        id: roomId
                    })
                .getJoin({onlineUsers: true, chatUsers: true});

            if (rooms.length == 0) return null;

            return rooms[0];
        }
        //
        // getMyPost: async function(params) {
        //     return 'DEMO';
        // }

        //Para paginar cosas seria lo siguiente:
        //r.db('chat001').table('Room').skip(2*2//este 2 es por el limite son iguales).limit(2)

    }
};