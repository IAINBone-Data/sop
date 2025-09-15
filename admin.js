// --- KONFIGURASI WAJIB ---
const SHEET_ID = '1wwaJ1igtl5xU-kCYsN4gKvUwUDdnJRZl0knVLOEnmuQ';
const DRIVE_FOLDER_ID = '1Movtc1ya5Yi4u2M0VjZTuCiFOSytkMLx';
const ADMIN_TOKEN_VALIDITY_HOURS = 2; // Token admin akan valid selama 2 jam

// --- NAMA-NAMA SHEET ---
const SHEET_NAMES = {
  SOP: "SOP",
  PERMOHONAN: "Permohonan",
  ADMINS: "Admins" // Pastikan Anda memiliki sheet ini
};

// =================================================================
// FUNGSI UTAMA (ROUTER)
// =================================================================

function doPost(e) {
  let response;
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    // --- Rute Publik (Tidak memerlukan otentikasi) ---
    switch (action) {
      case 'getData':
        return createJsonResponse(handleGetDataWithCache(params.sheetName));
      case 'addPermohonan':
        return createJsonResponse(handleAddPermohonan(params));
      case 'adminLogin':
        return createJsonResponse(handleAdminLogin(params.username, params.password));
    }

    // --- Rute Admin (Memerlukan otentikasi token) ---
    const token = params.authToken;
    const tokenPayload = isTokenValid(token);
    if (!tokenPayload) {
      return createJsonResponse({ status: 'error', message: 'Token tidak valid' });
    }
    
    params.adminEmail = tokenPayload.email;

    switch (action) {
      case 'adminGetPermohonan':
        return createJsonResponse(handleGetDataNoCache(SHEET_NAMES.PERMOHONAN));
      case 'adminGetSOP':
        return createJsonResponse(handleGetDataNoCache(SHEET_NAMES.SOP));
      case 'adminUpdatePermohonan':
        return createJsonResponse(handleUpdatePermohonanStatus(params));
      // Fungsi CRUD SOP
      case 'adminCreateSOP':
        return createJsonResponse(handleCreateSOP(params));
      case 'adminUpdateSOP':
        return createJsonResponse(handleUpdateSOP(params));
      case 'adminDeleteSOP':
        return createJsonResponse(handleDeleteSOP(params));
      default:
        throw new Error('Aksi admin tidak valid.');
    }

  } catch (error) {
    Logger.log(`Error in doPost: ${error.toString()}`);
    response = { status: 'error', message: `Server Error: ${error.message}` };
  }
  return createJsonResponse(response);
}

// =================================================================
// HANDLER PUBLIK
// =================================================================

function handleGetDataWithCache(sheetName) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `data_${sheetName}`;
  const cached = cache.get(cacheKey);

  if (cached != null) {
    return { status: 'success', data: JSON.parse(cached), source: 'cache' };
  }

  const data = getDataFromSheet(sheetName);
  cache.put(cacheKey, JSON.stringify(data), 21600); // Cache for 6 hours
  return { status: 'success', data: data, source: 'sheet' };
}

function handleAddPermohonan(params) {
  const { unit, namaSop, idPermohonan, timestamp, fileData, fileName, fileType } = params;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.PERMOHONAN);

  let fileUrl = '';
  if (fileData && fileName) {
    fileUrl = createFileInDrive(unit, namaSop, fileData, fileName, fileType);
  }
  
  const newRow = [idPermohonan, new Date(timestamp), unit, namaSop, 'Diajukan', '', fileUrl, '', ''];
  sheet.appendRow(newRow);
  
  CacheService.getScriptCache().remove(`data_${SHEET_NAMES.PERMOHONAN}`);
  return { status: 'success', message: 'Permohonan berhasil ditambahkan.' };
}


// =================================================================
// HANDLER & FUNGSI ADMIN
// =================================================================

function handleAdminLogin(username, password) {
  const adminSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.ADMINS);
  if (!adminSheet) throw new Error("Sheet 'Admins' tidak ditemukan.");
  
  const data = adminSheet.getDataRange().getValues();
  const adminUser = data.find(row => row[0] === username && row[1] === password);

  if (adminUser) {
    const email = adminUser[2];
    const token = Utilities.base64Encode(Math.random().toString());
    const expiration = new Date().getTime() + ADMIN_TOKEN_VALIDITY_HOURS * 3600 * 1000;
    
    PropertiesService.getScriptProperties().setProperty(token, JSON.stringify({ email: email, expires: expiration }));
    
    return { status: 'success', token: token, email: email };
  } else {
    return { status: 'error', message: 'Username atau password salah.' };
  }
}

