
const path = require("path")
const os = require('os')

const colors = require("colors")

const CopyDirectory               = require("./CopyDirectory")
const DownloadFileFromGoogleDrive = require("./DownloadFileFromGoogleDrive")
const ExtractTarGz                = require("./ExtractTarGz")
const GetReleaseLatestData        = require("./GetReleaseLatestData")
const DownloadBinary              = require("./DownloadBinary")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())


const DeployTemporaryMinimalRepo = async ({
    sourceType,
    repoPath,
    repoNamespace,
    fileId,
    repositoryOwner,
    repositoryName,
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
            await ExtractTarGz(fileNamePath, tempDirPath)
            break
        case "GITHUB_RELEASE":
            const releaseData = await GetReleaseLatestData(repositoryOwner, repositoryName)

            const {
                tarball_url
            } = releaseData

            const binaryPath = await DownloadBinary({
                url: tarball_url, 
                destinationPath: tempDirPath,
                extName: "tar.gz"
            })
        
            await ExtractTarGz(binaryPath, tempDirPath)
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