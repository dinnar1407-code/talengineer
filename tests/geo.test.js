const { test } = require('node:test');
const assert = require('node:assert/strict');
const { haversineMeters, geofenceCheck } = require('../src/utils/geo');

test('haversine 北京-上海约 1068km（±10km）', () => {
  const d = haversineMeters(39.9042, 116.4074, 31.2304, 121.4737);
  assert.ok(Math.abs(d - 1068000) < 10000, `got ${d}`);
});

test('haversine 同点距离为 0', () => {
  assert.equal(haversineMeters(31.23, 121.47, 31.23, 121.47), 0);
});

test('geofenceCheck 500m 内 ok=true', () => {
  // 相距约 111m（纬度差 0.001 度）
  const r = geofenceCheck({ siteLat: 31.2304, siteLng: 121.4737, radiusM: 500, lat: 31.2314, lng: 121.4737 });
  assert.equal(r.ok, true);
  assert.ok(r.distanceM > 100 && r.distanceM < 130, `got ${r.distanceM}`);
});

test('geofenceCheck 超半径 ok=false', () => {
  const r = geofenceCheck({ siteLat: 31.2304, siteLng: 121.4737, radiusM: 100, lat: 31.2404, lng: 121.4737 });
  assert.equal(r.ok, false);
});

test('geofenceCheck 缺坐标返回双 null（跳过校验）', () => {
  assert.deepEqual(geofenceCheck({ siteLat: null, siteLng: null, radiusM: 500, lat: 31, lng: 121 }), { distanceM: null, ok: null });
  assert.deepEqual(geofenceCheck({ siteLat: 31, siteLng: 121, radiusM: 500, lat: undefined, lng: undefined }), { distanceM: null, ok: null });
});

test('geofenceCheck 半径缺省 500', () => {
  const r = geofenceCheck({ siteLat: 31.2304, siteLng: 121.4737, radiusM: null, lat: 31.2314, lng: 121.4737 });
  assert.equal(r.ok, true); // 111m < 默认 500m
});
