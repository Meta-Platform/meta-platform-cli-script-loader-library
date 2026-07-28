/*
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ CÓPIA DELIBERADA — a única admitida pelo Logging Standard.                 │
 * │                                                                           │
 * │ A implementação canônica é a `logger.lib` do EssentialRepo                 │
 * │ (Commons.Module/Libraries.layer/logger.lib). Esta cópia existe porque      │
 * │ ESTE pacote é o próprio carregador: quando ele roda, ainda não há          │
 * │ ecossistema instalado de onde carregar a lib canônica.                     │
 * │                                                                           │
 * │ Implementa o MESMO formato de terminal e o MESMO esquema JSONL, e nada     │
 * │ além disso — sem rotação, sem retenção, sem escrita assíncrona.            │
 * │ Qualquer mudança no formato precisa ser refletida aqui e na lib canônica.  │
 * │                                                                           │
 * │ Spec: meta-platform-open-standard/specifications/logging-standard.md       │
 * └───────────────────────────────────────────────────────────────────────────┘
 */

const fs   = require("fs")
const path = require("path")
const util = require("util")

const colors = require("colors")

const LEVELS = ["trace", "debug", "info", "message", "warn", "error", "fatal"]

const SEVERITY = LEVELS.reduce((map, level, index) => {
	map[level] = index
	return map
}, {})

const ALIASES = { warning : "warn", success : "message", log : "message" }

const PAINT_BY_LEVEL = {
	trace   : (text) => colors.gray(text),
	debug   : (text) => colors.bgGray(text),
	info    : (text) => colors.bgBlue(text),
	message : (text) => colors.bgGreen.black(text),
	warn    : (text) => colors.bgYellow.black(text),
	error   : (text) => colors.bgRed.white(text),
	fatal   : (text) => colors.bgRed.white.bold(text)
}

const GLOBAL_KEY  = "Log"
const GLOBAL_MARK = Symbol.for("meta-platform.logger.globalLogger")
const BRIDGE_MARK = Symbol.for("meta-platform.logger.consoleBridge")

const GetLocalISODateTime = () => {
	const now = new Date()
	return (new Date(now.getTime() - (now.getTimezoneOffset() * 60000)))
		.toISOString()
		.slice(0, 23)
}

const NormalizeLevel = (level, fallback) => {

	if (typeof level !== "string") {
		return fallback
	}

	const normalized = level.trim().toLowerCase()

	return SEVERITY[normalized] !== undefined
		? normalized
		: (ALIASES[normalized] || fallback)
}

const Serialize = (value) => {

	if (value === null || value === undefined) {
		return null
	}

	if (value instanceof Error) {
		return { name : value.name, message : value.message, stack : value.stack }
	}

	try {
		return JSON.parse(JSON.stringify(value))
	} catch (error) {
		return String(value)
	}
}

const CreateMinimalLogger = ({
	origin,
	logsDirPath,
	level,
	consoleLevel,
	context = {}
}) => {

	const fileFloor    = NormalizeLevel(level, "info")
	const consoleFloor = NormalizeLevel(consoleLevel, "message")

	const WriteToConsole = (record) => {

		try {

			const paint = PAINT_BY_LEVEL[record.level] || PAINT_BY_LEVEL.info
			const plain = !process.stdout || !process.stdout.isTTY

			const format = (text, Paint) => plain ? text : Paint(text)

			const line = [
				format(`[${record.ts}]`, colors.dim),
				format(`[${record.origin}]`, (text) => colors.bgYellow.black(text)),
				format(`[${String(record.level).padEnd(7)}]`, paint),
				format(`[${String(record.source).padEnd(23)}]`, colors.inverse),
				record.message
			].join(" ")

			/* process.stdout.write, nunca console — a ponte se realimentaria. */
			process.stdout.write(`${line}\n`)

		} catch (error) {
			/* Log é observabilidade, não caminho crítico. */
		}
	}

	const WriteToFile = (record) => {

		try {

			if (!logsDirPath) {
				return
			}

			fs.mkdirSync(logsDirPath, { recursive : true })

			const fileName = `${record.ts.slice(0, 10)}.jsonl`

			fs.appendFileSync(path.join(logsDirPath, fileName), `${JSON.stringify(record)}\n`, "utf8")

		} catch (error) {
			/* Log é observabilidade, não caminho crítico. */
		}
	}

	const Emit = (levelName, source, message, data) => {

		try {

			const record = {
				ts         : GetLocalISODateTime(),
				level      : levelName,
				source     : source === undefined || source === null ? "-" : String(source),
				origin,
				pid        : process.pid,
				package    : null,
				instanceId : null,
				...context,
				message    : typeof message === "string" ? message : util.format(message),
				data       : data === undefined ? null : Serialize(data)
			}

			if (SEVERITY[levelName] >= SEVERITY[consoleFloor]) {
				WriteToConsole(record)
			}

			if (SEVERITY[levelName] >= SEVERITY[fileFloor]) {
				WriteToFile(record)
			}

		} catch (error) {
			/* Log é observabilidade, não caminho crítico. */
		}
	}

	const logger = LEVELS.reduce((built, levelName) => {

		built[levelName] = (source, message, data) =>
			(message === undefined && data === undefined)
				? Emit(levelName, "-", source, undefined)
				: Emit(levelName, source, message, data)

		return built

	}, {})

	logger.source = (sourceName) => LEVELS.reduce((built, levelName) => {
		built[levelName] = (message, data) => Emit(levelName, sourceName, message, data)
		return built
	}, { source : logger.source, child : logger.child })

	logger.child     = () => logger
	logger.Flush     = async () => {}
	logger.FlushSync = () => {}
	logger.Close     = async () => {}
	logger.minimal   = true

	return logger
}

