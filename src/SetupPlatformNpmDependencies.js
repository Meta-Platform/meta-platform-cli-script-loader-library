const path = require("path")
const os = require('os')
const { mkdir } = require('node:fs/promises')
const colors = require("colors")

const InstallNpmDependencies = require("./InstallNpmDependencies")

const SetupPlatformNpmDependencies = async ({
    npmDependenciesDirname,
    npmDependencies
}) => {
    const tempDependenciesDirPath = path.join(os.tmpdir(), npmDependenciesDirname)
    process.env.EXTERNAL_NODE_MODULES_PATH = path.resolve(tempDependenciesDirPath, "node_modules")
    await mkdir(tempDependenciesDirPath, {recursive:true})
    Log.info("SetupPlatformNpmDependencies", `${colors.bold(tempDependenciesDirPath)} criado com sucesso!`)
    await InstallNpmDependencies({
        contextPath: tempDependenciesDirPath,
        dependencies: npmDependencies
    })
    Log.info("SetupPlatformNpmDependencies", `Dependência configurada com sucesso!`)
}

module.exports = SetupPlatformNpmDependencies