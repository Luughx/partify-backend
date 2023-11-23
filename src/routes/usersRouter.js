import { Router } from "express"
import { postSignup, postLogin, getUsers, getUser, test } from "../controllers/usersController.js"
import multer from "../config/multer.js"

const router = Router()

router.post("/test", multer.fields([{name: "avatar", maxCount: 1}, {name: "image", maxCount: 3}]), test)
router.get("/users", getUsers)
router.get("/user/:id", getUser)
router.post("/signup", postSignup)
router.post("/login", postLogin)

export default router