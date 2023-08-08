var express = require("express")
var router = express.Router()

const {
  index,
  viewCreate,
  actionCreate,
  actionDelete,
} = require("./controller")
const multer = require("multer")
const os = require("os")
/* GET home page. */
router.get("/", index)
router.get("/create", viewCreate)
router.post("/create", multer({ dest: os.tmpdir() }).any("image"), actionCreate)
router.delete("/delete/:id", actionDelete)

module.exports = router
