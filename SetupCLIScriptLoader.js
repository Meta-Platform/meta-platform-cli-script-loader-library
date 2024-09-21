const SetupPlatformNpmDependencies = require("./src/SetupPlatformNpmDependencies")
const CreateScriptLoader = require("./src/CreateScriptLoader")

const SetupCLIScriptLoader =  async ({
    npmDependenciesDirname,
    npmDependencies,
    metaPlatformDependencies,
    sourceType,
    repoPath,
    repoNamespace,
    fileId
}) => {

    await SetupPlatformNpmDependencies({
        npmDependenciesDirname,
        npmDependencies
    })

    const DeployTemporaryMinimalRepo = require("./src/DeployTemporaryMinimalRepo")
    const tempDirPath = await DeployTemporaryMinimalRepo({
        sourceType,
        repoPath,
        repoNamespace,
        fileId
    })

	return CreateScriptLoader({
        repoPath: tempDirPath,
        metaPlatformDependencies
    })
}

module.exports = SetupCLIScriptLoader