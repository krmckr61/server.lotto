class StaffModule{
    constructor(staffId, socket, io) {
        this.staffId = staffId;
        this.io = io;
        this.socket = socket;

        this.initListeners();
    }
};

StaffModule.prototype.roomName = 'staff';

StaffModule.prototype.initRooms = function(roomName) {
    if(!roomName) {
        roomName = this.roomName;
    }
    this.socket.join(roomName);
};

StaffModule.prototype.room = function() {
    return this.io.to(this.roomName);
};

StaffModule.prototype.staffId = null;
StaffModule.prototype.socket = null;
StaffModule.prototype.io = null;

module.exports = StaffModule;