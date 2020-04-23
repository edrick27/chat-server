module.exports = (r, models) => {

    const {ChatUser} = models;

    return {

        // getUserPosts: function(userId) {
        //     // const user  = await User.get(userId)
        //     // const posts = user.getJoin({ posts: true })
        //     return posts
        // },
        //
        // create: function(params) {
        //
        //     const {content} = params
        //
        //     const user = User.get(userId)
        //     const category = Category.get(params['category'])
        //     const post = new Post({content})
        //     post.user = user
        //     post.category = category
        //     return post.saveAll()
        //
        // },

        findOneOrNew: async function(params) {
            let users = await ChatUser.filter({
                                                  dd_user_id     : params.dd_user_id.toString(),
                                                  organization_id: params.organization_id
                                              }).run();
            // console.log(users);

            let user = null;

            if (users.length > 0) {
                user = users[0];
            } else {
                user = new ChatUser({
                                        email          : params.email,
                                        organization_id: params.organization_id,
                                        dd_user_id     : params.dd_user_id
                                    });

                user.created_at = r.now();
            }

            user.updated_at = r.now();
            user.name       = params.name;
            user.nickname   = params.nickname;

            await user.saveAll();

            // console.log(user);

            return user;
        },

        findByDDUserID: async function(email) {
            let users = await ChatUser.filter({
                                                  dd_user_id: params.dd_user_id.toString()
                                              }).run();

            return users.length > 0 ? users[0] : null;
        }

        //
        // getMyPost: async function(params) {
        //     return 'DEMO';
        // }

    }
};