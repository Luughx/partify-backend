import { Router } from "express"
import { postSupplier } from "../controllers/suppliersController.js"
import multer from "../config/multer.js"

const router = Router()

router.post("/supplier", multer.fields([{ name: "rfc", maxCount: 1 }, { name: "address", maxCount: 1 }, 
{ name: "bankAccount", maxCount: 1 }, { name: "payment", maxCount: 1 }]), postSupplier)

export default router