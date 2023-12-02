import { format } from "util"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"
import path from "path"
import fsExtra from "fs-extra";
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const compressAndUpload = async (filePath, bucket, nameFolder) => {
    const compressionQuality = 80
    const nameUUID = `${uuidv4()}.webp`
    const uriCompressed = path.join(__dirname, `../public/img/uploads/${nameUUID}`)
    await sharp(filePath).webp({quality: compressionQuality}).toFile(uriCompressed)
    await fsExtra.unlink(filePath)
    await bucket.upload(uriCompressed, {destination: `${nameFolder}/${nameUUID}`})
    const uri = format(`https://storage.googleapis.com/${bucket.name}/${nameFolder}/${nameUUID}`)
    await fsExtra.unlink(uriCompressed)
    return uri
}