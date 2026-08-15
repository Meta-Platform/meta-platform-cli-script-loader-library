const SetupPlatformNpmDependencies = require("./src/SetupPlatformNpmDependencies")
const CreateScriptLoader = require("./src/CreateScriptLoader")
const InstallMinimalGlobalLogger = require("./src/MinimalLogger")
const InstallTypeScriptResolution = require("./src/InstallTypeScriptResolution")

const LEVEL_BY_TYPE = { info : "info", success : "message", warning : "warn", error : "error" }

const SetupCLIScriptLoader =  async ({
    npmDependenciesDirname,
    npmDependencies,
    metaPlatformDependencies,
    sourceType,
    repoPath,
    repoNamespace,
    repositoryOwner,
    repositoryName,
    fileId
}) => {

    /*
     * `globalThis.Log` na versão mínima embutida: aqui ainda não há ecossistema
     * instalado de onde carregar a logger.lib canônica — este pacote É o
     * carregador. Ver o cabeçalho de src/MinimalLogger.js.
     */
    InstallMinimalGlobalLogger({ origin : "script-loader" })

    Log.info("SetupCLIScriptLoader", "Configurando carregador de script...")

    await SetupPlatformNpmDependencies({
        npmDependenciesDirname,
        npmDependencies
    })

    const DeployTemporaryMinimalRepo = require("./src/DeployTemporaryMinimalRepo")
    const tempDirPath = await DeployTemporaryMinimalRepo({
        sourceType,
        repoPath,
        repoNamespace,
        fileId,
        repositoryOwner,
        repositoryName
    })

    const loadScript = CreateScriptLoader({
        repoPath: tempDirPath,
        metaPlatformDependencies
    })

    /*
     * Antes de devolver o carregador: a partir daqui os módulos do repositório
     * mínimo podem ser TypeScript, e quem os requer é o consumidor deste
     * retorno. Ver source-language-standard.md.
     */
    InstallTypeScriptResolution(loadScript)

    return loadScript
}

module.exports = SetupCLIScriptLoader