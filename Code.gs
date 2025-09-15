// --- KONFIGURASI WAJIB ---
const SHEET_ID = '1wwaJ1igtl5xU-kCYsN4gKvUwUDdnJRZl0knVLOEnmuQ';
const FOLDER_PERMOHONAN_ID = '1Movtc1ya5Yi4u2M0VjZTuCiFOSytkMLx';
const FOLDER_SOP_ID = '1zeVp0qsWItOOsxYlfVSUIB8Z8MwEbUsu';
const ADMIN_TOKEN_VALIDITY_HOURS = 2;

// --- NAMA-NAMA SHEET ---
const SHEET_NAMES = {
  SOP: "SOP",
  PERMOHONAN: "Permohonan",
  ADMINS: "Admins"
};

// --- ROUTER UTAMA ---
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    // [PERBAIKAN] Rute Publik yang tidak memerlukan token
    switch(action) {
        case 'getData':
            return createJsonResponse(handleGetDataNoCache(params.sheetName)); // Halaman utama pakai ini
        case 'addPermohonan':
            return createJsonResponse(handleCreatePermohonan(params)); // Halaman utama pakai ini
        case 'adminLogin':
            return createJsonResponse(handleAdminLogin(params.username, params.password));
    }

    // Validasi Token untuk Rute Admin
    const tokenPayload = isTokenValid(params.authToken);
    if (!tokenPayload) return createJsonResponse({ status: 'error', message: 'Aksi tidak diizinkan atau token tidak valid.' });
    params.adminEmail = tokenPayload.email;

    switch (action) {
      case 'adminGetPermohonan': return createJsonResponse(handleGetDataNoCache(SHEET_NAMES.PERMOHONAN));
      case 'adminGetSOP': return createJsonResponse(handleGetDataNoCache(SHEET_NAMES.SOP));
      
      // CRUD Permohonan (Admin)
      case 'adminUpdatePermohonan': return createJsonResponse(handleUpdatePermohonan(params));
      case 'adminDeletePermohonan': return createJsonResponse(handleDeleteRowById(params.id, SHEET_NAMES.PERMOHONAN, 'IDPermohonan'));
      
      // CRUD SOP (Admin)
      case 'adminCreateSOP': return createJsonResponse(handleCreateSOP(params));
      case 'adminUpdateSOP': return createJsonResponse(handleUpdateSOP(params));
      case 'adminDeleteSOP': return createJsonResponse(handleDeleteRowByRowIndex(params.rowIndex, SHEET_NAMES.SOP));
      
      default: throw new Error('Aksi admin tidak dikenal.');
    }
  } catch (error) {
    Logger.log(`Error: ${error.stack}`);
    return createJsonResponse({ status: 'error', message: `Server Error: ${error.message}` });
  }
}

