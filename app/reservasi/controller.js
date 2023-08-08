const fire = require("../../routes/firebase")
const Room = require("../room/model")
const Facility = require("../facility/model")
const db = fire.firestore()
const path = require("path")
const fs = require("fs")
const config = require("../../config")
const { v4: uuidv4 } = require("uuid")
const { getStorage, ref } = require("firebase/storage")
const { parseISO, differenceInDays } = require("date-fns")

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage")
      const alertStatus = req.flash("alertStatus")

      const alert = {
        message: alertMessage,
        status: alertStatus,
      }

      res.render("admin/reservasi/view_reservasi", { title: "Express", alert })
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/reservasi")
    }
  },
  viewCreate: async (req, res) => {
    try {
      const room = await db.collection("room").get()
      const datasRoom = []
      if (!room.empty) {
        room.forEach((datas) => {
          const room = new Room(
            datas.id,
            datas.data().noKamar,
            datas.data().price,
            datas.data().imgUrl,
            datas.data().status,
            datas.data().facility
          )
          datasRoom.push(room)
        })
      }

      res.render("admin/reservasi/create", {
        title: "Halaman Tambah Kategori",
        datasRoom,
      })
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/reservasi")
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { noKamar, dateStart, dateEnd, nik, name, noHp, address } = req.body

      const reservasi = await db
        .collection("reservasi")
        .where("noKamar", "==", noKamar)
        .get()

      if (reservasi.empty) {
        await db.collection("reservasi").add({
          noKamar: noKamar,
          dateStart: dateStart,
          dateEnd: dateEnd,
          status: "PENDING",
        })

        const room = await db
          .collection("room")
          .where("noKamar", "==", noKamar)
          .get()
          .data()

        let dayStart = parseISO(dateStart.toString())
        let dayEnd = parseISO(dateEnd.toString())
        let totalDays = differenceInDays(dayEnd, dayStart)

        console.log(`Total Hari = ${totalDays}`)

        const totalHari = totalDays // Ganti dengan total hari yang diperoleh
        const jumlahBulan = hitungJumlahBulan(totalHari)
        if (totalHari < 30) {
          console.log("Jumlah Bulan: 1")
        } else {
          console.log("Jumlah Bulan:", jumlahBulan)
        }

        req.flash("alertMessage", "Berhasil Tambah Kamar")
        req.flash("alertStatus", "success")

        res.redirect("/reservasi")
      } else {
        req.flash("alertMessage", "Kamar Penuh")
        req.flash("alertStatus", "danger")

        res.redirect("/reservasi")
      }
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/reservasi")
    }
  },
  //   actionDelete: async (req, res) => {
  //     try {
  //       const { id } = req.params
  //       const bucket = fire.storage().bucket()
  //       const path = datasRoom.facility.map((data) => {})
  //       const room = await db.collection("room").get()

  //       const datasRoom = []
  //       if (!room.empty) {
  //         room.forEach((datas) => {
  //           const room = new Room(
  //             datas.id,
  //             datas.data().noKamar,
  //             datas.data().price,
  //             datas.data().imgUrl,
  //             datas.data().status,
  //             datas.data().facility
  //           )

  //           datasRoom.push(room)
  //         })
  //       }

  //       await db.collection("room").doc(id).delete()

  //       req.flash("alertMessage", "Berhasil Tambah Kategori")
  //       req.flash("alertStatus", "success")

  //       res.redirect("/room")
  //     } catch (err) {
  //       req.flash("alertMessage", `${err.message}`)
  //       req.flash("alertStatus", "danger")
  //       res.redirect("/room")
  //     }
  //   },
}

function hitungJumlahBulan(totalHari) {
  const jumlahBulan = Math.floor(totalHari / 30) // Menggunakan asumsi 30 hari dalam satu bulan
  return jumlahBulan
}
