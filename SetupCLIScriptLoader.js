const EventEmitter = require('node:events')
const SetupPlatformNpmDependencies = require("./src/SetupPlatformNpmDependencies")
const CreateScriptLoader = require("./src/CreateScriptLoader")
const PrintDataLog = require("./src/PrintDataLog")

const SetupCLIScriptLoader =  async ({
    npmDependenciesDirname,
    npmDependencies,
    metaPlatformDependencies,
    sourceType,
    repoPath,
    repoNamespace,
    fileId
}) => {

    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "script-loader"))


    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "SetupCLIScriptLoader",
        type: "info",
        message: "Configurando carregador de script para linhade comando"
    })

    await SetupPlatformNpmDependencies({
        npmDependenciesDirname,
        npmDependencies,
        loggerEmitter
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