import { Officer } from '../types';

const SHEET_ID = '1u52oAxkEvfayHUU_BJlKLTGoHCm6rTi-';
const SHEET_NAME = 'fst table';

export async function fetchSheetData(): Promise<Officer[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // The response is wrapped in google.visualization.Query.setResponse(...)
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonString);
    
    const rows = data.table.rows;
    const officers: Officer[] = [];
    let currentTaluk = '';
    
    // Skip header row if necessary, but gviz usually handles headers separately
    // Let's check the structure. Usually rows[i].c is an array of cells {v: value, f: formattedValue}
    
    for (const row of rows) {
      const cells = row.c;
      
      // Column 0: Taluk
      // Column 1: Name
      // Column 2: Designation
      // Column 3: Mobile
      
      const talukValue = cells[0]?.v?.toString().trim() || '';
      if (talukValue) {
        currentTaluk = talukValue;
      }
      
      const name = cells[1]?.v?.toString().trim() || '';
      const designation = cells[2]?.v?.toString().trim() || '';
      const mobile = cells[3]?.v?.toString().trim() || '';
      
      // Only add if there's a name (to avoid empty rows or header rows if they leaked in)
      if (name && name !== 'Name of Officer') {
        officers.push({
          taluk: currentTaluk,
          name,
          designation,
          mobile
        });
      }
    }
    
    return officers;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}
