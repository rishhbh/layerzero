import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const parsePdf = async (buffer) => {
    const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer)
    }).promise;

    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        const content = await page.getTextContent();

        text += content.items
            .map(item => item.str)
            .join(" ");

        text += "\n";
    }

    return text;
};

export default parsePdf;