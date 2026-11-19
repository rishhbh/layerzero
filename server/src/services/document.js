import parseDocx from "../config/docxparse.js";
import parsePdf from "../config/pdfparse.js";

const extractText = async (file) => {
    switch (file.mimetype) {
        case "application/pdf":
            return {
                content: await parsePdf(file.buffer), 
                type: "pdf"
            }
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return {
                content: await parseDocx(file.buffer),
                type: "docx"
            }
        default:
            throw new Error("Unsupported file type");
    }
};

export default extractText;