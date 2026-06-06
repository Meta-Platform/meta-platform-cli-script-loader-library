# Meta Platform CLI Script Loader

> Biblioteca de **bootstrap** que prepara o ambiente e devolve um *carregador de
> scripts* para CLIs da Meta Platform.

## Papel dentro da Meta Platform

Diferente das CLIs da plataforma, este pacote **não expõe um executável**: é uma
**biblioteca** (`cli-script-loader`) usada por ferramentas que precisam, **antes
de rodar**, carregar scripts/libs da plataforma. No ecossistema (ver
[mapa de repositórios](https://github.com/Meta-Platform/.github/blob/main/docs/repository-map.md)),
ele é o **bootstrap** que conecta uma CLI ao código de um repositório.

### Problema que resolve

Uma CLI da plataforma (como o `mywizard`) precisa executar usando **libs que vivem
em um repositório** (ex.: `EssentialRepo`), mas nem sempre esse repositório está
instalado/disponível no formato esperado. O script loader resolve isso: (1)
instala as dependências NPM mínimas em uma pasta temporária e (2) materializa um
**repositório mínimo** a partir de uma fonte (`LOCAL_FS`, `GOOGLE_DRIVE` ou
`GITHUB_RELEASE`), devolvendo uma função `loadScript` para carregar módulos desse
repositório por **URI de pacote**.

### Como prepara o ambiente CLI

1. Cria pasta temporária em `os.tmpdir()` e define
   `EXTERNAL_NODE_MODULES_PATH`.
2. Instala as `npmDependencies` ali (via `@npmcli/arborist`).
3. Implanta o repositório mínimo (cópia/extração conforme `sourceType`).
4. Retorna `loadScript`, que resolve cada pacote pela sua *layer* (a partir de
   `metaPlatformDependencies`) e faz `require`.

### Relações

- **EssentialRepo** — o repositório tipicamente carregado: o `loadScript` resolve
  libs como `print-data-log.lib` e `ecosystem-install-utilities.lib` a partir
  dele.
- **Setup Wizard** — **consumidor direto**: `Install.command.js`/`Update.command.js`
  do [setup-wizard](https://github.com/Meta-Platform/meta-platform-setup-wizard-command-line)
  fazem `require("cli-script-loader/SetupCLIScriptLoader")` para carregar
  `ecosystem-install-utilities.lib` antes de instalar/atualizar.
- **Package Executor** — implementa um **carregador análogo próprio**
  (`src/Helpers/CreateScriptLoader.js`), com o mesmo padrão, mas voltado a um
  ecossistema **já instalado** (lê de `EcosystemData/repos`). Não usa esta lib
  diretamente; são peças irmãs.

## Quando usar

Ao construir uma CLI que precisa carregar libs de um repositório da plataforma
antes de existir um ecossistema instalado completo (bootstrap).

---

## Instalação

```bash
cd Meta-Platform/meta-platform-cli-script-loader-library
npm install
```

Dependências de runtime (ver `package.json`):

- [`@npmcli/arborist`](https://www.npmjs.com/package/@npmcli/arborist) — instala
  as dependências NPM temporárias de forma programática.
- [`colors`](https://www.npmjs.com/package/colors) — formatação colorida do log.
- [`tar`](https://www.npmjs.com/package/tar) — extração de pacotes `.tar.gz`.

---

## API

### `SetupCLIScriptLoader(options) → Promise<loadScript>`

Função principal, exportada por `SetupCLIScriptLoader.js`. Executa, em ordem:

1. Cria um `EventEmitter` interno de log e o conecta ao
   [`PrintDataLog`](./src/PrintDataLog.js) (origem `"script-loader"`).
2. Instala as dependências NPM temporárias
   ([`SetupPlatformNpmDependencies`](./src/SetupPlatformNpmDependencies.js)).
3. Implanta um repositório mínimo temporário a partir da fonte informada
   ([`DeployTemporaryMinimalRepo`](./src/DeployTemporaryMinimalRepo.js)).
4. Cria e retorna a função `loadScript`
   ([`CreateScriptLoader`](./src/CreateScriptLoader.js)).

#### Parâmetros (`options`)

| Parâmetro | Usado quando | Descrição |
|-----------|--------------|-----------|
| `npmDependenciesDirname` | sempre | Nome da pasta criada em `os.tmpdir()` para abrigar as dependências NPM temporárias. |
| `npmDependencies` | sempre | Objeto `{ "pacote": "versão" }` com as dependências NPM a instalar. |
| `metaPlatformDependencies` | sempre | Lista de URIs de pacotes do repositório (ex.: `"Module/Layer/pacote.lib"`), usada por `loadScript` para resolver a *layer* de cada pacote. |
| `sourceType` | sempre | Tipo da fonte do repositório: `"LOCAL_FS"`, `"GOOGLE_DRIVE"` ou `"GITHUB_RELEASE"`. |
| `repoNamespace` | sempre | Nome da pasta de destino do repositório mínimo dentro de `os.tmpdir()`. |
| `repoPath` | `LOCAL_FS` | Caminho local do repositório de origem (aceita `~`). |
| `fileId` | `GOOGLE_DRIVE` | ID do arquivo `.tar.gz` no Google Drive. |
| `repositoryOwner` | `GITHUB_RELEASE` | Dono do repositório no GitHub. |
| `repositoryName` | `GITHUB_RELEASE` | Nome do repositório no GitHub (usa a *latest release*). |

#### Retorno: `loadScript(fileURI) → módulo`

A função retornada recebe uma **URI de arquivo** no formato
`"<nomeDoPacote>/<caminho/dentro/do/pacote>"` e devolve o resultado de
`require(...)` do módulo correspondente. A resolução funciona assim
(ver [`CreateScriptLoader.js`](./src/CreateScriptLoader.js)):

1. extrai o nome do pacote (primeiro segmento da `fileURI`);
2. localiza, em `metaPlatformDependencies`, a URI completa cujo último segmento é
   esse pacote e deriva a *layer* (tudo antes do último `/`);
3. resolve o caminho final como
   `repoPath/<layerURI>/<fileURI>` e o carrega com `require`.

> Se o pacote não estiver em `metaPlatformDependencies`, é lançado o erro
> `Pacote não encontrado [<nome>]`.

### Exemplo

```javascript
const SetupCLIScriptLoader = require("cli-script-loader/SetupCLIScriptLoader")

;(async () => {
    const loadScript = await SetupCLIScriptLoader({
        npmDependenciesDirname: "meta-platform-cli-deps",
        npmDependencies: { "yargs": "17.7.2" },
        metaPlatformDependencies: [
            "Commons.Module/Libraries.layer/print-data-log.lib",
            "Main.Module/Application.layer/repository-manager.cli"
        ],
        sourceType: "LOCAL_FS",
        repoNamespace: "EssentialRepo",
        repoPath: "~/Workspaces/meta-platform-repo/repos/essential-repository"
    })

    // resolve: <tmp>/EssentialRepo/Commons.Module/Libraries.layer/print-data-log.lib/src/PrintDataLog
    const PrintDataLog = loadScript("print-data-log.lib/src/PrintDataLog")
    PrintDataLog({ sourceName: "demo", type: "info", message: "Olá!" })
})()
```

> **Observação:** o exemplo de chamada sem argumentos que constava em versões
> anteriores deste README estava desatualizado — `SetupCLIScriptLoader` exige o
> objeto `options` descrito acima.

---

## Módulos em `src/`

| Módulo | Responsabilidade |
|--------|------------------|
| [`SetupPlatformNpmDependencies.js`](./src/SetupPlatformNpmDependencies.js) | Cria a pasta temporária em `os.tmpdir()`, define `EXTERNAL_NODE_MODULES_PATH` e dispara a instalação NPM. |
| [`InstallNpmDependencies.js`](./src/InstallNpmDependencies.js) | Instala dependências NPM no `contextPath` via `@npmcli/arborist` (`reify`). |
| [`DeployTemporaryMinimalRepo.js`](./src/DeployTemporaryMinimalRepo.js) | Materializa o repositório mínimo em `os.tmpdir()` conforme o `sourceType` (`LOCAL_FS` / `GOOGLE_DRIVE` / `GITHUB_RELEASE`). |
| [`CreateScriptLoader.js`](./src/CreateScriptLoader.js) | Fábrica da função `loadScript`, que resolve pacotes pela *layer* e os carrega. |
| [`SmartRequire.js`](./src/SmartRequire.js) | `require` que busca módulos em `EXTERNAL_NODE_MODULES_PATH` (fallback `node_modules`). |
| [`CopyDirectory.js`](./src/CopyDirectory.js) | Cópia recursiva de diretórios, ignorando arquivos/pastas ocultos (iniciados por `.`). |
| [`DownloadFileFromGoogleDrive.js`](./src/DownloadFileFromGoogleDrive.js) | Baixa um arquivo público do Google Drive a partir do `fileId`. |
| [`DownloadBinary.js`](./src/DownloadBinary.js) | Baixa um binário/arquivo de uma URL via `fetch` + `stream.pipeline`. |
| [`GetReleaseLatestData.js`](./src/GetReleaseLatestData.js) | Consulta a API do GitHub pela *latest release* de um repositório. |
| [`ExtractTarGz.js`](./src/ExtractTarGz.js) | Extrai um `.tar.gz` e retorna o caminho do primeiro item (a pasta raiz). |
| [`ListTarGzContents.js`](./src/ListTarGzContents.js) | Lista o conteúdo (caminhos) de um `.tar.gz` sem extrair. |
| [`PrintDataLog.js`](./src/PrintDataLog.js) | Imprime um log formatado e colorido (`[data] [origem] [tipo] [fonte] mensagem`). |
| [`ExecuteDebugMode.js`](./src/ExecuteDebugMode.js) | Inicia um script Node com `--inspect-brk` para depuração. |

> **Nota sobre `SmartRequire` / `EXTERNAL_NODE_MODULES_PATH`:** as dependências
> NPM são instaladas em uma pasta temporária e o caminho fica em
> `process.env.EXTERNAL_NODE_MODULES_PATH`. Módulos como `ExtractTarGz` e
> `ListTarGzContents` usam `SmartRequire("tar")` para carregar a dependência
> desse local. A melhoria desse mecanismo é um item de planejamento interno.

---

## Troubleshooting

| Sintoma | Causa / solução |
|---------|-----------------|
| `Pacote não encontrado [<nome>]` | O pacote pedido em `loadScript(...)` não está em `metaPlatformDependencies`. Acrescente a URI completa (`Module/Layer/pacote`). |
| Módulo NPM não carrega (ex.: `tar`) | A dependência precisa estar em `npmDependencies` (instalada em `EXTERNAL_NODE_MODULES_PATH`). |
| Falha ao materializar repositório | Confira os parâmetros da fonte: `repoPath` (`LOCAL_FS`), `fileId` (`GOOGLE_DRIVE`) ou `repositoryOwner`/`repositoryName` (`GITHUB_RELEASE`). |

## Links relacionados

- [Open Standard](https://github.com/Meta-Platform/meta-platform-open-standard) ·
  [Mapa de Repositórios](https://github.com/Meta-Platform/.github/blob/main/docs/repository-map.md) ·
  [setup-wizard](https://github.com/Meta-Platform/meta-platform-setup-wizard-command-line) ·
  [package-executor](https://github.com/Meta-Platform/meta-platform-package-executor-command-line)

## Licença

Distribuído sob licença BSD-3-Clause — veja [`LICENSE`](./LICENSE).
