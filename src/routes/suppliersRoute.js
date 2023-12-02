import { Router } from "express"
import { postSupplier, getSuppliers, getSupplier, patchVerified } from "../controllers/suppliersController.js"
import multer from "../config/multer.js"

const router = Router()

router.get("/suppliers", getSuppliers)
router.get("/supplier/:id", getSupplier)
router.patch("/supplier/change-state/:id", patchVerified)
router.post("/supplier", multer.fields([{ name: "rfc", maxCount: 1 }, { name: "address", maxCount: 1 }, 
{ name: "bankAccount", maxCount: 1 }, { name: "payment", maxCount: 1 }]), postSupplier)

export default router