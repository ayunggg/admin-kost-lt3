class Room {
  constructor(id, noKamar, price, imgUrl = Array, status, facility = Array) {
    ;(this.id = id),
      (this.noKamar = noKamar),
      (this.price = price),
      (this.imgUrl = imgUrl),
      (this.status = status),
      (this.facility = facility)
  }
}
module.exports = Room
