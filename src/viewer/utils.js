export function getLen(v) {
  if (isNaN(v.x) || isNaN(v.y)) {
    return 0
  } else {
    return Math.sqrt(v.x * v.x + v.y * v.y)
  }
}
export function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y
}
export function getAngle(v1, v2) {
  var mr = getLen(v1) * getLen(v2)
  if (mr === 0) return 0
  var r = dot(v1, v2) / mr
  if (r > 1) r = 1
  return Math.acos(r)
}
export function cross(v1, v2) {
  return v1.x * v2.y - v2.x * v1.y
}
export function getRotateAngle(v1, v2) {
  var angle = getAngle(v1, v2)
  if (cross(v1, v2) > 0) {
    angle *= -1
  }
  return angle * 180 / Math.PI
}