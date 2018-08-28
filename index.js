let configInitializer = require('./bootstrap/ConfigInitializer'),

    serverInitializer = require('./bootstrap/ServerInitializer'),

    moduleInitializer = require('./bootstrap/ModuleInitializer');

new moduleInitializer(serverInitializer.io);