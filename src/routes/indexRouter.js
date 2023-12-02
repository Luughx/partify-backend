import { Router } from "express"
import { getData } from "../controllers/indexController.js"

const router = Router()

router.post("/getData", getData)

export default router