const InstallConsoleBridge = (logger) => {

	if (console[BRIDGE_MARK]) {
		return console[BRIDGE_MARK].Uninstall
	}

	const BRIDGED = {
		log   : { level : "message", source : "<stdout>" },
		info  : { level : "info",    source : "<stdout>" },
		debug : { level : "debug",   source : "<stdout>" },
		warn  : { level : "warn",    source : "<stderr>" },
		error : { level : "error",   source : "<stderr>" }
	}

	const originalMethods = {}

	Object.keys(BRIDGED).forEach((methodName) => {

		const { level, source } = BRIDGED[methodName]

		originalMethods[methodName] = console[methodName]

		console[methodName] = (...args) => {
			try {
				logger[level](source, util.format(...args), args.find((arg) => arg instanceof Error))
			} catch (error) {
				/* segue */
			}
		}
	})

	/*
	 * O Uninstall precisa existir para que a `logger.lib` canônica consiga
	 * SUBSTITUIR esta ponte quando o ecossistema já estiver disponível. Sem ele,
	 * o console continuaria apontando para o logger mínimo — sem arquivo, sem
	 * rotação — pelo resto do processo.
	 */
	const Uninstall = () => {

		Object.keys(originalMethods).forEach((methodName) => {
			console[methodName] = originalMethods[methodName]
		})

		delete console[BRIDGE_MARK]
	}

	Object.defineProperty(console, BRIDGE_MARK, {
		value        : { Uninstall, originalMethods },
		configurable : true,
		enumerable   : false,
		writable     : false
	})

	return Uninstall
}

/*
 * Instala `globalThis.Log` com a versão mínima. Idempotente, e marcada como
 * `minimal` para que a lib canônica possa substituí-la quando o ecossistema já
 * existir.
 */
const InstallMinimalGlobalLogger = ({
	origin       = "script-loader",
	logsDirPath  = process.env.META_LOGS_DIR || null,
	level        = "info",
	consoleLevel = "message",
	context      = {}
} = {}) => {

	if (globalThis[GLOBAL_MARK]) {
		return globalThis[GLOBAL_KEY]
	}

	const logger = CreateMinimalLogger({ origin, logsDirPath, level, consoleLevel, context })

	const UninstallBridge = InstallConsoleBridge(logger)

	globalThis[GLOBAL_KEY] = logger

	Object.defineProperty(globalThis, GLOBAL_MARK, {
		value        : { minimal : true, UninstallBridge, UnregisterExitFlush : () => {} },
		configurable : true,
		enumerable   : false,
		writable     : false
	})

	return logger
}

module.exports = InstallMinimalGlobalLogger
module.exports.InstallMinimalGlobalLogger = InstallMinimalGlobalLogger
module.exports.CreateMinimalLogger = CreateMinimalLogger
module.exports.LEVELS = LEVELS
