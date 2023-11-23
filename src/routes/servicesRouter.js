import { Router } from "express"
import { getService, postService } from "../controllers/servicesController.js"
import multer from "../config/multer.js"

const router = Router()

router.get("/service", getService)
router.post("/service", multer.single("image"), postService)

export default router