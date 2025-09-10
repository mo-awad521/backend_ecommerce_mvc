import { Router } from "express";
import { addressController } from "../controllers/index.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", auth, addressController.getAddresses);
router.post("/", auth, addressController.createAddress);
router.put("/:id", auth, addressController.updateAddress);
router.delete("/:id", auth, addressController.deleteAddress);

export default router;
