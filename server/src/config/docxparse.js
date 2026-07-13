import mammoth from 'mammoth';

const parseDocx = async (buffer) => {
    const result = await mammoth.extractRawText({
        buffer
    });
    return result.value;
};

export default parseDocx;