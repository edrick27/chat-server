const slugify = require('slugify');
const md5     = require('md5');
const uuid    = require('uuid/v5');

module.exports = (r, models) => {

    const {Online} = models;

    return {
        addOnline: async function(user, socket_id){
            let users = await Online.filter({
                                                user_id        : user.id.toString(),
                                                organization_id: user.organization_id.toString()
                                            }).run();
            if (users.length <= 0) {
                let _user = new Online({
                                           user_id        : user.id.toString(),
                                           organization_id: user.organization_id.toString(),
                                           socket_id      : socket_id
                                       });

                _user.online_since = r.now();
                await _user.saveAll();
            } else {
                await this.removeOnline(user);
                await this.addOnline(user, socket_id);
            }
        },

        removeOnline: async function(user) {
            let users = await Online.filter({
                                                user_id        : user.id.toString(),
                                                organization_id: user.organization_id.toString()
                                            }).run();
            if (users.length > 0) {
                await users[0].delete();
            }
        },

        removeOnlineBySocketId: async (socketId) => {
            let users = await Online.filter({
                                                socket_id: socketId
                                            }).run();

            if (users.length > 0) {
                await users[0].delete();
            }
        },

        userSocket: async function(user_id) {
            let users = await Online.filter({
                                                user_id: user_id,
                                            }).run();

            return users.length > 0 ? users[0] : null;
        },

        removeAllOnlineUsers: async () => {
            return await r.table('Online').delete().run();
        },
    }
};