let logConfig = require('../config/log');
let fileSystem = require('fs');
let util = require('util');
let moment = require('moment');

class LogInitializer {
    constructor() {
        let logFileDate = moment().format(logConfig.dateFormatOfLogFiles);

        let accessLogFileName = logConfig.accessLogFile + '_' + logFileDate + '.log';
        let errorLogFileName = logConfig.errorLogFile + '_' + logFileDate + '.log';
        let warningLogFileName = logConfig.warningLogFile + '_' + logFileDate + '.log';


        console.log = (log) => {
            let accessLogFile = false;
            if(logConfig.writeLogsToFile) {
                accessLogFile = fileSystem.createWriteStream('./' + accessLogFileName, {flags: 'a'});
            }
            this.addLog(accessLogFile, log);
        };

        console.error = (err) => {
            let errorLogFile = false;
            if(logConfig.writeLogsToFile) {
                errorLogFile = fileSystem.createWriteStream('./' + errorLogFileName, {flags: 'a'});
            }
            this.addLog(errorLogFile, err);
        };

        console.warn  = (warn) => {
            let warningLogFile = false;
            if(logConfig.writeLogsToFile) {
                warningLogFile = fileSystem.createWriteStream('./' + warningLogFileName, {flags: 'a'});
            }
            this.addLog(warningLogFile, warn);
        };
    };
    addLog(logFile, text) {
            text = util.format(moment().format('YYYY-MM-DD HH:mm:ss') + ' | ' + text) + '\n';
        if(logFile) {
            logFile.write(text);
        }
        if (logConfig.writeLogsToConsole) {
            process.stdout.write(text);
        }
    };
};

class ConfigInitializer {
    constructor() {
        new LogInitializer();
    };
};

module.exports = new ConfigInitializer();