function handleGetDataNoCache(sheetName) {
  const data = getDataFromSheet(sheetName);
  return { status: 'success', data: data, source: 'sheet' };
}

function handleUpdatePermohonanStatus(params) {
  const { id, newStatus, keterangan, adminEmail } = params;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.PERMOHONAN);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const idColIndex = headers.indexOf('IDPermohonan');
  const statusColIndex = headers.indexOf('Status');
  const keteranganColIndex = headers.indexOf('Keterangan');
  const updatedByColIndex = headers.indexOf('Diperbarui Oleh');
  const updatedDateColIndex = headers.indexOf('Tgl Diperbarui');

  if (idColIndex === -1) throw new Error("Kolom 'IDPermohonan' tidak ditemukan.");

  const rowIndex = data.findIndex(row => row[idColIndex] == id);

  if (rowIndex > -1) {
    const rowToUpdate = rowIndex + 2; // +2 because findIndex is 0-based and headers are removed
    sheet.getRange(rowToUpdate, statusColIndex + 1).setValue(newStatus);
    sheet.getRange(rowToUpdate, keteranganColIndex + 1).setValue(keterangan);
    sheet.getRange(rowToUpdate, updatedByColIndex + 1).setValue(adminEmail);
    sheet.getRange(rowToUpdate, updatedDateColIndex + 1).setValue(new Date());
    
    CacheService.getScriptCache().remove(`data_${SHEET_NAMES.PERMOHONAN}`);
    return { status: 'success', message: 'Status permohonan berhasil diperbarui.' };
  } else {
    return { status: 'error', message: `Permohonan dengan ID ${id} tidak ditemukan.` };
  }
}

function handleCreateSOP(params) {
  const { data } = params;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.SOP);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Buat baris baru dengan urutan yang benar sesuai header
  const newRow = headers.map(header => data[header] || "");
  
  sheet.appendRow(newRow);
  
  CacheService.getScriptCache().remove(`data_${SHEET_NAMES.SOP}`);
  return { status: 'success', message: 'SOP baru berhasil ditambahkan.' };
}

function handleUpdateSOP(params) {
  const { rowIndex, data } = params;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.SOP);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const updatedRow = headers.map(header => data[header] || "");

  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);

  CacheService.getScriptCache().remove(`data_${SHEET_NAMES.SOP}`);
  return { status: 'success', message: 'SOP berhasil diperbarui.' };
}

function handleDeleteSOP(params) {
  const { rowIndex } = params;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAMES.SOP);
  
  sheet.deleteRow(rowIndex);
  
  CacheService.getScriptCache().remove(`data_${SHEET_NAMES.SOP}`);
  return { status: 'success', message: 'SOP berhasil dihapus.' };
}


// =================================================================
// FUNGSI-FUNGSI BANTU (HELPERS)
// =================================================================

function getDataFromSheet(sheetName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet '${sheetName}' tidak ditemukan.`);
  return sheetToJSON(sheet);
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

function createFileInDrive(unit, namaSop, fileData, fileName, fileType) {
  const cleanUnit = unit.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const cleanNamaSop = namaSop.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const extension = fileName.split('.').pop();
  const newFileName = `${cleanUnit}-${cleanNamaSop}.${extension}`;
  
  const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const year = new Date().getFullYear().toString();
  const yearFolder = getOrCreateFolder(parentFolder, year);
  const unitFolder = getOrCreateFolder(yearFolder, cleanUnit);

  const decodedData = Utilities.base64Decode(fileData.split(',')[1]);
  const blob = Utilities.newBlob(decodedData, fileType, newFileName);
  const file = unitFolder.createFile(blob);
  return file.getUrl();
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
      if (row[i] instanceof Date) {
        obj[header] = row[i].toISOString();
      } else {
        obj[header] = row[i];
      }
    });
    return obj;
  });
}

function getOrCreateFolder(parentFolder, childFolderName) {
  const folders = parentFolder.getFoldersByName(childFolderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(childFolderName);
}