// --- FUNGSI PEMBUATAN ID OTOMATIS ---
function generateIDSOP(nomorSop) {
    if (!nomorSop) return `SOP-${Date.now()}`; // Fallback
    const yearMatch = nomorSop.match(/\/(\d{4})$/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    const numMatch = nomorSop.match(/^(\d+)\//);
    const number = numMatch ? numMatch[1] : '0';
    return `SOP-${year}-${number}`;
}

// --- HANDLER ---
function handleCreatePermohonan(params) {
    const { data, fileInfo } = params;
    if (fileInfo && fileInfo.fileData) {
        data.File = uploadFileToDrive(fileInfo, FOLDER_PERMOHONAN_ID, data.Unit);
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.PERMOHONAN);
    const headers = getHeaders(sheet);
    data.IDPermohonan = `PERM-${Date.now()}`;
    data.Timestamp = new Date();
    const newRow = headers.map(header => data[header] || "");
    sheet.appendRow(newRow);
    return { status: 'success', message: 'Permohonan baru berhasil ditambahkan.' };
}

function handleUpdatePermohonan(params) {
    const { id, data, fileInfo } = params;
    if (fileInfo && fileInfo.fileData) {
        data.File = uploadFileToDrive(fileInfo, FOLDER_PERMOHONAN_ID, data.Unit);
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.PERMOHONAN);
    return updateRowById(id, data, sheet, 'IDPermohonan');
}

function handleCreateSOP(params) {
    const { data, fileInfo } = params;
    data.IDSOP = generateIDSOP(data['Nomor SOP']); // Generate IDSOP
    if (fileInfo && fileInfo.fileData) {
        data.File = uploadAndNameSopFile(data, fileInfo);
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.SOP);
    const headers = getHeaders(sheet);
    const newRow = headers.map(header => data[header] || "");
    sheet.appendRow(newRow);
    return { status: 'success', message: 'SOP baru berhasil ditambahkan.' };
}

function handleUpdateSOP(params) {
    const { rowIndex, data, fileInfo } = params;
    data.IDSOP = generateIDSOP(data['Nomor SOP']); // Re-generate IDSOP on update
    if (fileInfo && fileInfo.fileData) {
        data.File = uploadAndNameSopFile(data, fileInfo);
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.SOP);
    const headers = getHeaders(sheet);
    const updatedRow = headers.map(header => data[header] || "");
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
    return { status: 'success', message: 'SOP berhasil diperbarui.' };
}

// --- FUNGSI BANTU ---
function uploadAndNameSopFile(sopData, fileInfo) {
  try {
    const { fileName } = fileInfo;
    const nomorSop = sopData['Nomor SOP'] || '';
    const yearMatch = nomorSop.match(/\/(\d{4})$/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    const numMatch = nomorSop.match(/^(\d+)\//);
    const number = numMatch ? numMatch[1] : '0';
    const sanitize = (str) => (str || '').replace(/[^a-zA-Z0-9 -]/g, "").replace(/\s+/g, '_');
    const newFileName = `SOP-${year}-${number}_${sanitize(sopData.Unit)}_${sanitize(sopData['Nama SOP'])}.${fileName.split('.').pop()}`;
    return uploadFileToDrive(fileInfo, FOLDER_SOP_ID, sopData.Unit, newFileName, year);
  } catch(e) {
    Logger.log(`SOP File Upload Error: ${e.toString()}`);
    return `Error: ${e.message}`;
  }
}

function uploadFileToDrive(fileInfo, parentFolderId, unitName, customFileName = null, year = null) {
    const { fileData, fileName, fileType } = fileInfo;
    const parentFolder = DriveApp.getFolderById(parentFolderId);
    const yearFolder = getOrCreateFolder(parentFolder, year || new Date().getFullYear().toString());
    const unitFolder = getOrCreateFolder(yearFolder, unitName || 'Lain-lain');
    const finalFileName = customFileName || fileName;
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData.split(',')[1]), fileType, finalFileName);
    return unitFolder.createFile(blob).getUrl();
}

function updateRowById(id, dataToUpdate, sheet, idColumnName) {
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const idColIndex = headers.indexOf(idColumnName);
    if (idColIndex === -1) throw new Error(`Kolom ID '${idColumnName}' tidak ditemukan.`);
    const rowIndex = data.findIndex(row => row[idColIndex] == id);
    if (rowIndex > -1) {
        const rowToUpdate = rowIndex + 2;
        headers.forEach((header, index) => {
            if (dataToUpdate.hasOwnProperty(header)) {
                sheet.getRange(rowToUpdate, index + 1).setValue(dataToUpdate[header]);
            }
        });
        return { status: 'success', message: 'Data berhasil diperbarui.' };
    } else {
        return { status: 'error', message: `Data dengan ID ${id} tidak ditemukan.` };
    }
}

function handleGetDataNoCache(sheetName) { return { status: 'success', data: getDataFromSheet(sheetName) }; }

function handleAdminLogin(username, password) {
    const adminSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.ADMINS);
    if (!adminSheet) throw new Error("Sheet 'Admins' tidak ditemukan.");
    const data = adminSheet.getDataRange().getValues();
    const adminUser = data.find(row => row[0] === username && row[1] === password);
    if (adminUser) {
        const email = adminUser[2];
        const token = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Math.random().toString())).slice(0, 32);
        const expiration = new Date().getTime() + ADMIN_TOKEN_VALIDITY_HOURS * 3600 * 1000;
        PropertiesService.getScriptProperties().setProperty(token, JSON.stringify({ email: email, expires: expiration }));
        return { status: 'success', token: token, email: email };
    } else {
        return { status: 'error', message: 'Username atau password salah.' };
    }
}

function handleDeleteRowByRowIndex(rowIndex, sheetName) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
    sheet.deleteRow(rowIndex);
    return { status: 'success', message: 'Data berhasil dihapus.' };
}

function handleDeleteRowById(id, sheetName, idColumnName) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    const idColIndex = data[0].indexOf(idColumnName);
    if (idColIndex === -1) throw new Error(`Kolom ID '${idColumnName}' tidak ditemukan.`);
    const rowIndex = data.findIndex(row => row[idColIndex] == id);
    if (rowIndex > 0) {
        sheet.deleteRow(rowIndex + 1);
        return { status: 'success', message: 'Data berhasil dihapus.' };
    } else {
        return { status: 'error', message: `Data dengan ID ${id} tidak ditemukan.` };
    }
}

function isTokenValid(token) {
    if (!token) return false;
    const tokenData = PropertiesService.getScriptProperties().getProperty(token);
    if (!tokenData) return false;
    const data = JSON.parse(tokenData);
    if (new Date().getTime() > data.expires) {
        PropertiesService.getScriptProperties().deleteProperty(token);
        return false;
    }
    return data;
}

function createJsonResponse(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

function sheetToJSON(sheet) {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data.shift();
    return data.map((row, index) => {
        const obj = { rowIndex: index + 2 };
        headers.forEach((header, i) => {
            obj[header] = row[i] instanceof Date ? row[i].toISOString() : row[i];
        });
        return obj;
    });
}

function getHeaders(sheet) { 
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; 
}

function getOrCreateFolder(parentFolder, childFolderName) {
    const folders = parentFolder.getFoldersByName(childFolderName);
    return folders.hasNext() ? folders.next() : parentFolder.createFolder(childFolderName);
}

function getDataFromSheet(sheetName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet '${sheetName}' tidak ditemukan.`);
  return sheetToJSON(sheet);
}

