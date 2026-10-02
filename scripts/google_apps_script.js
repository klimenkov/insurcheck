/**
 * =========================================================================
 * InsurCheck Emergency Append-Only Backup Webhook
 * =========================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new blank spreadsheet, e.g. "InsurCheck Backup").
 * 2. In the top menu, go to: Extensions -> Apps Script.
 * 3. Delete any code in the editor, paste this entire file, and click Save (Ctrl+S).
 * 4. Click "Deploy" (blue button in top right) -> "New deployment".
 * 5. Click the gear icon next to "Select type" and choose "Web app".
 * 6. Set:
 *    - Description: "InsurCheck Production Backup"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 7. Click "Deploy" and authorize access with your Google account.
 * 8. Copy the "Web app URL" (looks like https://script.google.com/macros/s/AKfycb.../exec).
 * 9. Paste this URL into Render Environment Variables as:
 *    GOOGLE_SHEETS_WEBHOOK_URL = https://script.google.com/macros/s/.../exec
 * 
 * That's it! Every rate submission, review, waitlist email, and contact message
 * will automatically append to this spreadsheet in real-time.
 * AI has zero access to edit or delete any rows in this sheet.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Wait up to 10s for concurrency lock
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Could not acquire lock' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    var eventType = data.eventType || 'unknown';
    var payload = data.payload || {};
    var timestamp = data.timestamp || new Date().toISOString();
    var summary = data.summary || '';

    // 1. Always append to master "All Events" audit log
    var allLogTab = ss.getSheetByName('All Events');
    if (!allLogTab) {
      allLogTab = ss.insertSheet('All Events');
      allLogTab.appendRow(['Timestamp', 'Event Type', 'Summary', 'Payload JSON']);
      allLogTab.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#f1f5f9');
      allLogTab.setFrozenRows(1);
    }
    allLogTab.appendRow([timestamp, eventType, summary, JSON.stringify(payload)]);

    // 2. Route to specialized tabs
    if (eventType === 'submission') {
      var subTab = ss.getSheetByName('Submissions');
      if (!subTab) {
        subTab = ss.insertSheet('Submissions');
        subTab.appendRow([
          'ID', 'Created At', 'FSA', 'City', 'Make', 'Model', 'Year',
          'Driver Age', 'Years Licensed', 'Clean Record', 'Provider',
          'Monthly Premium ($)', 'Coverage', 'Comment'
        ]);
        subTab.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#e0f2fe');
        subTab.setFrozenRows(1);
      }
      subTab.appendRow([
        payload.id || '',
        payload.created_at || timestamp,
        payload.fsa || '',
        payload.city || '',
        payload.vehicle_make || '',
        payload.vehicle_model || '',
        payload.vehicle_year || '',
        payload.driver_age || '',
        payload.years_licensed || '',
        payload.clean_record ? 'Yes' : 'No',
        payload.provider_name || '',
        payload.monthly_premium || '',
        payload.coverage_type || '',
        payload.comment || ''
      ]);
    } else if (eventType === 'waitlist') {
      var waitTab = ss.getSheetByName('Broker Waitlist');
      if (!waitTab) {
        waitTab = ss.insertSheet('Broker Waitlist');
        waitTab.appendRow(['ID', 'Timestamp', 'Email']);
        waitTab.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#fef3c7');
        waitTab.setFrozenRows(1);
      }
      waitTab.appendRow([
        payload.id || '',
        payload.created_at || timestamp,
        payload.email || ''
      ]);
    } else if (eventType === 'review') {
      var revTab = ss.getSheetByName('Reviews');
      if (!revTab) {
        revTab = ss.insertSheet('Reviews');
        revTab.appendRow([
          'ID', 'Timestamp', 'Insurer', 'Overall Rating', 'Value', 'Claims',
          'Support', 'Renewal', 'Ease', 'Title', 'Review Body', 'City', 'Vehicle', 'Monthly Premium ($)'
        ]);
        revTab.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#dcfce7');
        revTab.setFrozenRows(1);
      }
      revTab.appendRow([
        payload.id || '',
        payload.created_at || timestamp,
        payload.insurer_id || '',
        payload.rating || '',
        payload.rating_value || '',
        payload.rating_claims || '',
        payload.rating_support || '',
        payload.rating_renewal || '',
        payload.rating_ease || '',
        payload.title || '',
        payload.body || '',
        payload.author_city || '',
        payload.vehicle || '',
        payload.monthly_premium || ''
      ]);
    } else if (eventType === 'feedback') {
      var fbTab = ss.getSheetByName('Feedback');
      if (!fbTab) {
        fbTab = ss.insertSheet('Feedback');
        fbTab.appendRow([
          'ID', 'Timestamp', 'Rating', 'Reasonable', 'Matches Knowledge',
          'Postal Code', 'Vehicle', 'Benchmark Rate ($)', 'Current Premium ($)', 'Comment'
        ]);
        fbTab.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#f3e8ff');
        fbTab.setFrozenRows(1);
      }
      fbTab.appendRow([
        payload.id || '',
        payload.created_at || timestamp,
        payload.rating || '',
        payload.is_reasonable || '',
        payload.matches_knowledge || '',
        payload.postal_code || '',
        payload.vehicle || '',
        payload.benchmark_rate || '',
        payload.current_premium || '',
        payload.trust_comment || ''
      ]);
    } else if (eventType === 'contact') {
      var contactTab = ss.getSheetByName('Contact Messages');
      if (!contactTab) {
        contactTab = ss.insertSheet('Contact Messages');
        contactTab.appendRow(['ID', 'Timestamp', 'Name', 'Email', 'Message']);
        contactTab.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#fee2e2');
        contactTab.setFrozenRows(1);
      }
      contactTab.appendRow([
        payload.id || '',
        payload.created_at || timestamp,
        payload.name || '',
        payload.email || '',
        payload.message || ''
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'InsurCheck Append-Only Backup Webhook is operational.'
  })).setMimeType(ContentService.MimeType.JSON);
}
