import { Router } from "express"
import { postUser, getUsers, getUser } from "../controllers/usersController.js"

const router = Router()

router.get("/users", getUsers)
router.get("/user/:id", getUser)
router.post("/user", postUser)

export default router