let StaffModule = require('../StaffModule');
let Request = require('../../../vendor/Foundation/Request');
/*
 * this.socket
 * this.io
 */

class Connection extends StaffModule {
    initListeners() {
        this.connection();
    };

    connection() {
        this.initRooms(Request.getRole(this.socket.request));
    };

}

module.exports = Connection;