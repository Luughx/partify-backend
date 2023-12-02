import { Router } from "express"
import { getCart, patchCart, postOrder } from "../controllers/ordersController.js"

const router = Router()

router.post("/order", postOrder)

router.get("/cart", getCart)
router.patch("/cart", patchCart)

export default router