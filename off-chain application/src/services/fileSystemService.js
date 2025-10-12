/**
 * Servicio para gestionar el almacenamiento de archivos en el filesystem
 * Nota: En un navegador, usamos localStorage para simular el filesystem
 * En producción, esto debería ser un servidor backend real
 */

const STORAGE_KEY = "document_registry_files";
const METADATA_KEY = "document_registry_metadata";

class FileSystemService {
  constructor() {
    this.basePath = "../database filesystem/";
  }

  /**
   * Guardar archivo en el filesystem (simulado con localStorage)
   * @param {File} file - Archivo a guardar
   * @param {string} documentId - ID del documento
   * @param {string} hash - Hash del documento
   * @returns {Promise<string>} Path donde se guardó el archivo
   */
  async saveFile(file, documentId, hash) {
    try {
      // Crear path único para el archivo
      const fileName = file.name;
      const path = `${this.basePath}${documentId}/${fileName}`;

      // Leer archivo como base64
      const base64 = await this.fileToBase64(file);

      // Obtener archivos existentes
      const files = this.getAllFiles();

      // Guardar archivo
      files[documentId] = {
        fileName: fileName,
        path: path,
        base64: base64,
        size: file.size,
        type: file.type,
        hash: hash,
        uploadedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

      // Guardar metadata
      this.saveMetadata(documentId, {
        fileName,
        path,
        size: file.size,
        type: file.type,
        hash,
        uploadedAt: new Date().toISOString(),
      });

      console.log(`File saved at: ${path}`);
      return path;
    } catch (error) {
      console.error("Error saving file:", error);
      throw error;
    }
  }

  /**
   * Obtener archivo del filesystem
   * @param {string} documentId - ID del documento
   * @returns {Object} Información del archivo
   */
  getFile(documentId) {
    try {
      const files = this.getAllFiles();
      const file = files[documentId];

      if (!file) {
        throw new Error(`File not found for document ID: ${documentId}`);
      }

      return file;
    } catch (error) {
      console.error("Error getting file:", error);
      throw error;
    }
  }

  /**
   * Descargar archivo
   * @param {string} documentId - ID del documento
   */
  downloadFile(documentId) {
    try {
      const file = this.getFile(documentId);

      // Convertir base64 a blob
      const byteCharacters = atob(file.base64.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`File downloaded: ${file.fileName}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  /**
   * Eliminar archivo del filesystem
   * @param {string} documentId - ID del documento
   */
  deleteFile(documentId) {
    try {
      const files = this.getAllFiles();

      if (!files[documentId]) {
        throw new Error(`File not found for document ID: ${documentId}`);
      }

      delete files[documentId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

      // Eliminar metadata
      this.deleteMetadata(documentId);

      console.log(`File deleted for document ID: ${documentId}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  /**
   * Obtener todos los archivos
   * @returns {Object} Todos los archivos almacenados
   */
  getAllFiles() {
    const filesJson = localStorage.getItem(STORAGE_KEY);
    return filesJson ? JSON.parse(filesJson) : {};
  }

  /**
   * Verificar si un archivo existe
   * @param {string} documentId - ID del documento
   * @returns {boolean} true si existe, false si no
   */
  fileExists(documentId) {
    const files = this.getAllFiles();
    return !!files[documentId];
  }

  /**
   * Guardar metadata del documento
   */
  saveMetadata(documentId, metadata) {
    const allMetadata = this.getAllMetadata();
    allMetadata[documentId] = metadata;
    localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
  }

  /**
   * Obtener metadata de un documento
   */
  getMetadata(documentId) {
    const allMetadata = this.getAllMetadata();
    return allMetadata[documentId] || null;
  }

  /**
   * Obtener toda la metadata
   */
  getAllMetadata() {
    const metadataJson = localStorage.getItem(METADATA_KEY);
    return metadataJson ? JSON.parse(metadataJson) : {};
  }

  /**
   * Eliminar metadata de un documento
   */
  deleteMetadata(documentId) {
    const allMetadata = this.getAllMetadata();
    delete allMetadata[documentId];
    localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
  }

  /**
   * Convertir archivo a base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Obtener estadísticas del filesystem
   */
  getStats() {
    const files = this.getAllFiles();
    const fileIds = Object.keys(files);

    let totalSize = 0;
    const fileTypes = {};

    fileIds.forEach((id) => {
      const file = files[id];
      totalSize += file.size;

      const type = file.type || "unknown";
      fileTypes[type] = (fileTypes[type] || 0) + 1;
    });

    return {
      totalFiles: fileIds.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      fileTypes: fileTypes,
    };
  }

  /**
   * Limpiar todo el filesystem (usar con cuidado)
   */
  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(METADATA_KEY);
    console.log("Filesystem cleared");
  }
}

export default new FileSystemService();
