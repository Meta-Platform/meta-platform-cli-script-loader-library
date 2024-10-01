const Arborist = require("@npmcli/arborist")
const SmartRequire = require("./SmartRequire")
const colors = SmartRequire("colors")

const InstallNpmDependencies = async ({
    contextPath, 
    dependencies,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallNpmDependencies",
        type: "info",
        message: "Iniciando da instalação das dependências NPM temporárias..."
    })

    const dependenciesForAdd = Object.keys(dependencies)
        .map((name) => {
            const version = dependencies[name]
            return `${name}@${version}`
        })
    const arborist = new Arborist({ path: contextPath, progress:true})
    await arborist.reify({add:dependenciesForAdd})

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallNpmDependencies",
        type: "info",
        message: "Instalação das dependências NPM temporária concluída."
    })

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallNpmDependencies",
        type: "info",
        message: `Dependências instaladas: ${colors.bold(dependenciesForAdd.join(", "))}`
    })
}

module.exports = InstallNpmDependencies