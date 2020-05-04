let slugify = require('slugify');

module.exports = (r, models) => {

    const {Message}  = models;
    const TYPE_TEXT  = 'MESSAGE_TYPE_TEXT';
    const TYPE_AUDIO = 'MESSAGE_TYPE_AUDIO';
    const TYPE_MEDIA = 'MESSAGE_TYPE_MEDIA';

    return {
        /**
         * Creates a new message.
         *
         * @TODO: find the user by organization_id too.
         *
         * @param {object} params
         * @returns {Promise.<void>}
         */
        create: async function (params) {
            let users = await models.ChatUser.filter({
                                                         id: params.user.userId.toString()
                                                     }).run();
            let rooms = await models.Room.filter({
                                                     id: params.roomId
                                                 }).run();
            console.log(params.user.userId.toString(), users);
            let user    = users[0];
            let room    = rooms[0];
            let message = new Message({
                                          room_id        : params.roomId,
                                          from_id        : user.id,
                                          dd_user_id     : user.dd_user_id,
                                          organization_id: room.organization_id,
                                          text           : params.text,
                                          message_type   : params.message_type,
                                          created_at     : r.now(),
                                          updated_at     : r.now()
                                      });

            message.from = user;
            return message.saveAll();
        },

        /**
         * Return all the messages for specific room paginated.
         *
         * @param {string} room
         * @param {number} page
         * @param {number} page_size
         * @returns {Promise.<*>}
         */
        getRoomMessages: async function (room, page, page_size) {
            if (page < 1) page = 1;

            let skip = page_size * (page - 1);

            return Message.filter({
                                      room_id: room
                                  })
                          .orderBy(r.desc('created_at'))
                          .skip(skip)
                          .limit(page_size).getJoin({from: true});
        },

        /**
         * Check for new meesages.
         *
         * @param timestamp
         * @returns {Promise<{timestamp: *, messages: *}>}
         */
        fetchLatestMessages: async function (timestamp, organization_id) {
            let messages = await Message.filter(r.row('created_at').toEpochTime().gt(parseFloat(timestamp)))
                                        .filter({
                                                    organization_id: organization_id
                                                })
                                        .getJoin({from: true})
                                        .orderBy(r.asc('created_at'))
                                        .limit(100)
                                        .run();
            let total    = messages.length;

            if (total > 0) {
                let lastMessage = messages[total - 1];
                timestamp       = await r.ISO8601(lastMessage.created_at.toISOString()).toEpochTime();
            }

            return {timestamp: timestamp, messages: messages};
        }
    }
};