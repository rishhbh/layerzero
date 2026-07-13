import crypto from "crypto";

const hashContent = (content) => {
  const contentHash = crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");

  return contentHash;
};

export default hashContent;