import express from "express";
import {
  createPlacement,
  editPlacement,
  getPlacements,
  getPlacement,
} from "../controllers/placement.controllers";

const router = express.Router();

router.post("/create", createPlacement);
router.put("/edit/:id", editPlacement);
router.get("/", getPlacements);
router.get("/specific/:id", getPlacement);

module.exports = router;
