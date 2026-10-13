function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  // API JSONP untuk frontend statis di GitHub Pages. Jangan gunakan untuk data sensitif.
  if (p.action) {
    var result;
    try { result = JSON.parse(apiRouter(String(p.action), p.data || null)); }
    catch (err) { result = {status:'error', message:err.message || String(err)}; }
    var callback = String(p.callback || '');
    var payload = JSON.stringify(result);
    if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      return ContentService.createTextOutput(callback + '(' + payload + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
  }
  var html = HtmlService.createHtmlOutputFromFile('Index');
  html.setTitle('Aplikasi Game Edukasi - Siswa Berprestasi');
  html.addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function apiRouter(action, data) {
  var result = {status: 'error', message: 'Action not found'};
  try {
    // Client mengirim object/array sebagai JSON string. Parse hanya jika memang object/array JSON.
    if (typeof data === 'string') {
      var trimmed = data.trim();
      if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
        try { data = JSON.parse(trimmed); } catch (parseErr) {
          throw new Error('Format data JSON tidak valid: ' + parseErr.message);
        }
      }
    }
    // Pastikan sheet tersedia walaupun request pertama bukan apiGetAllData.
    if (action !== 'apiGetAllData') setupDatabase();
    if (action === 'apiGetAllData') result = apiGetAllData();
    else if (action === 'apiSaveKelas') result = apiSaveKelas(data);
    else if (action === 'apiUpdateKelas') result = apiUpdateKelas(data);
    else if (action === 'apiDeleteKelas') result = apiDeleteRow('Kelas', data);
    else if (action === 'apiResetKelas') result = apiResetSheet('Kelas');
    
    else if (action === 'apiSaveKategori') result = apiSaveKategori(data);
    else if (action === 'apiUpdateKategori') result = apiUpdateKategori(data);
    else if (action === 'apiDeleteKategori') result = apiDeleteRow('Kategori', data);
    
    else if (action === 'apiSaveSiswaBatch') result = apiSaveSiswaBatch(data);
    else if (action === 'apiUpdateSiswa') result = apiUpdateSiswa(data);
    else if (action === 'apiDeleteSiswa') result = apiDeleteRow('Siswa', data);
    else if (action === 'apiResetSiswa') result = apiResetSheet('Siswa');
    
    else if (action === 'apiSaveSoalBatch') result = apiSaveSoalBatch(data);
    else if (action === 'apiUpdateSoal') result = apiUpdateSoal(data);
    else if (action === 'apiDeleteSoal') result = apiDeleteRow('Soal', data);
    else if (action === 'apiResetSoal') result = apiResetSheet('Soal');
    
    else if (action === 'apiSaveNilaiBatch') result = apiSaveNilaiBatch(data);
    else if (action === 'apiSaveAbsensiBatch') result = apiSaveAbsensiBatch(data);
    else if (action === 'apiSavePengaturan') result = apiSavePengaturan(data);
  } catch(err) { 
    result = {status: 'error', message: err.message}; 
  }
  
  // PERBAIKAN KRUSIAL: Return sebagai string JSON. 
  // Mencegah google.script.run mati mendadak saat mengirim data besar ke browser.
  return JSON.stringify(result);
}

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = {
    "Pengaturan": [["Kunci", "Nilai"], ["app_title", "SISWA SISWI BERPRESTASI"], ["school_name", "MTS DARUL HIKMAH"], ["guide_name", "Nur M Muridan"], ["quote_ar", "مَنْ جَدَّ وَجَدَ"], ["quote_id", "Barangsiapa bersungguh-sungguh, ia akan berhasil"], ["academic_year", "2026/2027"], ["logo_url", ""]],
    "Kelas": [["ID", "Nama_Kelas"]],
    "Kategori": [["ID", "Nama_Kategori"]],
    "Siswa": [["ID", "Kelas", "Gender", "Nama"]],
    "Soal": [["ID", "Kategori", "Tipe_Game", "Image_URL", "Pertanyaan", "Jawaban_Atau_Kunci"]],
    "Nilai": [["Waktu", "Kelas", "Mode_Siswa", "Nama_Siswa", "Skor", "Tipe_Game", "Kategori"]],
    "Absensi": [["Waktu", "Tanggal", "Kelas", "ID_Siswa", "Nama_Siswa", "Status"]]
  };

  for (var name in sheets) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      if (name === "Pengaturan") sheet.getRange(1, 1, sheets[name].length, 2).setValues(sheets[name]);
      else sheet.appendRow(sheets[name][0]);
      sheet.getRange("A1:" + String.fromCharCode(64 + sheets[name][0].length) + "1").setFontWeight("bold");
    }
  }
}

