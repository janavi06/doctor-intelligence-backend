
import { Router } from "express";
import {
  getDoctorById,
  searchDoctors,
  getFilters,
} from "./doctorService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await searchDoctors(req.query));
  } catch (error) {
    next(error);
  }
});

router.get("/filters", async (req, res, next) => {
  try {
    res.json(await getFilters());
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const doctor = await getDoctorById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json(doctor);
  } catch (error) {
    next(error);
  }
});

export default router;
