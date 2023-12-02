import { Router } from "express"
import { postAddressUser, getAddressUser } from "../controllers/addressController.js"

const router = Router()

router.post("/address", postAddressUser)
router.get("/address", getAddressUser)

export default router