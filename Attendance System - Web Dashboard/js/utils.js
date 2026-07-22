/**
 * Spark Drives and Automations (SparkDNA) - Utility Helpers
 * File: js/utils.js
 * 
 * Exposes common utilities:
 * - CSV and Excel exportation
 * - Search, sorting, and pagination filters
 * - Date and time formatting
 */

const SparkUtils = {
  // Get local date string in YYYY-MM-DD format (avoids UTC offset drift)
  getLocalDateString(dateObj = new Date()) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Normalize any date value (ISO string, Date object, text) to YYYY-MM-DD
  normalizeDateStr(dateVal) {
    if (!dateVal) return '';
    if (dateVal instanceof Date) return this.getLocalDateString(dateVal);
    const str = String(dateVal).trim();
    if (str.includes('T')) return str.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return this.getLocalDateString(parsed);
    return str;
  },

  // Format Time string safely (e.g. '09:30:00' or '9:30' -> '09:30 AM/PM' or '09:30:00')
  formatTimeStr(timeStr) {
    if (!timeStr || timeStr === '--') return '--';
    const str = String(timeStr).trim();
    if (str.indexOf(':') === -1) return str;
    const parts = str.split(':');
    let h = parseInt(parts[0], 10);
    const m = String(parts[1] || '00').padStart(2, '0');
    const s = parts[2] ? String(parts[2]).padStart(2, '0') : '00';
    if (isNaN(h)) return str;
    return `${String(h).padStart(2, '0')}:${m}:${s}`;
  },

  // Format Date for display (e.g., '2026-06-15' -> 'Jun 15, 2026')
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const normalized = this.normalizeDateStr(dateStr);
      const parts = normalized.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  // Format Hours worked (e.g., 8.52 -> '8 hrs 31 mins')
  formatHours(hrs) {
    if (hrs === undefined || hrs === null || isNaN(hrs)) return '0m';
    const totalMins = Math.round(hrs * 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  },

  // Highlight badge CSS class for statuses
  getStatusClass(status) {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'present' || s === 'working') return 'badge-present';
    if (s === 'late') return 'badge-late';
    if (s === 'half day') return 'badge-halfday';
    if (s === 'on-duty' || s === 'onduty') return 'badge-onduty';
    if (s === 'pending') return 'badge-pending';
    if (s === 'approved') return 'badge-approved';
    if (s === 'rejected') return 'badge-rejected';
    if (s === 'active') return 'badge-active';
    if (s === 'inactive') return 'badge-inactive';
    if (s === 'lunch') return 'badge-pending';
    if (s === 'permission') return 'badge-halfday';
    if (s === 'dayclose' || s === 'dayout') return 'badge-active';
    return '';
  },

  // Export array of objects to CSV file
  exportToCSV(filename, headers, data, keyMap) {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    csvContent += headers.join(',') + '\n';
    
    data.forEach(row => {
      const line = keyMap.map(key => {
        let cell = row[key] !== undefined && row[key] !== null ? row[key] : '';
        cell = cell.toString().replace(/"/g, '""');
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell}"`;
        }
        return cell;
      });
      csvContent += line.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export array of objects to native XML Excel format (.xls)
  exportToExcel(filename, sheetName, headers, data, keyMap) {
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#C70011" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Default">
   <Alignment ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sheetName}">
  <Table>`;
    
    keyMap.forEach(() => {
      xml += '\n   <Column ss:Width="120"/>';
    });
    
    xml += '\n   <Row ss:Height="25">';
    headers.forEach(h => {
      xml += `\n    <Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>`;
    });
    xml += '\n   </Row>';
    
    data.forEach(row => {
      xml += '\n   <Row ss:Height="18">';
      keyMap.forEach(key => {
        let val = row[key] !== undefined && row[key] !== null ? row[key] : '';
        let type = 'String';
        if (typeof val === 'number') {
          type = 'Number';
        }
        xml += `\n    <Cell ss:StyleID="Default"><Data ss:Type="${type}">${val}</Data></Cell>`;
      });
      xml += '\n   </Row>';
    });
    
    xml += `\n  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

window.sparkUtils = SparkUtils;
