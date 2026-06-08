import pdf from 'pdf-parse';

const parsePdf = async (req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({
                message: "No file uploaded!"
            });
        }
        const data = await pdf(req.file.buffer);

        return res.json({
            text: data.text
        });

    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
}

export default parsePdf;