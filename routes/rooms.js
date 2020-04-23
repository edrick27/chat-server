const express                   = require('express');
const router                    = express.Router();
const {check, validationResult} = require('express-validator/check');
const {matchedData, sanitize}   = require('express-validator/filter');


module.exports = models => {
    /* GET home page. */
    router.post('/add', validateAddNewRoomRequest(), async function(req, res, next) {

        const invalid = handleRequestValidations(req, res);
        if (invalid) return invalid;

        let room = await models.Room.create({
                                                name           : req.body.name,
                                                organization_id: req.body.organization_id,
                                                type           : req.body.type,
                                                type_id        : req.body.type_id

                                            });
        res.send(JSON.stringify(room));
    });

    router.post('/add/:roomId/user', validateAddUserRequest(), async function(req, res, next) {
        const invalid = handleRequestValidations(req, res);
        if (invalid) return invalid;

        let room = await models.Room.getRoomOnlyById(req.params.roomId);
        if (room == null)
            return res.status(404).json({errors: 'Room not found'});
        let user = await models.ChatUser.findOneOrNew(req.body);

        room.addRelation('chatUsers', user);// = [user];
        await room.saveAll({ chatUsers: true });

        res.send(user);

    });

    router.get('/info/:roomId', async function (req, res, next) {
        let room = await models.Room.getRoomInfo(req.params.roomId);

        res.send(room);
    });

    router.get('/messages/:roomId/:page/:page_size*?', validateFetchMessages(), async function(req, res, next) {

        const invalid = handleRequestValidations(req, res);
        if (invalid) return invalid;

        let page          = req.params.page;
        let page_size     = typeof req.params.page_size === 'undefined' ? 10 : parseInt(req.params.page_size);
        let room          = req.params.roomId;
        let room_messages = await models.Message.getRoomMessages(room, page, page_size);

        res.send(room_messages);
    });

    router.get('/check-for-updates/:timestamp/:organization_id', async function(req, res, next) {
        let timestamp       = req.params.timestamp;
        let organization_id = req.params.organization_id;

        if (timestamp == 0) {
            return res.send({timestamp: await models.Room.getCheckerTimestamp(organization_id), messages: []});
        }

        res.send(await models.Message.fetchLatestMessages(timestamp, organization_id));
    });

    function handleRequestValidations(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.mapped()});
        }

        return false;
    }

    function validateAddNewRoomRequest() {
        return [
            check('name').exists().not().isEmpty(),
            check('organization_id').exists().not().isEmpty(),
            check('type').exists().not().isEmpty(),
            check('type_id').exists().not().isEmpty(),
        ];
    }

    function validateAddUserRequest() {
        return [
            check('name').exists().not().isEmpty(),
            check('email').optional().isEmail(),
            check('organization_id').exists().not().isEmpty(),
            check('dd_user_id').exists().not().isEmpty(),
            check('roomId').exists().not().isEmpty()
        ];
    }

    function validateFetchMessages() {
        return [
            check('roomId').exists().not().isEmpty(),
            check('page').exists().isNumeric().not().isEmpty(),
            check('page_size').optional().isNumeric(),
        ];
    }

    return router;
};