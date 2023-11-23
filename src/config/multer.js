import multer from "multer";
import { v4 } from "uuid";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../public/img/uploads"),
    //destination: "src/public/uploads",
    filename: (req, file, cb) => {
        cb(null, v4() + path.extname(file.originalname))
    }
})

export default multer({storage: multer.memoryStorage()})