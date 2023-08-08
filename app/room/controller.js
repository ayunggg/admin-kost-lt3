const fire = require("../../routes/firebase")
const Room = require("./model")
const Facility = require("../facility/model")
const db = fire.firestore()
const path = require("path")
const fs = require("fs")
const config = require("../../config")
const { v4: uuidv4 } = require("uuid")
const { getStorage, ref } = require("firebase/storage")

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage")
      const alertStatus = req.flash("alertStatus")

      const alert = {
        message: alertMessage,
        status: alertStatus,
      }

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


      res.render("admin/room/view_room", { title: "Express", alert, datasRoom })
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/room")
    }
  },
  viewCreate: async (req, res) => {
    try {
      const facility = await db.collection("facility").get()
      const datasFacility = []

      if (!facility.empty) {
        facility.forEach((datas) => {
          const facility = new Facility(datas.id, datas.data().facility)
          datasFacility.push(facility)
        })
      }

      res.render("admin/room/create", {
        title: "Halaman Tambah Kategori",
        datasFacility,
      })
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/room")
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { noKamar, facility, price } = req.body
      let filenames = []
      let targetPaths = []

      if (req.files && req.files.length > 0) {
        const filenames = [] // Membuat array untuk menyimpan nama file

        for (const file of req.files) {
          let tmp_path = file.path
          let originExt = file.originalname.split(".").pop()
          let filename = file.filename + "." + originExt
          let target_path = path.resolve(
            config.rootPath,
            `public/uploads/${filename}`
          )

          filenames.push(filename) // Menyimpan nama file ke dalam array

          const src = fs.createReadStream(tmp_path)
          const dest = fs.createWriteStream(target_path)

          src.pipe(dest)

          src.on("end", async () => {
            try {
              const bucket = fire.storage().bucket()
              const imageUrlArray = [] // Array untuk menyimpan URL gambar

              for (const filename of filenames) {
                const tmp_path = path.resolve(
                  config.rootPath,
                  `public/uploads/${filename}`
                )

                const storageFilePath = `room/${noKamar}/${filename}`

                await bucket.upload(tmp_path, {
                  destination: storageFilePath,
                  public: true,
                  metadata: {
                    contentType: "image/jpeg", // Ganti dengan tipe konten yang sesuai
                  },
                })
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${storageFilePath}`
                imageUrlArray.push(imageUrl) // Menyimpan URL gambar ke dalam array
                console.log({ datas: imageUrlArray })

                if (filenames.indexOf(filename) === filenames.length - 1) {
                  await db.collection("room").add({
                    noKamar: noKamar,
                    facility: facility,
                    price: price,
                    status: "PENDING",
                    imgUrl: imageUrlArray, // Menyimpan array URL gambar dalam field imgUrl
                  })

                  req.flash("alertMessage", "Berhasil Tambah Data Kamar")
                  req.flash("alertStatus", "success")
                  res.redirect("/room")
                }
              }
            } catch (err) {
              console.log("err 1")
              req.flash("alertMessage", `${err.message}`)
              req.flash("alertStatus", "danger")
              res.redirect("/room")
            }
          })
        }
      } else {
        const room = await db
          .collection("room")
          .where("noKamar", "==", noKamar)
          .get()

        if (room.empty) {
          await db.collection("room").add({
            noKamar: noKamar,
            facility: [facility],
            price: price,
            status: "PENDING",
          })
          req.flash("alertMessage", "Berhasil Tambah Kamar")
          req.flash("alertStatus", "success")

          res.redirect("/room")
        } else {
          req.flash("alertMessage", "Nomor Kamar Sudah Pernah Didaftarkan")
          req.flash("alertStatus", "danger")

          res.redirect("/room")
        }
      }
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/room")
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params
      const bucket = fire.storage().bucket()
      const path = datasRoom.facility.map((data) => {})
      const room = await db.collection("room").get()

      await db.collection("room").doc(id).delete()

      req.flash("alertMessage", "Berhasil Delete")
      req.flash("alertStatus", "success")

      res.redirect("/room")
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/room")
    }
  },
}

// const signedUrl = await bucket
//   .file(storageFilePath)
//   .getSignedUrl({
//     action: "read",
//     expires: "03-01-2500", // Ganti dengan tanggal yang sesuai
//   })
//   .then((result) => {
//     imageUrlArray.push(result)
//     return true
//   })
