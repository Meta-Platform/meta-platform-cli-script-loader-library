
const path = require("path")
const os = require('os')

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
    fileId
}) => {
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

    return tempDirPath
}

module.exports = DeployTemporaryMinimalRepo