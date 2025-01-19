
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

    const _ImplLoggerEmitter = (dirpath) => {
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "DeployTemporaryMinimalRepo",
            type: "info",
            message: `Implantação realizada com sucesso em ${colors.bold(dirpath)}!`
        })
    }

    const tempDirPath = os.tmpdir()

    const _Copy = (sourcePath) => {
        const destinationPath = path.join(tempDirPath, repoNamespace)
        CopyDirectory(sourcePath, destinationPath)
    }

    const _GetLocalFS = () => {
        const sourcePath = ConvertPathToAbsolutPath(repoPath)
        _Copy(sourcePath)
        _ImplLoggerEmitter(tempDirPath)
        return tempDirPath
    }
    
    const _GetGoogleDrive = async () => {
        const fileNamePath = await DownloadFileFromGoogleDrive(fileId, tempDirPath)
        const repoPathExtract = await ExtractTarGz(fileNamePath, tempDirPath)
        _Copy(repoPathExtract)
        _ImplLoggerEmitter(tempDirPath)
        return tempDirPath
    }

    const _GetGithubRelease = async () => {
        const releaseData = await GetReleaseLatestData(repositoryOwner, repositoryName)

            const {
                tarball_url
            } = releaseData

            const binaryPath = await DownloadBinary({
                url: tarball_url, 
                destinationPath: tempDirPath,
                extName: "tar.gz"
            })
        
            const repoPathExtract = await ExtractTarGz(binaryPath, tempDirPath)
            _Copy(repoPathExtract)
            _ImplLoggerEmitter(tempDirPath)
            return tempDirPath
    }

    switch(sourceType){
        case "LOCAL_FS":
           return _GetLocalFS()
        case "GOOGLE_DRIVE":
            return await _GetGoogleDrive()
        case "GITHUB_RELEASE":
            return await _GetGithubRelease()
    }
    
}

module.exports = DeployTemporaryMinimalRepo