// 地理围栏工具：Haversine 大圆距离 + 签到围栏判定。
// 为什么服务端算：客户端可伪造，距离与判定必须由服务端落库才可信。
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球平均半径（米）
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// 任一侧坐标缺失 → {null, null} 表示跳过校验（警示不拦截策略的一部分）
function geofenceCheck({ siteLat, siteLng, radiusM, lat, lng }) {
  const nums = [siteLat, siteLng, lat, lng].map((v) => parseFloat(v));
  if (!nums.every(Number.isFinite)) return { distanceM: null, ok: null };
  const d = haversineMeters(nums[0], nums[1], nums[2], nums[3]);
  const r = Number.isFinite(parseFloat(radiusM)) ? parseFloat(radiusM) : 500;
  return { distanceM: Math.round(d), ok: d <= r };
}

module.exports = { haversineMeters, geofenceCheck };
