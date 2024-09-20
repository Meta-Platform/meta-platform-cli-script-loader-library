const SmartRequire = require("./SmartRequire")
const tar = SmartRequire("tar")
const path = require("path")

const ListTarGzContents = require("./ListTarGzContents")

const ExtractTarGz = async (source, destination) => {
    const [ fistItem ] = await ListTarGzContents(source)
    await tar.x({
        file: source,
        cwd: destination
    })
    return path.join(destination, fistItem)
}

module.exports = ExtractTarGz