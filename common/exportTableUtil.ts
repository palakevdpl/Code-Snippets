import * as XLSX from 'xlsx';

const getFileName = (name: string) => {
  let sheetName = name || 'Web Monitoring';
  let fileName = `${sheetName}`;
  return {
    sheetName,
    fileName,
  };
};
export class ExportTableUtil {
  static exportTableToExcel(arr: any[], name: any, heading: any[]) {
    let Heading = [heading];
    let { sheetName, fileName } = getFileName(name);

    //Had to create a new workbook and then add the header
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);

    //Starting in the second row to avoid overriding and skipping headers
    XLSX.utils.sheet_add_json(ws, arr, { origin: 'A3', skipHeader: true });

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}
