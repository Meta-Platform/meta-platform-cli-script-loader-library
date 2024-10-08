
const path = require("path")
const os = require('os')

const colors = require("colors")

const CopyDirectory               = require("./CopyDirectory")
const DownloadFileFromGoogleDrive = require("./DownloadFileFromGoogleDrive")
const ExtractTarGz                = require("./ExtractTarGz")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())


const DeployTemporaryMinimalRepo = async ({
    sourceType,
    repoPath,
    repoNamespace,
    fileId,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "DeployTemporaryMinimalRepo",
        type: "info",
        message: `Iniciando implantação repositório mínimo de tipo ${colors.bold(sourceType)}...`
    })
    const tempDirPath = os.tmpdir()
    
    switch(sourceType){
        case "LOCAL_FS":
            const destinationPath = path.join(tempDirPath, repoNamespace)
            const sourcePath = ConvertPathToAbsolutPath(repoPath)
            CopyDirectory(sourcePath, destinationPath)
            break
        case "GOOGLE_DRIVE":
            const fileNamePath = await DownloadFileFromGoogleDrive(fileId, tempDirPath)
            const repoPathExtract = await ExtractTarGz(fileNamePath, tempDirPath)
            break
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "DeployTemporaryMinimalRepo",
        type: "info",
        message: `Implantação realizada com sucesso em ${colors.bold(tempDirPath)}!`
    })

    return tempDirPath
}

module.exports = DeployTemporaryMinimalRepo