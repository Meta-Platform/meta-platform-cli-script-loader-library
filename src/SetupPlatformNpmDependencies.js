const path = require("path")
const os = require('os')
const { mkdir } = require('node:fs/promises')

const InstallNpmDependencies = require("./InstallNpmDependencies")

const SetupPlatformNpmDependencies = async ({
    npmDependenciesDirname,
    npmDependencies,
    loggerEmitter
}) => {
    const tempDependenciesDirPath = path.join(os.tmpdir(), npmDependenciesDirname)
    process.env.EXTERNAL_NODE_MODULES_PATH = path.resolve(tempDependenciesDirPath, "node_modules")
    await mkdir(tempDependenciesDirPath, {recursive:true})
    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "SetupPlatformNpmDependencies",
        type: "info",
        message: "O diretório temporário para dependências NPM foi criado com sucesso."
    })
    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "SetupPlatformNpmDependencies",
        type: "info",
        message: tempDependenciesDirPath
    })
    await InstallNpmDependencies({
        contextPath: tempDependenciesDirPath,
        dependencies: npmDependencies,
        loggerEmitter
    })

}

module.exports = SetupPlatformNpmDependencies