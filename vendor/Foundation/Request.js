let Request = {
    getClientId: function (request) {
        return request._query.id;
    },
    getRole: function (request) {
        return request._query.role;
    }
};

module.exports = Request;