const slugify = require('slugify');
const md5     = require('md5');
const uuid    = require('uuid/v5');

module.exports = (r, models) => {

    const {Organization} = models;

    return {
        /**
         *
         * @param params
         * @returns {Promise<null>}
         */
        createOrUpdate: async(params) => {
            let organizations = await models.Organization.filter({
                                                                     organization_id: params.organization_id
                                                                 }).run();


            let organization = organizations.length > 0 ? organizations[0] : null;

            if (organization == null) {
                let privateKey = uuid(params.organization_id, uuid.DNS);
                organization   = new Organization({
                                                      private_key    : privateKey,
                                                      access_token   : md5(privateKey),
                                                      organization_id: params.organization_id,
                                                      created_at     : r.now()
                                                  });
            }

            organization.server_url = params.server_url;
            organization.updated_at = r.now();
            await organization.saveAll();

            return organization;
        },

        /**
         *
         * @param token
         * @returns {Promise<boolean>}
         */
        checkToken: async (token) => {
            let organizations = await models.Organization.filter({
                                                                     access_token: token
                                                                 }).run();

            return organizations.length > 0;
        }
    }
};