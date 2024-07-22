const myWorker = new Worker('worker.js')

const root = document.getElementById('root')

const onLoad = async () => {
    myWorker.postMessage('root')
    console.log('Message posted to worker')
}

myWorker.onmessage = (e) => {
    console.log('Message received from worker', e)
    document.getElementById('root').innerHTML = e.data
}

window.onload = onLoad
