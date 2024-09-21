const path = require("path")
const os = require('os')
const { mkdir } = require('node:fs/promises')

const InstallNpmDependencies = require("./InstallNpmDependencies")

const SetupPlatformNpmDependencies = async ({
    npmDependenciesDirname,
    npmDependencies
}) => {
    const tempDependenciesDirPath = path.join(os.tmpdir(), npmDependenciesDirname)
    process.env.EXTERNAL_NODE_MODULES_PATH = path.resolve(tempDependenciesDirPath, "node_modules")

    await mkdir(tempDependenciesDirPath, {recursive:true})
    await InstallNpmDependencies({
        contextPath: tempDependenciesDirPath,
        dependencies: npmDependencies
    })

}

module.exports = SetupPlatformNpmDependencies