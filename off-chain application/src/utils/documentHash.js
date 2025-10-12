import CryptoJS from "crypto-js";

/**
 * Crear hash SHA-256 de un archivo
 * @param {File} file - Archivo del cual calcular el hash
 * @returns {Promise<string>} Hash del archivo en formato hexadecimal
 */
export const createHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const wordArray = CryptoJS.lib.WordArray.create(event.target.result);
        const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
        resolve(hash);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Verificar si el hash de un archivo coincide con un hash dado
 * @param {File} file - Archivo a verificar
 * @param {string} expectedHash - Hash esperado
 * @returns {Promise<boolean>} true si coincide, false si no
 */
export const checkHash = async (file, expectedHash) => {
  try {
    const calculatedHash = await createHash(file);
    return calculatedHash === expectedHash;
  } catch (error) {
    console.error("Error checking hash:", error);
    return false;
  }
};

/**
 * Generar un ID único para el documento
 * @param {string} fileName - Nombre del archivo
 * @param {string} hash - Hash del archivo
 * @returns {string} ID único del documento
 */
export const generateDocumentId = (fileName, hash) => {
  const timestamp = Date.now();
  const combinedString = `${fileName}-${hash}-${timestamp}`;
  const id = CryptoJS.SHA256(combinedString).toString(CryptoJS.enc.Hex);
  return id.substring(0, 16); // Usar solo los primeros 16 caracteres
};

export default {
  createHash,
  checkHash,
  generateDocumentId,
};
