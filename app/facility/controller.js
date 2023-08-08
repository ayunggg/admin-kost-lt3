const fire = require("../../routes/firebase")
const Facility = require("./model")
const db = fire.firestore()

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage")
      const alertStatus = req.flash("alertStatus")

      const alert = {
        message: alertMessage,
        status: alertStatus,
      }

      const facility = await db.collection("facility").get()
      const datasFacility = []
      if (!facility.empty) {
        facility.forEach((datas) => {
          const facility = new Facility(datas.id, datas.data().facility)
          datasFacility.push(facility)
        })
      }

      res.render("admin/facility/view_facility", {
        title: "Express",
        alert,
        datasFacility,
      })
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/facility")
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render("admin/facility/create", {
        title: "Halaman Tambah Fasilitas",
      })
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/facility")
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { facility } = req.body

      const datas = await db
        .collection("user")
        .where("facility", "==", facility)
        .get()

      if (datas.empty) {
        await db.collection("facility").add({
          facility: facility,
        })

        req.flash("alertMessage", "Berhasil Tambah Fasilitas")
        req.flash("alertStatus", "success")

        res.redirect("/facility")
      } else {
        req.flash("alertMessage", "Duplicate Entry Data")
        req.flash("alertStatus", "danger")

        res.redirect("/facility")
      }
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/facility")
    }
  },

  viewEdit: async (req, res) => {
    try {
      const { id } = req.params

      const alertMessage = req.flash("alertMessage")
      const alertStatus = req.flash("alertStatus")

      const alert = {
        message: alertMessage,
        status: alertStatus,
      }
      await db
        .collection("facility")
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const facility = new Facility(doc.id, doc.data().facility)
            res.render("admin/facility/edit", { facility, alert })
          }
        })
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/facility")
    }
  },

  actionEdit: async (req, res) => {
    try {
      const { id } = req.params
      const { facility } = req.body

      const datasFacility = await db
        .collection("facility")
        .where("facility", "==", facility)
        .get()

      if (datasFacility.empty) {
        await db.collection("facility").doc(id).update({
          facility: facility,
        })

        req.flash("alertMessage", "Berhasil Edit Fasilitas")
        req.flash("alertStatus", "success")

        res.redirect("/facility")
      } else {
        req.flash("alertMessage", "Duplicate Entry Data")
        req.flash("alertStatus", "danger")

        res.redirect("/facility")
      }
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/facility")
    }
  },
  actionDelete: async (req, res) => {
    try {
      const { id } = req.params

      await db.collection("facility").doc(id).delete()

      req.flash("alertMessage", "Berhasil Hapus Fasilitas")
      req.flash("alertStatus", "success")

      res.redirect("/facility")
    } catch (err) {
      req.flash("alertMessage", `${err.message}`)
      req.flash("alertStatus", "danger")
      res.redirect("/facility")
    }
  },
}
