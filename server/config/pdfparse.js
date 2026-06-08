import pdf from 'pdf-parse';

const parsePdf = async (buffer) => {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (err) {
        throw err;
    }
}

export default parsePdf;