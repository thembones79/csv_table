const renderTable = (data) => {
    const cols = getColumns(data)
    const header = renderHeader(cols)
    const body = renderEmptyTableBody({ data, cols })
    return `<div class="table-container"><table>${header}${body}</table></div><div class="footer"><button class="btn" onclick="onSave(this)">Save</button></div>`
}

const getColumns = (data) => Object.keys(data[0])

const renderHeader = (cols) => {
    const columns = cols.map((c) => `<th>${c}</th>`).join('')
    return `<thead><tr>${columns}</tr></thead>`
}

const renderTableBody = ({ data, cols }) =>
    `<tbody>${data.map((row) => renderRow({ row, cols })).join('')}</tbody>`

const renderEmptyTableBody = ({ data, cols }) => `<tbody></tbody>`

const renderRow = ({ row, cols }) => {
    const columns = cols
        .map(
            (c) =>
                `<td><input placeholder="${row[c]}" title="${row[c]}" value="${row[c]}" onchange="checkMeDaddy(this)" /></td>`
        )
        .join('')
    return `${columns}`
}

const addRows = async (data) => {
    const tBody = document.querySelector('tbody')
    const cols = getColumns(data)
    function delayedValue(time, value) {
        return new Promise((resolve /*, reject*/) => {
            setTimeout(() => resolve(value), time)
        })
    }

    async function* generateSequence(data) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            const tr = document.createElement('tr')
            const r = renderRow({ row, cols })
            tr.innerHTML = r

            await new Promise((resolve) => setTimeout(resolve))

            yield tr
        }
    }

    ;(async () => {
        let generator = generateSequence(data)
        for await (let value of generator) {
            tBody.appendChild(value)
        }
    })()

    // const pro = async (i) => {
    //     return new Promise((resolve) => {
    //         const row = data[i]
    //         const tr = document.createElement('tr')
    //         const r = renderRow({ row, cols })
    //         tr.innerHTML = r
    //         // tBody.appendChild(tr)
    //         resolve(tr)
    //         return tr
    //     })
    // }
    // for (let i = 0; i < data.length; i++) {
    //     const tr = await pro(i)
    //     tBody.appendChild(tr)
    // }
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
    document.getElementById('root').outerHTML = table
    addRows(data)
}

window.onload = onLoad
