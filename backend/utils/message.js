const moment = require('moment');

/*
* Вспомогательный класс реализующий генерацию текущего времени у нового сообщения
*/

const generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment().valueOf(),
    };
};

module.exports = { generateMessage };
