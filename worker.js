const renderTable = (data) => {
    const cols = getColumns(data)
    const header = renderHeader(cols)
    const body = renderTableBody({ data, cols })
    return `<div class="table-container"><table>${header}${body}</table></div><div class="footer"><button class="btn" onclick="onSave(this)">Save</button></div>`
}

const getColumns = (data) => Object.keys(data[0])

const renderHeader = (cols) => {
    const columns = cols.map((c) => `<th>${c}</th>`).join('')
    return `<thead><tr>${columns}</tr></thead>`
}

const renderTableBody = ({ data, cols }) =>
    `<tbody>${data.map((row) => renderRow({ row, cols })).join('')}</tbody>`

const renderRow = ({ row, cols }) => {
    const columns = cols
        .map(
            (c) =>
                `<td><input placeholder="${row[c]}" title="${row[c]}" value="${row[c]}" onchange="checkMeDaddy(this)" /></td>`
        )
        .join('')
    return `<tr>${columns}</tr>`
}

function checkMeDaddy({ placeholder, value, classList }) {
    if (placeholder === value) {
        classList.remove('diff-values')
    } else {
        classList.add('diff-values')
        document.querySelector('button.btn').innerText = 'Save'
    }
}

async function getData() {
    const url = '/ligma-deez.json'
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error.message)
    }
}

const onSave = async (btn) => {
    console.log(btn)
    btn.innerText = 'Data was saved'
}

const onLoad = async () => {
    const data = await getData()
    const table = renderTable(data)
    console.log('xxxx')
    postMessage(table)
}

onmessage = (e) => {
    console.log('Message received from main script', e)
    onLoad()
    console.log('Posting message back to main script')
    postMessage('<div class="loader"></div>')
}
