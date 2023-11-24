import { Router } from "express"
import { getServices, postService } from "../controllers/servicesController.js"
import multer from "../config/multer.js"

const router = Router()

router.get("/services", getServices)
router.post("/service", multer.fields([{ name: "thumbnail", maxCount: 1 }, { name: "image", maxCount: 10 }]), postService)

export default router