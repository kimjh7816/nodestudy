const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tagController");

router.get("/", ctrl.getTags);

module.exports = router;
