import { pool } from "../config/database.js"
import { Storage } from "@google-cloud/storage"
import { format } from "util"
import lodash from "lodash"
import jwt from "jsonwebtoken"

export const postSupplier = async (req, res) => {
    const { nameSupplier, name, lastName, email, phone, address } = req.body

    if (!req.session.token) return res.json({
        "message": "Sesión no iniciada"
    })

    if (!nameSupplier || !name || !lastName || !email || !phone || !address || !req.files) return res.json({
        "message": "Faltan datos"
    })

    if (!req.files.rfc || !req.files.address || !req.files.bankAccount || !req.files.payment) return res.json({
        "message": "Faltan imagenes"
    })

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)

    const nameSupplierEsc = lodash.escape(nameSupplier)
    const nameEsc = lodash.escape(name)
    const lastNameEsc = lodash.escape(lastName)
    const emailEsc = lodash.escape(email)
    const phoneEsc = lodash.escape(phone)
    const addressEsc = lodash.escape(address)

    const projectId = process.env.GCLOUD_PROJECT_ID
    const keyFilename = process.env.GCLOUD_KEY
    const bucketName = process.env.GCLOUD_STORAGE_BUCKET_SUPPLIERS

    const storage = new Storage({ projectId, keyFilename })
    const bucket = storage.bucket(bucketName)

    const rfcFilename = req.files.rfc[0].filename
    await bucket.upload(req.files.rfc[0].path, {destination: `${nameEsc}/${rfcFilename}`})
    const rfcURI = format(`https://storage.googleapis.com/${bucket.name}/${nameEsc}/${rfcFilename}`)

    const addressFilename = req.files.address[0].filename
    await bucket.upload(req.files.address[0].path, {destination: `${nameEsc}/${addressFilename}`})
    const addressURI = format(`https://storage.googleapis.com/${bucket.name}/${nameEsc}/${addressFilename}`)

    const bankAccountFilename = req.files.bankAccount[0].filename
    await bucket.upload(req.files.bankAccount[0].path, {destination: `${nameEsc}/${bankAccountFilename}`})
    const bankAccountURI = format(`https://storage.googleapis.com/${bucket.name}/${nameEsc}/${bankAccountFilename}`)

    const paymentFilename = req.files.payment[0].filename
    await bucket.upload(req.files.payment[0].path, {destination: `${nameEsc}/${paymentFilename}`})
    const paymentURI = format(`https://storage.googleapis.com/${bucket.name}/${nameEsc}/${paymentFilename}`)

    const [rows] = await pool.query("INSERT INTO suppliers(nameSupplier, name, lastName, phone, email, address, idUser, rfcURI, addressURI, bankAccountURI, paymentURI, thumbnailURI) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
    [nameSupplierEsc, nameEsc, lastNameEsc, parseInt(phoneEsc), emailEsc, addressEsc, decoded.id, rfcURI, addressURI, bankAccountURI, paymentURI, ""])
    
    res.json({ 
        "id": rows.insertId, 
        nameSupplier: nameSupplierEsc, 
        name: nameEsc, 
        lastName: lastNameEsc, 
        phone: parseInt(phoneEsc), 
        email: emailEsc, 
        address: addressEsc, 
        idUser: decoded.id, 
        rfcURI: rfcURI, 
        addressURI: addressURI, 
        bankAccountURI: bankAccountURI, 
        paymentURI: paymentURI,
        thumbnailURI: ""
    })
}