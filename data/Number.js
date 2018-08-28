let Number = {
    numbers: [0]
};

Number.toString = function () {
    if (this.numbers.length > 0) {
        let string = 'array[';
        string += this.numbers.join(', ');
        return string + ']'
    } else {
        return false;
    }
};

Number.add = function (number) {
    if (!this.has(number)) {
        this.numbers.push(number);
        return true;
    } else {
        return false;
    }
};

Number.has = function (number) {
    if (!this.numbers.includes(number)) {
        return false;
    } else {
        return true;
    }
};

Number.clear = function () {
    this.numbers = [0];
};

module.exports = Number;