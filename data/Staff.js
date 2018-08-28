let moment = require('moment');

let Staff = {
    staffs: {},
};

Staff.add = function (id, name) {
    this.staffs[id] = {id: id, name: name};
};

Staff.addWithEntranceDatas = function (id) {
    this.staffs[id] = {id: id, connectionDate: moment().format()};
};

Staff.has = function (staffId) {
    if (this.staffs[staffId]) {
        return true;
    } else {
        return false;
    }
};

Staff.delete = function (staffId) {
    if (this.has(staffId)) {
        delete this.staffs[staffId];
    }
};

module.exports = Staff;