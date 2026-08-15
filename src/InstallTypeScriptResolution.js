const MODULE_RESOLUTION_URI = "module-resolution.lib/src/InstallTypeScriptResolution"

/*
 * Ensina o processo da CLI a resolver `.ts`, a partir da `module-resolution.lib`
 * do repositório mínimo recém-materializado — nunca de uma cópia local. O
 * mecanismo tem uma implementação só, e ela vive no EssentialRepo.
 *
 * Tolera ausência: se o repositório carregado for anterior à lib, ou se ela não
 * estiver entre as `metaPlatformDependencies` declaradas pela CLI, o bootstrap
 * segue em JavaScript — que é exatamente o que aquele repositório contém.
 */
const InstallTypeScriptResolution = (loadScript) => {

    try{
        return loadScript(MODULE_RESOLUTION_URI)()
    }catch(error){
        Log.debug("InstallTypeScriptResolution", `resolução TypeScript indisponível: ${error.message || error}`)
        return false
    }

}

module.exports = InstallTypeScriptResolution
