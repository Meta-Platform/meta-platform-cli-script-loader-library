const SetupPlatformNpmDependencies = require("./src/SetupPlatformNpmDependencies")
const CreateScriptLoader = require("./src/CreateScriptLoader")

const SetupCLIScriptLoader =  async ({
    npmDependencies,
    metaPlatformDependencies
}) => {

	const npmDependenciesDirname = process.env.NPM_DEPENDENCIES_DIRNAME

    await SetupPlatformNpmDependencies({
        npmDependenciesDirname,
        npmDependencies
    })

    const sourceType    = process.env.MINIMUM_REPO_SOURCE_TYPE
    const repoPath      = process.env.MINIMUM_REPO_PATH
    const repoNamespace = process.env.MINIMUM_REPO_NAMESPACE
    const fileId        = process.env.MINIMUM_REPO_FILE_ID

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