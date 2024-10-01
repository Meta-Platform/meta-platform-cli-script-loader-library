const path = require("path")
const os = require('os')
const { mkdir } = require('node:fs/promises')
const SmartRequire = require("./SmartRequire")
const colors = SmartRequire("colors")

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
        message: `${colors.bold(tempDependenciesDirPath)} criado com sucesso!`
    })
    await InstallNpmDependencies({
        contextPath: tempDependenciesDirPath,
        dependencies: npmDependencies,
        loggerEmitter
    })
    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "SetupPlatformNpmDependencies",
        type: "info",
        message: `Dependência configurada com sucesso!`
    })
}

module.exports = SetupPlatformNpmDependencies