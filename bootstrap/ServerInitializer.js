let config = require('../config/app');

class serverInitializer {
    constructor() {
        this.app = require('express')();

        this.http = require('http').Server(this.app);
        this.io = require('socket.io')(this.http);

        this.http.listen(config.port, () => {
            console.log('SERVER IS RUNNING ON ' + config.ipAddress + ':' + config.port);
        });
    }
}

serverInitializer.prototype.app = false;
serverInitializer.prototype.http = false;
serverInitializer.prototype.io = false;

module.exports = new serverInitializer();