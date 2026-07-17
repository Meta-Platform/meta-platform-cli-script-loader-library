const fs = require("fs")
const path = require("path")
const { pipeline } = require("stream")
const { promisify } = require("util")
const { RunWithRetry } = require("./RunWithRetry")

const pipelineAsync = promisify(pipeline)

const DownloadBinary = async ({
    url,
    destinationPath,
    extName
})  => {
    const fileName = path.basename(url) + (extName ? `.${extName}` : "")
    const filePath = path.resolve(destinationPath, fileName)

    return await RunWithRetry(async () => {
        // Cada tentativa recomeça do zero: um arquivo parcial deixado por uma
        // tentativa que falhou no meio do stream contaminaria a extração depois.
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath)
        }

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
        }
        const writer = fs.createWriteStream(filePath)
        await pipelineAsync(response.body, writer)

        return filePath
    }, { label: `download ${fileName}` })
}

module.exports = DownloadBinary
