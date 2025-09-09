import { Router } from "express";
import * as addressController from "../controllers/addressController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", auth, addressController.getAddresses);
router.post("/", auth, addressController.createAddress);
router.put("/:id", auth, addressController.updateAddress);
router.delete("/:id", auth, addressController.deleteAddress);

export default router;
