process.env.NODE_OPTIONS = "--dns-result-order=ipv4first"

const Arborist = require("@npmcli/arborist")
const colors = require("colors")

const InstallNpmDependencies = async ({
    contextPath, 
    dependencies
}) => {

    Log.info("InstallNpmDependencies", "Iniciando da instalação das dependências NPM temporárias...")

    const dependenciesForAdd = Object.keys(dependencies)
        .map((name) => {
            const version = dependencies[name]
            return `${name}@${version}`
        })
    const arborist = new Arborist({ path: contextPath, progress:true})
    await arborist.reify({add:dependenciesForAdd})

    Log.info("InstallNpmDependencies", "Instalação das dependências NPM temporária concluída.")

    Log.info("InstallNpmDependencies", `Dependências instaladas: ${colors.bold(dependenciesForAdd.join(", "))}`)
}

module.exports = InstallNpmDependencies