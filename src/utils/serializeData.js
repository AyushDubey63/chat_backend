import crypto from "crypto";

// Encryption function
function encryptData(data) {
  const key = crypto
    .createHash("sha256")
    .update(String(process.env.SERIALIZE_SECRET))
    .digest(); // Ensure the key is exactly 32 bytes
  const iv = crypto.randomBytes(16); // Generate a random 16-byte IV
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`; // Return both IV and encrypted data
}

// Decrypt function
function decryptData(encryptedData) {
  console.log("Encrypted Data:", encryptedData); // For debugging

  // Decode URL-encoded string if necessary
  const decodedData = decodeURIComponent(encryptedData);

  const key = crypto
    .createHash("sha256")
    .update(String(process.env.SERIALIZE_SECRET))
    .digest(); // Ensure the key is exactly 32 bytes

  // Split IV and encrypted text
  const [ivHex, encryptedText] = decodedData.split(":");
  const iv = Buffer.from(ivHex, "hex"); // Convert IV back to Buffer
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { encryptData, decryptData };
