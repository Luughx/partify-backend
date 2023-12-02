import { Router } from "express"
import { postSignup, postLogin, getUsers, getUser, postLogout } from "../controllers/usersController.js"
import multer from "../config/multer.js"

const router = Router()

router.get("/users", getUsers)
router.get("/user/:id", getUser)
router.post("/login", postLogin)
router.post("/signup", postSignup)
router.post("/logout", postLogout)

export default router