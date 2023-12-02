import { pool } from "../config/database.js"
import { Storage } from "@google-cloud/storage"
import lodash from "lodash"
import jwt from "jsonwebtoken"
import { compressAndUpload } from "../functions/compressAndUpload.js"
import { insertAddress } from "./addressController.js";

export const patchVerified = async (req, res) => {
    if (!req.session.token) return res.json({ "message": "Sesión no iniciada" })

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)
    if (!decoded.admin) return res.json({ "message": "No tienes los suficientes permisos" })

    const { rfcState, addressState, bankAccountState, paymentState } = req.body
    const { id } = req.params

    if (rfcState) 
        await pool.query("UPDATE suppliers SET rfcState=? WHERE id=?", [parseInt(rfcState), parseInt(id)])
    if (addressState) 
        await pool.query("UPDATE suppliers SET addressState=? WHERE id=?", [parseInt(addressState), parseInt(id)])
    if (bankAccountState) 
        await pool.query("UPDATE suppliers SET bankAccountState=? WHERE id=?", [parseInt(bankAccountState), parseInt(id)])
    if (paymentState) 
        await pool.query("UPDATE suppliers SET paymentState=? WHERE id=?", [parseInt(paymentState), parseInt(id)])

    const [rows] = await pool.query("SELECT * FROM suppliers WHERE id=?", [parseInt(id)])

    if (rows[0].rfcState == 2 || rows[0].addressState == 2 || rows[0].bankAccountState == 2 || rows[0].paymentState == 2 )
        await pool.query("UPDATE suppliers SET verified=? WHERE id=?", [true, parseInt(id)])
    
    res.json(true)
}

export const getSupplier = async (req, res) => {
    const { id } = req.params

    const [rows] = await pool.query("SELECT * FROM suppliers WHERE id=?", [id])

    res.json(rows)
}

export const getSuppliers = async (req, res) => {

    const [rows] = await pool.query("SELECT * FROM suppliers")

    res.json(rows)
}

export const postSupplier = async (req, res) => {
    const { nameSupplier, name, lastName, email, phone, street, colony, city, state, country, postalCode } = req.body

    if (!req.session.token) return res.json({ "message": "Sesión no iniciada" })

    if (!nameSupplier || !name || !lastName || !email || !phone || !street || !colony || !city || !state || !country || !postalCode || !req.files) return res.json({ "message": "Faltan datos" })

    if (!req.files.rfc || !req.files.address || !req.files.bankAccount || !req.files.payment) return res.json({ "message": "Faltan imagenes" })

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)

    const nameSupplierEsc = lodash.escape(nameSupplier)
    const nameEsc = lodash.escape(name)
    const lastNameEsc = lodash.escape(lastName)
    const emailEsc = lodash.escape(email)
    const phoneEsc = lodash.escape(phone)

    const projectId = process.env.GCLOUD_PROJECT_ID
    const keyFilename = process.env.GCLOUD_KEY
    const bucketName = process.env.GCLOUD_STORAGE_BUCKET_SUPPLIERS

    const storage = new Storage({ projectId, keyFilename })
    const bucket = storage.bucket(bucketName)

    const rfcURI = await compressAndUpload(req.files.rfc[0].path, bucket, nameEsc)
    const addressURI = await compressAndUpload(req.files.address[0].path, bucket, nameEsc)
    const bankAccountURI = await compressAndUpload(req.files.bankAccount[0].path, bucket, nameEsc)
    const paymentURI = await compressAndUpload(req.files.payment[0].path, bucket, nameEsc)

    const [rows] = await pool.query("INSERT INTO suppliers(nameSupplier, name, lastName, phone, email, idUser, rfcURI, addressURI, bankAccountURI, paymentURI, thumbnailURI, rfcState, addressState, bankAccountState, paymentState, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
    [nameSupplierEsc, nameEsc, lastNameEsc, parseInt(phoneEsc), emailEsc, decoded.id, rfcURI, addressURI, bankAccountURI, paymentURI, "", 1, 1, 1, 1, false])
    
    const rowsAddress = await insertAddress(rows.insertId, nameEsc, lastNameEsc, phoneEsc, lodash.escape(street), lodash.escape(colony), lodash.escape(city), lodash.escape(state), lodash.escape(country), lodash.escape(postalCode), res)

    await pool.query("UPDATE suppliers SET idAddress=?", [rowsAddress.insertId])

    res.json({ 
        "id": rows.insertId, 
        nameSupplier: nameSupplierEsc, 
        name: nameEsc, 
        lastName: lastNameEsc, 
        phone: parseInt(phoneEsc), 
        email: emailEsc, 
        idAddress: rowsAddress.insertId, 
        idUser: decoded.id, 
        rfcURI: rfcURI, 
        addressURI: addressURI, 
        bankAccountURI: bankAccountURI, 
        paymentURI: paymentURI,
        thumbnailURI: "",
        rfcState: 1, 
        addressState: 1, 
        bankAccountState: 1, 
        paymentState: 1,
        verified: false
    })
}