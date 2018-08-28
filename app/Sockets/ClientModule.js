class ClientModule {
    constructor(clientId, socket, io) {
        this.clientId = clientId;
        this.io = io;
        this.socket = socket;

        this.initListeners();
    }

}

ClientModule.prototype.roomName = 'client';

ClientModule.prototype.initRooms = function () {
    this.socket.join(this.roomName);
    this.socket.join(this.roomName + '-' + this.clientId);
};

ClientModule.prototype.room = function () {
    return this.io.to(this.roomName);
};

ClientModule.prototype.clientRoom = function () {
    return this.io.to(this.roomName + '-' + this.clientId);
};

ClientModule.clientId = null;
ClientModule.socket = null;
ClientModule.io = null;


module.exports = ClientModule;