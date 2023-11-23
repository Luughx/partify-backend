import { Router } from "express"
import { postSignup, postLogin, getUsers, getUser, test } from "../controllers/usersController.js"

const router = Router()

router.get("/test", test)
router.get("/users", getUsers)
router.get("/user/:id", getUser)
router.post("/signup", postSignup)
router.post("/login", postLogin)

export default router