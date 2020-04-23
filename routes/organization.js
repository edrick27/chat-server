const express                   = require('express');
const router                    = express.Router();
const {check, validationResult} = require('express-validator/check');
const {matchedData, sanitize}   = require('express-validator/filter');


module.exports = models => {

    router.post('/add', validateNewOrg(), async(req, res, next) => {
        const invalid = handleRequestValidations(req, res);
        if (invalid) return invalid;

        let organization = await models.Organization.createOrUpdate(req.body);

        res.send(JSON.stringify({
                                    access_token: organization.access_token
                                }));
    });

    function handleRequestValidations(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.mapped()});
        }

        return false;
    }

    function validateNewOrg() {
        return [
            check('organization_id').exists().not().isEmpty(),
            check('server_url').exists().not().isEmpty()
        ];
    }

    return router;
};