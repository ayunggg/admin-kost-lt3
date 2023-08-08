var express = require("express")
var router = express.Router()
const {
  index,
  viewCreate,
  actionCreate,
  viewEdit,
  actionEdit,
  actionDelete,
} = require("./controller")

/* GET home page. */
router.get("/", index)
router.get("/create", viewCreate)
router.get("/edit/:id", viewEdit)
router.put("/edit/:id", actionEdit)
router.post("/create", actionCreate)
router.delete("/delete/:id", actionDelete)

module.exports = router
