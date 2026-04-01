const { parseDemand } = require('./src/services/aiService');

async function test() {
    try {
        const result = await parseDemand("我们要去墨西哥蒙特雷修个机器，大概需要一个礼拜，预算2000美金，需要懂西门子的。");
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
