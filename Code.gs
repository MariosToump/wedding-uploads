// Wedding upload backend — deploy as Web App:
//   Execute as: Me (panadolcruz3@gmail.com)
//   Who has access: Anyone
// Uploads land in a Drive folder named "Wedding Uploads".

const FOLDER_NAME = 'Wedding Uploads';

function getFolder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    if (req.action === 'initiate') {
      return initiateResumableUpload_(req);
    }
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function initiateResumableUpload_(req) {
  const folder = getFolder_();
  const name = (req.uploader ? req.uploader + ' - ' : '') + (req.filename || 'upload');
  const metadata = {
    name: name,
    parents: [folder.getId()],
  };
  const res = UrlFetchApp.fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(metadata),
      headers: {
        Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
        'X-Upload-Content-Type': req.mimeType || 'application/octet-stream',
        'X-Upload-Content-Length': String(req.size || 0),
      },
      muteHttpExceptions: true,
    }
  );
  const location = res.getHeaders()['Location'] || res.getHeaders()['location'];
  if (!location) {
    return json_({ ok: false, error: 'no upload url: ' + res.getContentText() });
  }
  return json_({ ok: true, uploadUrl: location });
}

function doGet() {
  return json_({ ok: true, status: 'wedding upload backend running' });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
