const { test } = require('node:test');
const assert = require('node:assert/strict');
const { orderOps, classifyFailure, markerParse } = require('../lib/offline/replayCore');

test('orderOps 按 createdAt 升序稳定排序', () => {
  const ops = [{ id: 'b', createdAt: 200 }, { id: 'a', createdAt: 100 }, { id: 'c', createdAt: 200 }];
  assert.deepEqual(orderOps(ops).map((o) => o.id), ['a', 'b', 'c']);
});
test('classifyFailure 网络错/5xx/429/401/403 重试，其余 4xx 失败', () => {
  assert.equal(classifyFailure(0), 'retry');
  assert.equal(classifyFailure(500), 'retry');
  assert.equal(classifyFailure(429), 'retry');
  assert.equal(classifyFailure(401), 'retry'); // token 过期：重登后重放可成功，不能丢弃
  assert.equal(classifyFailure(403), 'retry');
  assert.equal(classifyFailure(400), 'fail');
  assert.equal(classifyFailure(404), 'fail');
  assert.equal(classifyFailure(409), 'fail');
  assert.equal(classifyFailure(422), 'fail');
});
test('markerParse 解析 qc-image 标记', () => {
  assert.deepEqual(markerParse('[qc-image:42/1699999.jpg]'), { kind: 'qc-image', path: '42/1699999.jpg' });
  assert.equal(markerParse('普通消息'), null);
  assert.equal(markerParse('[qc-image:]'), null);
});
