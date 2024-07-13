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
        .join('')
    return `<thead><tr>${columns}</tr></thrad>`
}

const renderRow = (cells) => {
    const columns = getCells(cells)
        .map(
            (c) =>
                `<td><abbr title="${c}"><input placeholder="${c}" value="${c}" onchange="checkMeDaddy(this)" /></abbr></td>`
        )
        .join('')
    return `<tr>${columns}</tr>`
}

const renderTableBody = (rows) =>
    `<tbody>${rows.map((r) => renderRow(r)).join('')}</tbody>`

const renderTable = (csv) => {
    const [headerRow, ...dataRows] = getRows(csv)
    const header = renderHeader(headerRow)
    const body = renderTableBody(dataRows)
    return `<table>${header}${body}</table>`
}

function checkMeDaddy({ placeholder, value, classList }) {
    if (placeholder === value) {
        classList.remove('diff-values')
    } else {
        classList.add('diff-values')
    }
}

const createHeader = (data) => {
    const cols = Object.keys(data[0])
    console.log({ cols })
}

async function getData() {
    const url = '/ligma-deez.json'
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const json = await response.json()
        console.log(json)
        createHeader(json)
    } catch (error) {
        console.error(error.message)
    }
}

window.onload = getData
