import { pool } from "../config/database.js"
import lodash from "lodash"
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getData = async (req, res) => {
    
    console.log(req.session.token)
    if (!req.session.token) {
        //req.session.destroy(() => {})
        return res.json({ "message": "Sesión no iniciada" })
    }
    console.log(decoded)

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)
    
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [decoded.id])

    
    res.json(rows[0])
}