function apiGetAllData() {
  setupDatabase(); var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    status: 'success', spreadsheet_url: ss.getUrl(),
    pengaturan: getSheetDataAsDict(ss.getSheetByName("Pengaturan"), 0, 1),
    kelas: getSheetDataAsArrayOfObjects(ss.getSheetByName("Kelas")),
    kategori: getSheetDataAsArrayOfObjects(ss.getSheetByName("Kategori")),
    siswa: getSheetDataAsArrayOfObjects(ss.getSheetByName("Siswa")),
    soal: getSheetDataAsArrayOfObjects(ss.getSheetByName("Soal")),
    nilai: getSheetDataAsArrayOfObjects(ss.getSheetByName("Nilai")),
    absensi: getSheetDataAsArrayOfObjects(ss.getSheetByName("Absensi"))
  };
}

function apiSaveKelas(nama) { var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Kelas"); sh.appendRow(["K" + Utilities.getUuid(), String(nama || '').trim()]); return {status: 'success'}; }
function apiSaveKategori(nama) { var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Kategori"); sh.appendRow(["KT" + Utilities.getUuid(), String(nama || '').trim()]); return {status: 'success'}; }
function apiSaveSiswaBatch(arr) { if(!Array.isArray(arr) || arr.length===0) return {status: 'success'}; var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Siswa"); var rows = []; for(var i=0; i<arr.length; i++) rows.push(["U" + Utilities.getUuid(), arr[i].kelas, arr[i].gender, arr[i].nama]); sh.getRange(sh.getLastRow()+1, 1, rows.length, 4).setValues(rows); return {status: 'success'}; }
function apiSaveSoalBatch(arr) { if(!Array.isArray(arr) || arr.length===0) return {status: 'success'}; var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Soal"); var rows = []; for(var i=0; i<arr.length; i++) rows.push(["S" + Utilities.getUuid(), arr[i].kategori, arr[i].tipe, arr[i].image, arr[i].pertanyaan, arr[i].jawaban]); sh.getRange(sh.getLastRow()+1, 1, rows.length, 6).setValues(rows); return {status: 'success'}; }
function apiSaveNilaiBatch(arr) { if(!Array.isArray(arr) || arr.length===0) return {status: 'success'}; var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Nilai"); var d = new Date().toISOString(); var rows = []; for(var i=0; i<arr.length; i++) rows.push([d, arr[i].kelas, arr[i].mode, arr[i].nama, arr[i].skor, arr[i].game, arr[i].kategori]); sh.getRange(sh.getLastRow()+1, 1, rows.length, 7).setValues(rows); return {status: 'success'}; }
function apiSaveAbsensiBatch(arr) { if(!Array.isArray(arr) || arr.length===0) return {status: 'success'}; var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Absensi"); var d = new Date().toISOString(); var rows = []; for(var i=0; i<arr.length; i++) rows.push([d, arr[i].tanggal, arr[i].kelas, arr[i].id_siswa, arr[i].nama, arr[i].status]); sh.getRange(sh.getLastRow()+1, 1, rows.length, 6).setValues(rows); return {status: 'success'}; }

function apiUpdateKelas(d) { return updateRow('Kelas', d.id, [d.nama], 2); }
function apiUpdateKategori(d) { return updateRow('Kategori', d.id, [d.nama], 2); }
function apiUpdateSiswa(d) { return updateRow('Siswa', d.id, [d.kelas, d.gender, d.nama], 2); }
function apiUpdateSoal(d) { return updateRow('Soal', d.id, [d.kategori, d.tipe, d.image, d.pertanyaan, d.jawaban], 2); }

function updateRow(sheetName, id, valuesArr, startCol) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) { if (data[i][0] === id) { sh.getRange(i+1, startCol, 1, valuesArr.length).setValues([valuesArr]); return {status: 'success'}; } }
  return {status: 'error', message: 'Data dengan ID tersebut tidak ditemukan.'};
}

function apiDeleteRow(sheetName, id) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName); var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) { if (data[i][0] === id) { sh.deleteRow(i + 1); return {status: 'success'}; } }
  return {status: 'error', message: 'Data dengan ID tersebut tidak ditemukan.'};
}
function apiResetSheet(sheetName) { var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName); if (sh.getLastRow() > 1) { sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent(); } return {status: 'success'}; }

function apiSavePengaturan(data) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pengaturan"); var vals = sh.getDataRange().getValues();
  for (var key in data) { var found = false; for (var i = 1; i < vals.length; i++) { if (vals[i][0] === key) { sh.getRange(i + 1, 2).setValue(data[key]); found = true; break; } } if (!found) sh.appendRow([key, data[key]]); }
  return {status: 'success'};
}

function getSheetDataAsArrayOfObjects(sh) {
  if(!sh) return []; var data = sh.getDataRange().getDisplayValues(); if (data.length < 2) return [];
  var headers = data[0]; var res = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {}; for (var j = 0; j < headers.length; j++) { obj[headers[j]] = data[i][j]; }
    if(obj[headers[0]] !== "") res.push(obj);
  } return res;
}
function getSheetDataAsDict(sh, kIdx, vIdx) { if(!sh) return {}; var data = sh.getDataRange().getDisplayValues(); var dict = {}; for (var i = 1; i < data.length; i++) { dict[data[i][kIdx]] = data[i][vIdx]; } return dict; }