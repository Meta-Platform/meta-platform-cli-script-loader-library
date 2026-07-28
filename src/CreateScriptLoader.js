const path = require("path")

const GetPackageName = (uri) => {
    const [ packageName ] = uri.split('/')
    return packageName
}

const GetLayerURI = (packageName, dependencies) => {
    const fullPackageURI = dependencies
        .find(uri => {
            const [ _packageName ] = uri.split("/").reverse()
            return _packageName === packageName
        })

    if (!fullPackageURI) {
        throw `Pacote não encontrado [${packageName}]`
    }
    const layerURI = fullPackageURI.substring(0, fullPackageURI.lastIndexOf("/"))
    return layerURI
}

const CreateScriptLoader = ({
    repoPath,
    metaPlatformDependencies
}) => {

    Log.info("CreateScriptLoader", "Script Loader carregado!")

    return (fileURI) => {
        const packageName = GetPackageName(fileURI)
        const layerURI = GetLayerURI(packageName, metaPlatformDependencies)
        const filePath = path.resolve(repoPath, layerURI, fileURI)
        return require(filePath)
    }
}

module.exports = CreateScriptLoader