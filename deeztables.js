function loadFile(o) {
    const fr = new FileReader()
    fr.readAsText(o.files[0])
    fr.onload = function (e) {
        showDataFile(e)
    }
}

const showDataFile = (e) => {
    const csv = e.target.result
    document.getElementById('root').outerHTML = renderTable(csv)
}

const getRows = (csv) => csv.split('\n')
const getCells = (row) => row.split(',')

const renderHeader = (cells) => {
    const columns = getCells(cells)
        .map((c) => `<th>${c}</th>`)
        .join(',')
    return `<thead><tr>${columns}</tr></thrad>`
}

const renderRow = (cells) => {
    const columns = getCells(cells)
        .map((c) => `<td>${c}</td>`)
        .join(',')
    return `<tr>${columns}</tr>`
}

const renderTableBody = (rows) =>
    `<tbody>${rows.map((r) => renderRow(r)).join(',')}</tbody>`

const renderTable = (csv) => {
    const [headerRow, ...dataRows] = getRows(csv)
    const header = renderHeader(headerRow)
    const body = renderTableBody(dataRows)
    return `<table>${header}${body}</table>`
}
