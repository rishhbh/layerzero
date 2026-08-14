import crypto from "crypto";

const hashContent = (content) => {
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
};

export default hashContent;
