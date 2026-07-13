import parseDocx from "../config/docxparse.js";
import parsePdf from "../config/pdfparse.js";

const extractText = async (file) => {
    switch (file.mimetype) {
        case "application/pdf":
            return parsePdf(file.buffer);
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return parseDocx(file.buffer);
        default:
            throw new Error("Unsupported file type");
    }
};

export default extractText;