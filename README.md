# meta-platform-cli-script-loader-library

Uma biblioteca para configurar o ambiente e preparar um carregador de scripts para uso em aplicações CLI.

## Descrição

A `meta-platform-cli-script-loader-library` é uma biblioteca que fornece utilitários para inicializar e configurar o ambiente de execução de aplicações CLI. Ela também carrega e prepara scripts para uso, permitindo que você crie e execute comandos CLI integrados a plataform.

## Estrutura do Projeto

- **`src/`**: Diretório contendo os arquivos de origem da biblioteca.
- **`SetupCLIScriptLoader.js`**: Arquivo principal que expõe a função `SetupCLIScriptLoader`, responsável por preparar o carregador de scripts.
- **`package.json`**: Contém as dependências e informações de configuração do projeto.
- **`.gitignore`**: Arquivo para ignorar arquivos desnecessários no controle de versão.


## Uso

Para utilizar a função principal da biblioteca, importe o `SetupCLIScriptLoader` e execute-o para configurar o ambiente e carregar os scripts.

### Exemplo

```javascript
const SetupCLIScriptLoader = require("meta-platform-cli-script-loader-library/SetupCLIScriptLoader");

(async () => {
    const loadScript = await SetupCLIScriptLoader()
    const ScriptLoaded1 = loadScript("path/to/script1")
    const ScriptLoaded2 = loadScript("path/to/script2")
    
    const result = ScriptLoaded1.doSomething()

    const something = ScriptLoaded2()
})()
```