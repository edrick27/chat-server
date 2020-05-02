var express = require('express');
var router = express.Router();
const { validationResult } = require('express-validator/check');


module.exports = models => {

  /* GET users listing. */
  router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });

  router.get('/usersgetall/:organization_id*?', async function(req, res, next) {

    const invalid = handleRequestValidations(req, res);
    if (invalid) return invalid;

    let organization_id = req.params.organization_id;
    let users = await models.ChatUser.getChatUsers(organization_id);

    res.send(users);
  });

  function handleRequestValidations(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()});
    }

    return false;
  }

  return router;
};