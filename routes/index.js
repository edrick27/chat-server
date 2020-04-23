var express = require('express');
var router = express.Router();


module.exports = models => {
    /* GET home page. */
    router.get('/', async function(req, res, next) {

        const post = models.Post;
        const test = await post.getMyPost('asdf');
        console.log(test);
        res.render('index', {title: 'Express', test: test});
    });


    router.get('/chat', async function (req, res, next) {
        res.render('chat');
    });

    return router;
};