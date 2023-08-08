const Room = require("../room/model")

class Reservasi {
  constructor(id, room, dateStart, dateEnd) {
    ;(this.id = id),
      (this.room = room),
      (this.dateStart = dateStart),
      (this.dateEnd = dateEnd)
  }
}
module.exports = Reservasi
