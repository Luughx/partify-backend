import { Router } from "express"
import { postSupplier } from "../controllers/suppliersController.js"
import multer from "../config/multer.js"

const router = Router()

router.post("/supplier", multer.single("image"), postSupplier)

export default router