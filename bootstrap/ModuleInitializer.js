let Request = require('../vendor/Foundation/Request');

class ModuleInitializer {

    constructor(io) {
        this.io = io;
        this.initSocketModules();
    };

    initSocketModules() {
        this.io.on('connection', (socket) => {
            this.socket = socket;
            let role = Request.getRole(socket.request);
            if (role === 'staff') {
                //set listeners for staffs
                this.setStaffSocketModules();
            } else if (role === 'boss') {
                this.setBossSocketModules();
            } else {
                let clientId = Request.getClientId(socket.request);
                //set listeners for clients
                this.setClientSocketModules(clientId);
            }
        });
    };

    setClientSocketModules(clientId) {
        this.setModules(clientId, this.requiredClientModules, this.clientSocketModules);
    };

    setStaffSocketModules(staffId) {
        this.setModules(staffId, this.requiredStaffModules, this.staffSocketModules);
    };

    setBossSocketModules(staffId) {
        this.setModules(staffId, this.requiredBossModules, this.bossSocketModules);
    };

    setModules(id, object, modules) {
        for (let i = 0; i < modules.length; i++) {
            let module = modules[i];
            object[module.name] = require('../app/Sockets/' + module.path);
            object[module.name] = new object[module.name](id, this.socket, this.io);
        }
    }

};

//Modules which are using socket.io for clients
ModuleInitializer.prototype.requiredClientModules = {};
ModuleInitializer.prototype.clientSocketModules = [
    {
        'name': 'Connection',
        'description': 'Connection of clients',
        'path': 'Client/Connection'
    },
    {
        'name': 'Game',
        'description': 'Game events',
        'path': 'Client/Game'
    },

];

//Modules which are using socket.io for pricer
ModuleInitializer.prototype.requiredBossModules = {};
ModuleInitializer.prototype.bossSocketModules = [
    {
        'name': 'Connection',
        'description': 'Connection of boss',
        'path': 'Boss/Connection'
    },
    {
        'name': 'Balance',
        'description': 'Clients balance events',
        'path': 'Boss/Balance'
    },
];


//Modules which are using socket.io for staff
ModuleInitializer.prototype.requiredStaffModules = {};
ModuleInitializer.prototype.staffSocketModules = [
    {
        'name': 'Connection',
        'description': 'Connection of staffs',
        'path': 'Staff/Connection'
    },
    {
        'name': 'Game',
        'description': 'Game events',
        'path': 'Staff/Game'
    },
];

module.exports = ModuleInitializer;