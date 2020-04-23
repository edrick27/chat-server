module.exports = (r, models) => {

    const {Post} = models

    return {

        getUserPosts: function(userId) {
            // const user  = await User.get(userId)
            // const posts = user.getJoin({ posts: true })
            return posts
        },

        create: function(params) {

            const {content} = params

            const user = User.get(userId)
            const category = Category.get(params['category'])
            const post = new Post({content})
            post.user = user
            post.category = category
            return post.saveAll()

        },

        getMyPost: async function(params) {
            return 'DEMO';
        }

    }
};