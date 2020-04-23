module.exports = config => {
    const thinky = require('thinky')(config);
    const r      = thinky.r;
    const type   = thinky.type;

    // const User = thinky.createModel("User", {
    //   id:        type.string(),
    //   username:  type.string().required(),
    //   email:     type.string().email().required(),
    // })


    const Post = thinky.createModel("Post", {
        id     : type.string(),
        type   : type.string(),
        year   : type.string(),
        content: type.string()
    });

    const Room = thinky.createModel('Room', {
        id             : type.string(),
        name           : type.string().required(),
        slug           : type.string().required(),
        organization_id: type.string().required(),
        type           : type.string().required(),
        type_id        : type.string().required(),
        created_at     : type.date().min(r.now()),
        updated_at     : type.date().min(r.now())

    });

    const ChatUser = thinky.createModel('ChatUser', {
        id             : type.string(),
        name           : type.string(),
        nickname       : type.string(),
        email          : type.string().email(),
        dd_user_id     : type.string(),
        organization_id: type.string().required(),
        created_at     : type.date().min(r.now()),
        updated_at     : type.date().min(r.now())
    });


    const Message = thinky.createModel('Message', {
        id             : type.string(),
        text           : type.string(),
        room_id        : type.string(),
        from_id        : type.string(),
        from_dd_user_id: type.string(),
        organization_id: type.string(),
        message_type   : type.string(),
        mime_type      : type.string(),
        mime_url       : type.string(),
        attach_raw_info: type.string(),
        created_at     : type.date().min(r.now()),
        updated_at     : type.date().min(r.now())
    });

    const Organization = thinky.createModel('Organization', {
        id             : type.string(),
        organization_id: type.string(),
        server_url     : type.string(),
        name           : type.string(),
        access_token   : type.string(),
        private_key    : type.string(),
        created_at     : type.date().min(r.now()),
        updated_at     : type.date().min(r.now())
    });

    const Online = thinky.createModel('Online', {
        id             : type.string(),
        organization_id: type.string(),
        user_id        : type.string(),
        socket_id      : type.string(),
        online_since   : type.date().min(r.now())
    });

    Room.hasAndBelongsToMany(ChatUser, "chatUsers", "id", "id");
    Room.hasAndBelongsToMany(ChatUser, "onlineUsers", "id", "id", {type: 'onlineUsers'});
    ChatUser.hasAndBelongsToMany(Room, "rooms", "id", "id");
    ChatUser.hasMany(Message, 'messages', 'id', 'from_id');
    Message.belongsTo(ChatUser, 'from', 'from_id', 'id');
    Message.belongsTo(Room, 'room', 'room_id', 'id');

    // const

    // const Category = thinky.createModel("Category", {
    //   id:        type.string(),
    //   name:      type.string().required(),
    // })

    // User.hasMany(Post, "posts", "id", "userId")

    // Post.belongsTo(User, "user", "userId", "id")
    // Post.belongsTo(Category, "category", "categoryId", "id")

    // Category.hasMany(Post, "posts", "id", "categoryId")

    const allModels = {Post, Room, ChatUser, Message, Organization, Online};

    return {
        //   User:     require('./models/User')(r, allModels),
        Post        : require('./Post')(r, allModels),
        Room        : require('./Room')(r, allModels),
        ChatUser    : require('./ChatUser')(r, allModels),
        Message     : require('./Message')(r, allModels),
        Organization: require('./Organization')(r, allModels),
        Online      : require('./Online')(r, allModels)
        //   Category: require('./models/Category')(r, allModels),
    }
};