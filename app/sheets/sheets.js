const spreadsheet = document.getElementById('spreadsheet');
const COLS = 5;
const ROWS = 10;


for (let c = 0; c < COLS; c++) {
  const header = document.createElement('div');
  header.className = 'cell header-cell';
  header.innerText = String.fromCharCode(65 + c);
  spreadsheet.appendChild(header);
}


for (let r = 1; r <= ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    
    cell.contentEditable = "true"; 
    
    const colLetter = String.fromCharCode(65 + c);
    cell.id = `${colLetter}${r}`;

    cell.addEventListener('blur', (e) => {
      console.log(`Zelle ${cell.id} geändert auf:`, e.target.innerText);
    });

    spreadsheet.appendChild(cell);
  }
}
