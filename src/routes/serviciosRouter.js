import { Router } from "express"
import { getServicios, postServicio } from "../controllers/serviciosController.js"

const router = Router()

router.get("/servicios", getServicios)
router.post("/servicio", postServicio)

export default router