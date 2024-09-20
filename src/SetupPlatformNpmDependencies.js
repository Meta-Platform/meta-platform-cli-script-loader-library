const path = require("path")
const os = require('os')
const { mkdir } = require('node:fs/promises')

const InstallNpmDependencies = require("./InstallNpmDependencies")

const SetupPlatformNpmDependencies = async ({
    npmDependenciesDirname,
    npmDependencies
}) => {
    const tempDirPath = path.join(os.tmpdir(), npmDependenciesDirname)
    process.env.EXTERNAL_NODE_MODULES_PATH = path.resolve(tempDirPath, "node_modules")

    await mkdir(tempDirPath, {recursive:true})
    await InstallNpmDependencies({
        contextPath: tempDirPath,
        dependencies: npmDependencies
    })

}

module.exports = SetupPlatformNpmDependencies