import { pool } from "../config/database.js"
import lodash from "lodash"

export const postSupplier = async (req, res) => {
    const { nameSupplier, name, lastName, email, phone, address } = req.body

    if (!res.session.token) return res.json({
        "message": "No estás loggeado"
    })

    if (!nameSupplier || !name || !lastName || !email || !phone || !address || !req.file) return res.json({
        "message": "Faltan datos"
    })

    const nameSupplierEsc = lodash.escape(nameSupplier)
    const nameEsc = lodash.escape(name)
    const lastNameEsc = lodash.escape(lastName)
    const emailEsc = lodash.escape(email)
    const phoneEsc = lodash.escape(phone)
    const addressEsc = lodash.escape(address)

    const [rows] = await pool.query("INSERT INTO suppliers(nameSupplier, name, lastName, email, phone, address, RFCURI, addressURI, bankAccountURI, paymentURI, idUser) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
    [nameSupplierEsc, nameEsc, lastNameEsc, emailEsc, phoneEsc, addressEsc, RFCURI, addressURI, bankAccountURI, paymentURI, idUser])
    
    res.json({ "id": rows.insertId, name: nameEsc, lastName: lastNameEsc, email: emailEsc, phone: phoneEsc })
}