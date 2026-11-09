module.exports = [
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_getTracingInheritableMetadataFromConfig",
    ()=>_getTracingInheritableMetadataFromConfig,
    "ensureConfig",
    ()=>ensureConfig,
    "getCallbackManagerForConfig",
    ()=>getCallbackManagerForConfig,
    "mergeConfigs",
    ()=>mergeConfigs,
    "patchConfig",
    ()=>patchConfig,
    "pickRunnableConfigKeys",
    ()=>pickRunnableConfigKeys
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/manager.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/index.js [instrumentation] (ecmascript) <locals>");
;
;
;
//#region src/runnables/config.ts
const CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS = /* @__PURE__ */ new Set([
    "api_key"
]);
const PRIMITIVES = /* @__PURE__ */ new Set([
    "string",
    "number",
    "boolean"
]);
function _getTracingInheritableMetadataFromConfig(config) {
    const configurable = config.configurable ?? {};
    const metadata = config.metadata ?? {};
    const langSmithMetadata = {};
    for (const [key, value] of Object.entries(configurable))if (!key.startsWith("__") && !Object.prototype.hasOwnProperty.call(metadata, key) && !CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS.has(key) && PRIMITIVES.has(typeof value)) langSmithMetadata[key] = value;
    return Object.keys(langSmithMetadata).length > 0 ? langSmithMetadata : void 0;
}
async function getCallbackManagerForConfig(config) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CallbackManager"]._configureSync(config?.callbacks, void 0, config?.tags, void 0, config?.metadata, void 0, {
        tracerInheritableMetadata: config ? _getTracingInheritableMetadataFromConfig(config) : void 0
    });
}
function mergeConfigs(...configs) {
    const copy = {};
    for (const options of configs.filter((c)=>!!c))for (const key of Object.keys(options))if (key === "metadata") copy[key] = {
        ...copy[key],
        ...options[key]
    };
    else if (key === "tags") {
        const baseKeys = copy[key] ?? [];
        copy[key] = [
            ...new Set(baseKeys.concat(options[key] ?? []))
        ];
    } else if (key === "configurable") copy[key] = {
        ...copy[key],
        ...options[key]
    };
    else if (key === "timeout") {
        if (copy.timeout === void 0) copy.timeout = options.timeout;
        else if (options.timeout !== void 0) copy.timeout = Math.min(copy.timeout, options.timeout);
    } else if (key === "signal") {
        if (copy.signal === void 0) copy.signal = options.signal;
        else if (options.signal !== void 0) {
            if ("any" in AbortSignal) copy.signal = AbortSignal.any([
                copy.signal,
                options.signal
            ]);
            else copy.signal = options.signal;
        }
    } else if (key === "callbacks") {
        const baseCallbacks = copy.callbacks;
        const providedCallbacks = options.callbacks;
        if (Array.isArray(providedCallbacks)) {
            if (!baseCallbacks) copy.callbacks = providedCallbacks;
            else if (Array.isArray(baseCallbacks)) copy.callbacks = baseCallbacks.concat(providedCallbacks);
            else {
                const manager = baseCallbacks.copy();
                for (const callback of providedCallbacks)manager.addHandler((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureHandler"])(callback), true);
                copy.callbacks = manager;
            }
        } else if (providedCallbacks) {
            if (!baseCallbacks) copy.callbacks = providedCallbacks;
            else if (Array.isArray(baseCallbacks)) {
                const manager = providedCallbacks.copy();
                for (const callback of baseCallbacks)manager.addHandler((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureHandler"])(callback), true);
                copy.callbacks = manager;
            } else copy.callbacks = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CallbackManager"](providedCallbacks._parentRunId, {
                handlers: baseCallbacks.handlers.concat(providedCallbacks.handlers),
                inheritableHandlers: baseCallbacks.inheritableHandlers.concat(providedCallbacks.inheritableHandlers),
                tags: Array.from(new Set(baseCallbacks.tags.concat(providedCallbacks.tags))),
                inheritableTags: Array.from(new Set(baseCallbacks.inheritableTags.concat(providedCallbacks.inheritableTags))),
                metadata: {
                    ...baseCallbacks.metadata,
                    ...providedCallbacks.metadata
                }
            });
        }
    } else {
        const typedKey = key;
        copy[typedKey] = options[typedKey] ?? copy[typedKey];
    }
    return copy;
}
/**
* Ensure that a passed config is an object with all required keys present.
*/ function ensureConfig(config) {
    const implicitConfig = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].getRunnableConfig();
    let empty = {
        tags: [],
        metadata: {},
        recursionLimit: 25,
        runId: void 0
    };
    if (implicitConfig) {
        const { runId, runName, ...rest } = implicitConfig;
        empty = Object.entries(rest).reduce((currentConfig, [key, value])=>{
            if (value !== void 0) currentConfig[key] = value;
            return currentConfig;
        }, empty);
    }
    if (config) empty = Object.entries(config).reduce((currentConfig, [key, value])=>{
        if (value !== void 0) currentConfig[key] = value;
        return currentConfig;
    }, empty);
    if (empty?.configurable) {
        if (typeof empty.configurable.model === "string" && empty.metadata?.model === void 0) {
            if (!empty.metadata) empty.metadata = {};
            empty.metadata.model = empty.configurable.model;
        }
    }
    if (empty.timeout !== void 0) {
        if (empty.timeout <= 0) throw new Error("Timeout must be a positive number");
        const originalTimeoutMs = empty.timeout;
        const timeoutSignal = AbortSignal.timeout(originalTimeoutMs);
        if (!empty.metadata) empty.metadata = {};
        if (empty.metadata.timeoutMs === void 0) empty.metadata.timeoutMs = originalTimeoutMs;
        if (empty.signal !== void 0) {
            if ("any" in AbortSignal) empty.signal = AbortSignal.any([
                empty.signal,
                timeoutSignal
            ]);
        } else empty.signal = timeoutSignal;
        /**
		* We are deleting the timeout key for the following reasons:
		* - Idempotent normalization: ensureConfig may be called multiple times down the stack. If timeout remains,
		*   each call would synthesize new timeout signals and combine them, changing the effective timeout unpredictably.
		* - Single enforcement path: downstream code relies on signal to enforce cancellation. Leaving timeout means two
		*   competing mechanisms (numeric timeout and signal) can be applied, sometimes with different semantics.
		* - Propagation to children: pickRunnableConfigKeys would keep forwarding timeout to nested runnables, causing
		*   repeated re-normalization and stacked timeouts.
		* - Backward compatibility: a lot of components and tests assume ensureConfig removes timeout post-normalization;
		*   changing that would be a breaking change.
		*/ delete empty.timeout;
    }
    return empty;
}
/**
* Helper function that patches runnable configs with updated properties.
*/ function patchConfig(config = {}, { callbacks, maxConcurrency, recursionLimit, runName, configurable, runId } = {}) {
    const newConfig = ensureConfig(config);
    if (callbacks !== void 0) {
        /**
		* If we're replacing callbacks we need to unset runName
		* since that should apply only to the same run as the original callbacks
		*/ delete newConfig.runName;
        newConfig.callbacks = callbacks;
    }
    if (recursionLimit !== void 0) newConfig.recursionLimit = recursionLimit;
    if (maxConcurrency !== void 0) newConfig.maxConcurrency = maxConcurrency;
    if (runName !== void 0) newConfig.runName = runName;
    if (configurable !== void 0) newConfig.configurable = {
        ...newConfig.configurable,
        ...configurable
    };
    if (runId !== void 0) delete newConfig.runId;
    return newConfig;
}
function pickRunnableConfigKeys(config) {
    if (!config) return void 0;
    return {
        configurable: config.configurable,
        recursionLimit: config.recursionLimit,
        callbacks: config.callbacks,
        tags: config.tags,
        metadata: config.metadata,
        maxConcurrency: config.maxConcurrency,
        timeout: config.timeout,
        signal: config.signal,
        store: config.store,
        context: config.context
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/utils.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_RootEventFilter",
    ()=>_RootEventFilter,
    "isRunnableInterface",
    ()=>isRunnableInterface,
    "toBase64Url",
    ()=>toBase64Url
]);
//#region src/runnables/utils.ts
function isRunnableInterface(thing) {
    return thing ? thing.lc_runnable : false;
}
/**
* Utility to filter the root event in the streamEvents implementation.
* This is simply binding the arguments to the namespace to make save on
* a bit of typing in the streamEvents implementation.
*
* TODO: Refactor and remove.
*/ var _RootEventFilter = class {
    includeNames;
    includeTypes;
    includeTags;
    excludeNames;
    excludeTypes;
    excludeTags;
    constructor(fields){
        this.includeNames = fields.includeNames;
        this.includeTypes = fields.includeTypes;
        this.includeTags = fields.includeTags;
        this.excludeNames = fields.excludeNames;
        this.excludeTypes = fields.excludeTypes;
        this.excludeTags = fields.excludeTags;
    }
    includeEvent(event, rootType) {
        let include = this.includeNames === void 0 && this.includeTypes === void 0 && this.includeTags === void 0;
        const eventTags = event.tags ?? [];
        if (this.includeNames !== void 0) include = include || this.includeNames.includes(event.name);
        if (this.includeTypes !== void 0) include = include || this.includeTypes.includes(rootType);
        if (this.includeTags !== void 0) include = include || eventTags.some((tag)=>this.includeTags?.includes(tag));
        if (this.excludeNames !== void 0) include = include && !this.excludeNames.includes(event.name);
        if (this.excludeTypes !== void 0) include = include && !this.excludeTypes.includes(rootType);
        if (this.excludeTags !== void 0) include = include && eventTags.every((tag)=>!this.excludeTags?.includes(tag));
        return include;
    }
};
const toBase64Url = (str)=>{
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/graph_mermaid.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "drawMermaid",
    ()=>drawMermaid,
    "drawMermaidImage",
    ()=>drawMermaidImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/utils.js [instrumentation] (ecmascript)");
;
//#region src/runnables/graph_mermaid.ts
function _escapeNodeLabel(nodeLabel) {
    return nodeLabel.replace(/[^a-zA-Z-_0-9]/g, "_");
}
const MARKDOWN_SPECIAL_CHARS = [
    "*",
    "_",
    "`"
];
function _generateMermaidGraphStyles(nodeColors) {
    let styles = "";
    for (const [className, color] of Object.entries(nodeColors))styles += `\tclassDef ${className} ${color};\n`;
    return styles;
}
/**
* Draws a Mermaid graph using the provided graph data
*/ function drawMermaid(nodes, edges, config) {
    const { firstNode, lastNode, nodeColors, withStyles = true, curveStyle = "linear", wrapLabelNWords = 9 } = config ?? {};
    let mermaidGraph = withStyles ? `%%{init: {'flowchart': {'curve': '${curveStyle}'}}}%%\ngraph TD;\n` : "graph TD;\n";
    if (withStyles) {
        const defaultClassLabel = "default";
        const formatDict = {
            [defaultClassLabel]: "{0}({1})"
        };
        if (firstNode !== void 0) formatDict[firstNode] = "{0}([{1}]):::first";
        if (lastNode !== void 0) formatDict[lastNode] = "{0}([{1}]):::last";
        for (const [key, node] of Object.entries(nodes)){
            const nodeName = node.name.split(":").pop() ?? "";
            let finalLabel = MARKDOWN_SPECIAL_CHARS.some((char)=>nodeName.startsWith(char) && nodeName.endsWith(char)) ? `<p>${nodeName}</p>` : nodeName;
            if (Object.keys(node.metadata ?? {}).length) finalLabel += `<hr/><small><em>${Object.entries(node.metadata ?? {}).map(([k, v])=>`${k} = ${v}`).join("\n")}</em></small>`;
            const nodeLabel = (formatDict[key] ?? formatDict[defaultClassLabel]).replace("{0}", _escapeNodeLabel(key)).replace("{1}", finalLabel);
            mermaidGraph += `\t${nodeLabel}\n`;
        }
    }
    const edgeGroups = {};
    for (const edge of edges){
        const srcParts = edge.source.split(":");
        const tgtParts = edge.target.split(":");
        const commonPrefix = srcParts.filter((src, i)=>src === tgtParts[i]).join(":");
        if (!edgeGroups[commonPrefix]) edgeGroups[commonPrefix] = [];
        edgeGroups[commonPrefix].push(edge);
    }
    const seenSubgraphs = /* @__PURE__ */ new Set();
    function sortPrefixesByDepth(prefixes) {
        return [
            ...prefixes
        ].sort((a, b)=>{
            return a.split(":").length - b.split(":").length;
        });
    }
    function addSubgraph(edges, prefix) {
        const selfLoop = edges.length === 1 && edges[0].source === edges[0].target;
        if (prefix && !selfLoop) {
            const subgraph = prefix.split(":").pop();
            if (seenSubgraphs.has(prefix)) throw new Error(`Found duplicate subgraph '${subgraph}' at '${prefix} -- this likely means that you're reusing a subgraph node with the same name. Please adjust your graph to have subgraph nodes with unique names.`);
            seenSubgraphs.add(prefix);
            mermaidGraph += `\tsubgraph ${subgraph}\n`;
        }
        const nestedPrefixes = sortPrefixesByDepth(Object.keys(edgeGroups).filter((nestedPrefix)=>nestedPrefix.startsWith(`${prefix}:`) && nestedPrefix !== prefix && nestedPrefix.split(":").length === prefix.split(":").length + 1));
        for (const nestedPrefix of nestedPrefixes)addSubgraph(edgeGroups[nestedPrefix], nestedPrefix);
        for (const edge of edges){
            const { source, target, data, conditional } = edge;
            let edgeLabel = "";
            if (data !== void 0) {
                let edgeData = data;
                const words = edgeData.split(" ");
                if (words.length > wrapLabelNWords) edgeData = Array.from({
                    length: Math.ceil(words.length / wrapLabelNWords)
                }, (_, i)=>words.slice(i * wrapLabelNWords, (i + 1) * wrapLabelNWords).join(" ")).join("&nbsp;<br>&nbsp;");
                edgeLabel = conditional ? ` -. &nbsp;${edgeData}&nbsp; .-> ` : ` -- &nbsp;${edgeData}&nbsp; --> `;
            } else edgeLabel = conditional ? " -.-> " : " --> ";
            mermaidGraph += `\t${_escapeNodeLabel(source)}${edgeLabel}${_escapeNodeLabel(target)};\n`;
        }
        if (prefix && !selfLoop) mermaidGraph += "	end\n";
    }
    addSubgraph(edgeGroups[""] ?? [], "");
    for(const prefix in edgeGroups)if (!prefix.includes(":") && prefix !== "") addSubgraph(edgeGroups[prefix], prefix);
    if (withStyles) mermaidGraph += _generateMermaidGraphStyles(nodeColors ?? {});
    return mermaidGraph;
}
/**
* Renders Mermaid graph using the Mermaid.INK API.
*
* @example
* ```javascript
* const image = await drawMermaidImage(mermaidSyntax, {
*   backgroundColor: "white",
*   imageType: "png",
* });
* fs.writeFileSync("image.png", image);
* ```
*
* @param mermaidSyntax - The Mermaid syntax to render.
* @param config - The configuration for the image.
* @returns The image as a Blob.
*/ async function drawMermaidImage(mermaidSyntax, config) {
    let backgroundColor = config?.backgroundColor ?? "white";
    const imageType = config?.imageType ?? "png";
    const mermaidSyntaxEncoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["toBase64Url"])(mermaidSyntax);
    if (backgroundColor !== void 0) {
        if (!/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(backgroundColor)) backgroundColor = `!${backgroundColor}`;
    }
    const imageUrl = `https://mermaid.ink/img/${mermaidSyntaxEncoded}?bgColor=${backgroundColor}&type=${imageType}`;
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error([
        `Failed to render the graph using the Mermaid.INK API.`,
        `Status code: ${res.status}`,
        `Status text: ${res.statusText}`
    ].join("\n"));
    return await res.blob();
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/graph.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Graph",
    ()=>Graph,
    "graph_exports",
    ()=>graph_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/utils.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$graph_mermaid$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/graph_mermaid.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_schema.js [instrumentation] (ecmascript) <locals>");
;
;
;
;
;
//#region src/runnables/graph.ts
var graph_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["__exportAll"])({
    Graph: ()=>Graph
});
function nodeDataStr(id, data) {
    if (id !== void 0 && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["validate"])(id)) return id;
    else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRunnableInterface"])(data)) try {
        let dataStr = data.getName();
        dataStr = dataStr.startsWith("Runnable") ? dataStr.slice(8) : dataStr;
        return dataStr;
    } catch  {
        return data.getName();
    }
    else return data.name ?? "UnknownSchema";
}
function nodeDataJson(node) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRunnableInterface"])(node.data)) return {
        type: "runnable",
        data: {
            id: node.data.lc_id,
            name: node.data.getName()
        }
    };
    else return {
        type: "schema",
        data: {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(node.data.schema),
            title: node.data.name
        }
    };
}
var Graph = class Graph {
    nodes = {};
    edges = [];
    constructor(params){
        this.nodes = params?.nodes ?? this.nodes;
        this.edges = params?.edges ?? this.edges;
    }
    toJSON() {
        const stableNodeIds = {};
        Object.values(this.nodes).forEach((node, i)=>{
            stableNodeIds[node.id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["validate"])(node.id) ? i : node.id;
        });
        return {
            nodes: Object.values(this.nodes).map((node)=>({
                    id: stableNodeIds[node.id],
                    ...nodeDataJson(node)
                })),
            edges: this.edges.map((edge)=>{
                const item = {
                    source: stableNodeIds[edge.source],
                    target: stableNodeIds[edge.target]
                };
                if (typeof edge.data !== "undefined") item.data = edge.data;
                if (typeof edge.conditional !== "undefined") item.conditional = edge.conditional;
                return item;
            })
        };
    }
    addNode(data, id, metadata) {
        if (id !== void 0 && this.nodes[id] !== void 0) throw new Error(`Node with id ${id} already exists`);
        const nodeId = id ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["v4"])();
        const node = {
            id: nodeId,
            data,
            name: nodeDataStr(id, data),
            metadata
        };
        this.nodes[nodeId] = node;
        return node;
    }
    removeNode(node) {
        delete this.nodes[node.id];
        this.edges = this.edges.filter((edge)=>edge.source !== node.id && edge.target !== node.id);
    }
    addEdge(source, target, data, conditional) {
        if (this.nodes[source.id] === void 0) throw new Error(`Source node ${source.id} not in graph`);
        if (this.nodes[target.id] === void 0) throw new Error(`Target node ${target.id} not in graph`);
        const edge = {
            source: source.id,
            target: target.id,
            data,
            conditional
        };
        this.edges.push(edge);
        return edge;
    }
    firstNode() {
        return _firstNode(this);
    }
    lastNode() {
        return _lastNode(this);
    }
    /**
	* Add all nodes and edges from another graph.
	* Note this doesn't check for duplicates, nor does it connect the graphs.
	*/ extend(graph, prefix = "") {
        let finalPrefix = prefix;
        if (Object.values(graph.nodes).map((node)=>node.id).every(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["validate"])) finalPrefix = "";
        const prefixed = (id)=>{
            return finalPrefix ? `${finalPrefix}:${id}` : id;
        };
        Object.entries(graph.nodes).forEach(([key, value])=>{
            this.nodes[prefixed(key)] = {
                ...value,
                id: prefixed(key)
            };
        });
        const newEdges = graph.edges.map((edge)=>{
            return {
                ...edge,
                source: prefixed(edge.source),
                target: prefixed(edge.target)
            };
        });
        this.edges = [
            ...this.edges,
            ...newEdges
        ];
        const first = graph.firstNode();
        const last = graph.lastNode();
        return [
            first ? {
                id: prefixed(first.id),
                data: first.data
            } : void 0,
            last ? {
                id: prefixed(last.id),
                data: last.data
            } : void 0
        ];
    }
    trimFirstNode() {
        const firstNode = this.firstNode();
        if (firstNode && _firstNode(this, [
            firstNode.id
        ])) this.removeNode(firstNode);
    }
    trimLastNode() {
        const lastNode = this.lastNode();
        if (lastNode && _lastNode(this, [
            lastNode.id
        ])) this.removeNode(lastNode);
    }
    /**
	* Return a new graph with all nodes re-identified,
	* using their unique, readable names where possible.
	*/ reid() {
        const nodeLabels = Object.fromEntries(Object.values(this.nodes).map((node)=>[
                node.id,
                node.name
            ]));
        const nodeLabelCounts = /* @__PURE__ */ new Map();
        Object.values(nodeLabels).forEach((label)=>{
            nodeLabelCounts.set(label, (nodeLabelCounts.get(label) || 0) + 1);
        });
        const getNodeId = (nodeId)=>{
            const label = nodeLabels[nodeId];
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["validate"])(nodeId) && nodeLabelCounts.get(label) === 1) return label;
            else return nodeId;
        };
        return new Graph({
            nodes: Object.fromEntries(Object.entries(this.nodes).map(([id, node])=>[
                    getNodeId(id),
                    {
                        ...node,
                        id: getNodeId(id)
                    }
                ])),
            edges: this.edges.map((edge)=>({
                    ...edge,
                    source: getNodeId(edge.source),
                    target: getNodeId(edge.target)
                }))
        });
    }
    drawMermaid(params) {
        const { withStyles, curveStyle, nodeColors = {
            default: "fill:#f2f0ff,line-height:1.2",
            first: "fill-opacity:0",
            last: "fill:#bfb6fc"
        }, wrapLabelNWords } = params ?? {};
        const graph = this.reid();
        const firstNode = graph.firstNode();
        const lastNode = graph.lastNode();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$graph_mermaid$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["drawMermaid"])(graph.nodes, graph.edges, {
            firstNode: firstNode?.id,
            lastNode: lastNode?.id,
            withStyles,
            curveStyle,
            nodeColors,
            wrapLabelNWords
        });
    }
    async drawMermaidPng(params) {
        const mermaidSyntax = this.drawMermaid(params);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$graph_mermaid$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["drawMermaidImage"])(mermaidSyntax, {
            backgroundColor: params?.backgroundColor
        });
    }
};
/**
* Find the single node that is not a target of any edge.
* Exclude nodes/sources with ids in the exclude list.
* If there is no such node, or there are multiple, return undefined.
* When drawing the graph, this node would be the origin.
*/ function _firstNode(graph, exclude = []) {
    const targets = new Set(graph.edges.filter((edge)=>!exclude.includes(edge.source)).map((edge)=>edge.target));
    const found = [];
    for (const node of Object.values(graph.nodes))if (!exclude.includes(node.id) && !targets.has(node.id)) found.push(node);
    return found.length === 1 ? found[0] : void 0;
}
/**
* Find the single node that is not a source of any edge.
* Exclude nodes/targets with ids in the exclude list.
* If there is no such node, or there are multiple, return undefined.
* When drawing the graph, this node would be the destination.
*/ function _lastNode(graph, exclude = []) {
    const sources = new Set(graph.edges.filter((edge)=>!exclude.includes(edge.target)).map((edge)=>edge.source));
    const found = [];
    for (const node of Object.values(graph.nodes))if (!exclude.includes(node.id) && !sources.has(node.id)) found.push(node);
    return found.length === 1 ? found[0] : void 0;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/wrappers.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToHttpEventStream",
    ()=>convertToHttpEventStream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [instrumentation] (ecmascript)");
;
//#region src/runnables/wrappers.ts
function convertToHttpEventStream(stream) {
    const encoder = new TextEncoder();
    const finalStream = new ReadableStream({
        async start (controller) {
            for await (const chunk of stream)controller.enqueue(encoder.encode(`event: data\ndata: ${JSON.stringify(chunk)}\n\n`));
            controller.enqueue(encoder.encode("event: end\n\n"));
            controller.close();
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromReadableStream(finalStream);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/iter.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "consumeAsyncGenerator",
    ()=>consumeAsyncGenerator,
    "consumeAsyncIterableInContext",
    ()=>consumeAsyncIterableInContext,
    "consumeIteratorInContext",
    ()=>consumeIteratorInContext,
    "isAsyncGenerator",
    ()=>isAsyncGenerator,
    "isAsyncIterable",
    ()=>isAsyncIterable,
    "isIterableIterator",
    ()=>isIterableIterator,
    "isIterator",
    ()=>isIterator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [instrumentation] (ecmascript)");
;
;
;
//#region src/runnables/iter.ts
function isIterableIterator(thing) {
    return typeof thing === "object" && thing !== null && typeof thing[Symbol.iterator] === "function" && typeof thing.next === "function";
}
const isIterator = (x)=>x != null && typeof x === "object" && "next" in x && typeof x.next === "function";
function isAsyncIterable(thing) {
    return typeof thing === "object" && thing !== null && typeof thing[Symbol.asyncIterator] === "function";
}
function isAsyncGenerator(x) {
    return x != null && typeof x === "object" && typeof x.next === "function";
}
async function consumeAsyncGenerator(generator, onYield) {
    try {
        let iterResult = await generator.next();
        while(!iterResult.done){
            await onYield?.(iterResult.value);
            iterResult = await generator.next();
        }
        return iterResult.value;
    } finally{
        await generator.return?.(void 0);
    }
}
function* consumeIteratorInContext(context, iter) {
    while(true){
        const { value, done } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(context), iter.next.bind(iter), true);
        if (done) break;
        else yield value;
    }
}
async function* consumeAsyncIterableInContext(context, iter) {
    const iterator = iter[Symbol.asyncIterator]();
    while(true){
        const { value, done } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(context), iterator.next.bind(iter), true);
        if (done) break;
        else yield value;
    }
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Runnable",
    ()=>Runnable,
    "RunnableAssign",
    ()=>RunnableAssign,
    "RunnableBinding",
    ()=>RunnableBinding,
    "RunnableEach",
    ()=>RunnableEach,
    "RunnableLambda",
    ()=>RunnableLambda,
    "RunnableMap",
    ()=>RunnableMap,
    "RunnableParallel",
    ()=>RunnableParallel,
    "RunnablePick",
    ()=>RunnablePick,
    "RunnableRetry",
    ()=>RunnableRetry,
    "RunnableSequence",
    ()=>RunnableSequence,
    "RunnableToolLike",
    ()=>RunnableToolLike,
    "RunnableTraceable",
    ()=>RunnableTraceable,
    "RunnableWithFallbacks",
    ()=>RunnableWithFallbacks,
    "_coerceToDict",
    ()=>_coerceToDict,
    "_coerceToRunnable",
    ()=>_coerceToRunnable,
    "convertRunnableToTool",
    ()=>convertRunnableToTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/utils.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/signal.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$log_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/log_stream.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$event_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/event_stream.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$p$2d$retry$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/p-retry/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/async_caller.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$root_listener$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/root_listener.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/utils.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$graph$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/graph.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$wrappers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/wrappers.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/iter.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$singletons$2f$traceable$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/singletons/traceable.mjs [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$singletons$2f$traceable$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/singletons/traceable.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v3/external.js [instrumentation] (ecmascript) <export * as z>");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
//#region src/runnables/base.ts
function _coerceToDict(value, defaultKey) {
    return value && !Array.isArray(value) && !(value instanceof Date) && typeof value === "object" ? value : {
        [defaultKey]: value
    };
}
/**
* A Runnable is a generic unit of work that can be invoked, batched, streamed, and/or
* transformed.
*/ var Runnable = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Serializable"] {
    lc_runnable = true;
    name;
    getName(suffix) {
        const name = this.name ?? this.constructor.lc_name() ?? this.constructor.name;
        return suffix ? `${name}${suffix}` : name;
    }
    /**
	* Add retry logic to an existing runnable.
	* @param fields.stopAfterAttempt The number of attempts to retry.
	* @param fields.onFailedAttempt A function that is called when a retry fails.
	* @returns A new RunnableRetry that, when invoked, will retry according to the parameters.
	*/ withRetry(fields) {
        return new RunnableRetry({
            bound: this,
            kwargs: {},
            config: {},
            maxAttemptNumber: fields?.stopAfterAttempt,
            ...fields
        });
    }
    /**
	* Bind config to a Runnable, returning a new Runnable.
	* @param config New configuration parameters to attach to the new runnable.
	* @returns A new RunnableBinding with a config matching what's passed.
	*/ withConfig(config) {
        return new RunnableBinding({
            bound: this,
            config,
            kwargs: {}
        });
    }
    /**
	* Create a new runnable from the current one that will try invoking
	* other passed fallback runnables if the initial invocation fails.
	* @param fields.fallbacks Other runnables to call if the runnable errors.
	* @returns A new RunnableWithFallbacks.
	*/ withFallbacks(fields) {
        const fallbacks = Array.isArray(fields) ? fields : fields.fallbacks;
        return new RunnableWithFallbacks({
            runnable: this,
            fallbacks
        });
    }
    _getOptionsList(options, length = 0) {
        if (Array.isArray(options) && options.length !== length) throw new Error(`Passed "options" must be an array with the same length as the inputs, but got ${options.length} options for ${length} inputs`);
        if (Array.isArray(options)) return options.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"]);
        if (length > 1 && !Array.isArray(options) && options.runId) {
            console.warn("Provided runId will be used only for the first element of the batch.");
            const subsequent = Object.fromEntries(Object.entries(options).filter(([key])=>key !== "runId"));
            return Array.from({
                length
            }, (_, i)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(i === 0 ? options : subsequent));
        }
        return Array.from({
            length
        }, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options));
    }
    async batch(inputs, options, batchOptions) {
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const maxConcurrency = configList[0]?.maxConcurrency ?? batchOptions?.maxConcurrency;
        const caller = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncCaller"]({
            maxConcurrency,
            onFailedAttempt: (e)=>{
                throw e;
            }
        });
        const batchCalls = inputs.map((input, i)=>caller.call(async ()=>{
                try {
                    return await this.invoke(input, configList[i]);
                } catch (e) {
                    if (batchOptions?.returnExceptions) return e;
                    throw e;
                }
            }));
        return Promise.all(batchCalls);
    }
    /**
	* Default streaming implementation.
	* Subclasses should override this method if they support streaming output.
	* @param input
	* @param options
	*/ async *_streamIterator(input, options) {
        yield this.invoke(input, options);
    }
    /**
	* Stream output in chunks.
	* @param input
	* @param options
	* @returns A readable stream that is also an iterable.
	*/ async stream(input, options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const wrappedGenerator = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncGeneratorWithSetup"]({
            generator: this._streamIterator(input, config),
            config
        });
        await wrappedGenerator.setup;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromAsyncGenerator(wrappedGenerator);
    }
    _separateRunnableConfigFromCallOptions(options) {
        let runnableConfig;
        if (options === void 0) runnableConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        else runnableConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])({
            callbacks: options.callbacks,
            tags: options.tags,
            metadata: options.metadata,
            runName: options.runName,
            configurable: options.configurable,
            recursionLimit: options.recursionLimit,
            maxConcurrency: options.maxConcurrency,
            runId: options.runId,
            timeout: options.timeout,
            signal: options.signal
        });
        const callOptions = {
            ...options
        };
        delete callOptions.callbacks;
        delete callOptions.tags;
        delete callOptions.metadata;
        delete callOptions.runName;
        delete callOptions.configurable;
        delete callOptions.recursionLimit;
        delete callOptions.maxConcurrency;
        delete callOptions.runId;
        delete callOptions.timeout;
        delete callOptions.signal;
        return [
            runnableConfig,
            callOptions
        ];
    }
    async _callWithConfig(func, input, options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const runManager = await (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config))?.handleChainStart(this.toJSON(), _coerceToDict(input, "input"), config.runId, config?.runType, void 0, void 0, config?.runName ?? this.getName());
        delete config.runId;
        let output;
        try {
            const promise = func.call(this, input, config, runManager);
            output = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["raceWithSignal"])(promise, config.signal);
        } catch (e) {
            await runManager?.handleChainError(e);
            throw e;
        }
        await runManager?.handleChainEnd(_coerceToDict(output, "output"));
        return output;
    }
    /**
	* Internal method that handles batching and configuration for a runnable
	* It takes a function, input values, and optional configuration, and
	* returns a promise that resolves to the output values.
	* @param func The function to be executed for each input value.
	* @param input The input values to be processed.
	* @param config Optional configuration for the function execution.
	* @returns A promise that resolves to the output values.
	*/ async _batchWithConfig(func, inputs, options, batchOptions) {
        const optionsList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(optionsList.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"]));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i)=>{
            const handleStartRes = await callbackManager?.handleChainStart(this.toJSON(), _coerceToDict(inputs[i], "input"), optionsList[i].runId, optionsList[i].runType, void 0, void 0, optionsList[i].runName ?? this.getName());
            delete optionsList[i].runId;
            return handleStartRes;
        }));
        let outputs;
        try {
            const promise = func.call(this, inputs, optionsList, runManagers, batchOptions);
            outputs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["raceWithSignal"])(promise, optionsList?.[0]?.signal);
        } catch (e) {
            await Promise.all(runManagers.map((runManager)=>runManager?.handleChainError(e)));
            throw e;
        }
        await Promise.all(runManagers.map((runManager)=>runManager?.handleChainEnd(_coerceToDict(outputs, "output"))));
        return outputs;
    }
    /** @internal */ _concatOutputChunks(first, second) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["concat"])(first, second);
    }
    /**
	* Helper method to transform an Iterator of Input values into an Iterator of
	* Output values, with callbacks.
	* Use this to implement `stream()` or `transform()` in Runnable subclasses.
	*/ async *_transformStreamWithConfig(inputGenerator, transformer, options) {
        let finalInput;
        let finalInputSupported = true;
        let finalOutput;
        let finalOutputSupported = true;
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const callbackManager_ = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config);
        const outerThis = this;
        async function* wrapInputForTracing() {
            for await (const chunk of inputGenerator){
                if (finalInputSupported) {
                    if (finalInput === void 0) finalInput = chunk;
                    else try {
                        finalInput = outerThis._concatOutputChunks(finalInput, chunk);
                    } catch  {
                        finalInput = void 0;
                        finalInputSupported = false;
                    }
                }
                yield chunk;
            }
        }
        let runManager;
        try {
            const pipe = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["pipeGeneratorWithSetup"])(transformer.bind(this), wrapInputForTracing(), async ()=>callbackManager_?.handleChainStart(this.toJSON(), {
                    input: ""
                }, config.runId, config.runType, void 0, void 0, config.runName ?? this.getName(), void 0, {
                    lc_defers_inputs: true
                }), config.signal, config);
            delete config.runId;
            runManager = pipe.setup;
            const streamEventsHandler = runManager?.handlers.find(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$event_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isStreamEventsHandler"]);
            let iterator = pipe.output;
            if (streamEventsHandler !== void 0 && runManager !== void 0) iterator = streamEventsHandler.tapOutputIterable(runManager.runId, iterator);
            const streamLogHandler = runManager?.handlers.find(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$log_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isLogStreamHandler"]);
            if (streamLogHandler !== void 0 && runManager !== void 0) iterator = streamLogHandler.tapOutputIterable(runManager.runId, iterator);
            for await (const chunk of iterator){
                yield chunk;
                if (finalOutputSupported) {
                    if (finalOutput === void 0) finalOutput = chunk;
                    else try {
                        finalOutput = this._concatOutputChunks(finalOutput, chunk);
                    } catch  {
                        finalOutput = void 0;
                        finalOutputSupported = false;
                    }
                }
            }
        } catch (e) {
            await runManager?.handleChainError(e, void 0, void 0, void 0, {
                inputs: _coerceToDict(finalInput, "input")
            });
            throw e;
        }
        await runManager?.handleChainEnd(finalOutput ?? {}, void 0, void 0, void 0, {
            inputs: _coerceToDict(finalInput, "input")
        });
    }
    getGraph(_) {
        const graph = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$graph$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Graph"]();
        const inputNode = graph.addNode({
            name: `${this.getName()}Input`,
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()
        });
        const runnableNode = graph.addNode(this);
        const outputNode = graph.addNode({
            name: `${this.getName()}Output`,
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()
        });
        graph.addEdge(inputNode, runnableNode);
        graph.addEdge(runnableNode, outputNode);
        return graph;
    }
    /**
	* Create a new runnable sequence that runs each individual runnable in series,
	* piping the output of one runnable into another runnable or runnable-like.
	* @param coerceable A runnable, function, or object whose values are functions or runnables.
	* @returns A new runnable sequence.
	*/ pipe(coerceable) {
        return new RunnableSequence({
            first: this,
            last: _coerceToRunnable(coerceable)
        });
    }
    /**
	* Pick keys from the dict output of this runnable. Returns a new runnable.
	*/ pick(keys) {
        return this.pipe(new RunnablePick(keys));
    }
    /**
	* Assigns new fields to the dict output of this runnable. Returns a new runnable.
	*/ assign(mapping) {
        return this.pipe(new RunnableAssign(new RunnableMap({
            steps: mapping
        })));
    }
    /**
	* Default implementation of transform, which buffers input and then calls stream.
	* Subclasses should override this method if they can start producing output while
	* input is still being generated.
	* @param generator
	* @param options
	*/ async *transform(generator, options) {
        let finalChunk;
        for await (const chunk of generator)if (finalChunk === void 0) finalChunk = chunk;
        else finalChunk = this._concatOutputChunks(finalChunk, chunk);
        yield* this._streamIterator(finalChunk, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options));
    }
    /**
	* Stream all output from a runnable, as reported to the callback system.
	* This includes all inner runs of LLMs, Retrievers, Tools, etc.
	* Output is streamed as Log objects, which include a list of
	* jsonpatch ops that describe how the state of the run has changed in each
	* step, and the final state of the run.
	* The jsonpatch ops can be applied in order to construct state.
	*
	* @deprecated Use `.stream()` instead.
	*
	* @param input
	* @param options
	* @param streamOptions
	*/ async *streamLog(input, options, streamOptions) {
        const logStreamCallbackHandler = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$log_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["LogStreamCallbackHandler"]({
            ...streamOptions,
            autoClose: false,
            _schemaFormat: "original"
        });
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        yield* this._streamLog(input, logStreamCallbackHandler, config);
    }
    async *_streamLog(input, logStreamCallbackHandler, config) {
        const { callbacks } = config;
        if (callbacks === void 0) config.callbacks = [
            logStreamCallbackHandler
        ];
        else if (Array.isArray(callbacks)) config.callbacks = callbacks.concat([
            logStreamCallbackHandler
        ]);
        else {
            const copiedCallbacks = callbacks.copy();
            copiedCallbacks.addHandler(logStreamCallbackHandler, true);
            config.callbacks = copiedCallbacks;
        }
        const runnableStreamPromise = this.stream(input, config);
        async function consumeRunnableStream() {
            try {
                const runnableStream = await runnableStreamPromise;
                for await (const chunk of runnableStream){
                    const patch = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$log_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunLogPatch"]({
                        ops: [
                            {
                                op: "add",
                                path: "/streamed_output/-",
                                value: chunk
                            }
                        ]
                    });
                    await logStreamCallbackHandler.writer.write(patch);
                }
            } finally{
                await logStreamCallbackHandler.writer.close();
            }
        }
        const runnableStreamConsumePromise = consumeRunnableStream();
        try {
            for await (const log of logStreamCallbackHandler)yield log;
        } finally{
            await runnableStreamConsumePromise;
        }
    }
    streamEvents(input, options, streamOptions) {
        let stream;
        if (options.version === "v1") stream = this._streamEventsV1(input, options, streamOptions);
        else if (options.version === "v2") stream = this._streamEventsV2(input, options, streamOptions);
        else throw new Error(`Only versions "v1" and "v2" of the schema are currently supported.`);
        if (options.encoding === "text/event-stream") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$wrappers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToHttpEventStream"])(stream);
        else return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromAsyncGenerator(stream);
    }
    async *_streamEventsV2(input, options, streamOptions) {
        const eventStreamer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$event_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["EventStreamCallbackHandler"]({
            ...streamOptions,
            autoClose: false
        });
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const runId = config.runId ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["v7"])();
        config.runId = runId;
        const callbacks = config.callbacks;
        if (callbacks === void 0) config.callbacks = [
            eventStreamer
        ];
        else if (Array.isArray(callbacks)) config.callbacks = callbacks.concat(eventStreamer);
        else {
            const copiedCallbacks = callbacks.copy();
            copiedCallbacks.addHandler(eventStreamer, true);
            config.callbacks = copiedCallbacks;
        }
        const abortController = new AbortController();
        const outerThis = this;
        async function consumeRunnableStream() {
            let signal;
            try {
                if (config.signal) {
                    if ("any" in AbortSignal) signal = AbortSignal.any([
                        abortController.signal,
                        config.signal
                    ]);
                    else {
                        const composed = new AbortController();
                        config.signal.addEventListener("abort", ()=>composed.abort(), {
                            once: true
                        });
                        abortController.signal.addEventListener("abort", ()=>composed.abort(), {
                            once: true
                        });
                        signal = composed.signal;
                    }
                } else signal = abortController.signal;
                const runnableStream = await outerThis.stream(input, {
                    ...config,
                    signal
                });
                const tappedStream = eventStreamer.tapOutputIterable(runId, runnableStream);
                for await (const _ of tappedStream)if (abortController.signal.aborted) break;
            } finally{
                await eventStreamer.finish();
            }
        }
        const runnableStreamConsumePromise = consumeRunnableStream();
        let firstEventSent = false;
        let firstEventRunId;
        try {
            for await (const event of eventStreamer){
                if (!firstEventSent) {
                    event.data.input = input;
                    firstEventSent = true;
                    firstEventRunId = event.run_id;
                    yield event;
                    continue;
                }
                if (event.run_id === firstEventRunId && event.event.endsWith("_end")) {
                    if (event.data?.input) delete event.data.input;
                }
                yield event;
            }
        } finally{
            abortController.abort();
            await runnableStreamConsumePromise;
        }
    }
    async *_streamEventsV1(input, options, streamOptions) {
        let runLog;
        let hasEncounteredStartEvent = false;
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const rootTags = config.tags ?? [];
        const rootMetadata = config.metadata ?? {};
        const rootName = config.runName ?? this.getName();
        const logStreamCallbackHandler = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$log_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["LogStreamCallbackHandler"]({
            ...streamOptions,
            autoClose: false,
            _schemaFormat: "streaming_events"
        });
        const rootEventFilter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_RootEventFilter"]({
            ...streamOptions
        });
        const logStream = this._streamLog(input, logStreamCallbackHandler, config);
        for await (const log of logStream){
            if (!runLog) runLog = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$log_stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunLog"].fromRunLogPatch(log);
            else runLog = runLog.concat(log);
            if (runLog.state === void 0) throw new Error(`Internal error: "streamEvents" state is missing. Please open a bug report.`);
            if (!hasEncounteredStartEvent) {
                hasEncounteredStartEvent = true;
                const state = {
                    ...runLog.state
                };
                const event = {
                    run_id: state.id,
                    event: `on_${state.type}_start`,
                    name: rootName,
                    tags: rootTags,
                    metadata: rootMetadata,
                    data: {
                        input
                    }
                };
                if (rootEventFilter.includeEvent(event, state.type)) yield event;
            }
            const paths = log.ops.filter((op)=>op.path.startsWith("/logs/")).map((op)=>op.path.split("/")[2]);
            const dedupedPaths = [
                ...new Set(paths)
            ];
            for (const path of dedupedPaths){
                let eventType;
                let data = {};
                const logEntry = runLog.state.logs[path];
                if (logEntry.end_time === void 0) {
                    if (logEntry.streamed_output.length > 0) eventType = "stream";
                    else eventType = "start";
                } else eventType = "end";
                if (eventType === "start") {
                    if (logEntry.inputs !== void 0) data.input = logEntry.inputs;
                } else if (eventType === "end") {
                    if (logEntry.inputs !== void 0) data.input = logEntry.inputs;
                    data.output = logEntry.final_output;
                } else if (eventType === "stream") {
                    const chunkCount = logEntry.streamed_output.length;
                    if (chunkCount !== 1) throw new Error(`Expected exactly one chunk of streamed output, got ${chunkCount} instead. Encountered in: "${logEntry.name}"`);
                    data = {
                        chunk: logEntry.streamed_output[0]
                    };
                    logEntry.streamed_output = [];
                }
                yield {
                    event: `on_${logEntry.type}_${eventType}`,
                    name: logEntry.name,
                    run_id: logEntry.id,
                    tags: logEntry.tags,
                    metadata: logEntry.metadata,
                    data
                };
            }
            const { state } = runLog;
            if (state.streamed_output.length > 0) {
                const chunkCount = state.streamed_output.length;
                if (chunkCount !== 1) throw new Error(`Expected exactly one chunk of streamed output, got ${chunkCount} instead. Encountered in: "${state.name}"`);
                const data = {
                    chunk: state.streamed_output[0]
                };
                state.streamed_output = [];
                const event = {
                    event: `on_${state.type}_stream`,
                    run_id: state.id,
                    tags: rootTags,
                    metadata: rootMetadata,
                    name: rootName,
                    data
                };
                if (rootEventFilter.includeEvent(event, state.type)) yield event;
            }
        }
        const state = runLog?.state;
        if (state !== void 0) {
            const event = {
                event: `on_${state.type}_end`,
                name: rootName,
                run_id: state.id,
                tags: rootTags,
                metadata: rootMetadata,
                data: {
                    output: state.final_output
                }
            };
            if (rootEventFilter.includeEvent(event, state.type)) yield event;
        }
    }
    static isRunnable(thing) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRunnableInterface"])(thing);
    }
    /**
	* Bind lifecycle listeners to a Runnable, returning a new Runnable.
	* The Run object contains information about the run, including its id,
	* type, input, output, error, startTime, endTime, and any tags or metadata
	* added to the run.
	*
	* @param {Object} params - The object containing the callback functions.
	* @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
	* @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
	* @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
	*/ withListeners({ onStart, onEnd, onError }) {
        return new RunnableBinding({
            bound: this,
            config: {},
            configFactories: [
                (config)=>({
                        callbacks: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$root_listener$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RootListenersTracer"]({
                                config,
                                onStart,
                                onEnd,
                                onError
                            })
                        ]
                    })
            ]
        });
    }
    /**
	* Convert a runnable to a tool. Return a new instance of `RunnableToolLike`
	* which contains the runnable, name, description and schema.
	*
	* @template {T extends RunInput = RunInput} RunInput - The input type of the runnable. Should be the same as the `RunInput` type of the runnable.
	*
	* @param fields
	* @param {string | undefined} [fields.name] The name of the tool. If not provided, it will default to the name of the runnable.
	* @param {string | undefined} [fields.description] The description of the tool. Falls back to the description on the Zod schema if not provided, or undefined if neither are provided.
	* @param {z.ZodType<T>} [fields.schema] The Zod schema for the input of the tool. Infers the Zod type from the input type of the runnable.
	* @returns {RunnableToolLike<z.ZodType<T>, RunOutput>} An instance of `RunnableToolLike` which is a runnable that can be used as a tool.
	*/ asTool(fields) {
        return convertRunnableToTool(this, fields);
    }
};
/**
* Wraps a runnable and applies partial config upon invocation.
*
* @example
* ```typescript
* import {
*   type RunnableConfig,
*   RunnableLambda,
* } from "@langchain/core/runnables";
*
* const enhanceProfile = (
*   profile: Record<string, any>,
*   config?: RunnableConfig
* ) => {
*   if (config?.configurable?.role) {
*     return { ...profile, role: config.configurable.role };
*   }
*   return profile;
* };
*
* const runnable = RunnableLambda.from(enhanceProfile);
*
* // Bind configuration to the runnable to set the user's role dynamically
* const adminRunnable = runnable.withConfig({ configurable: { role: "Admin" } });
* const userRunnable = runnable.withConfig({ configurable: { role: "User" } });
*
* const result1 = await adminRunnable.invoke({
*   name: "Alice",
*   email: "alice@example.com"
* });
*
* // { name: "Alice", email: "alice@example.com", role: "Admin" }
*
* const result2 = await userRunnable.invoke({
*   name: "Bob",
*   email: "bob@example.com"
* });
*
* // { name: "Bob", email: "bob@example.com", role: "User" }
* ```
*/ var RunnableBinding = class RunnableBinding extends Runnable {
    static lc_name() {
        return "RunnableBinding";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    lc_serializable = true;
    bound;
    config;
    kwargs;
    configFactories;
    constructor(fields){
        super(fields);
        this.bound = fields.bound;
        this.kwargs = fields.kwargs;
        this.config = fields.config;
        this.configFactories = fields.configFactories;
    }
    getName(suffix) {
        return this.bound.getName(suffix);
    }
    async _mergeConfig(...options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeConfigs"])(this.config, ...options);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeConfigs"])(config, ...this.configFactories ? await Promise.all(this.configFactories.map(async (configFactory)=>await configFactory(config))) : []);
    }
    withConfig(config) {
        return new this.constructor({
            bound: this.bound,
            kwargs: this.kwargs,
            config: {
                ...this.config,
                ...config
            }
        });
    }
    withRetry(fields) {
        return new RunnableRetry({
            bound: this.bound,
            kwargs: this.kwargs,
            config: this.config,
            maxAttemptNumber: fields?.stopAfterAttempt,
            ...fields
        });
    }
    async invoke(input, options) {
        return this.bound.invoke(input, await this._mergeConfig(options, this.kwargs));
    }
    async batch(inputs, options, batchOptions) {
        const mergedOptions = Array.isArray(options) ? await Promise.all(options.map(async (individualOption)=>this._mergeConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(individualOption), this.kwargs))) : await this._mergeConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options), this.kwargs);
        return this.bound.batch(inputs, mergedOptions, batchOptions);
    }
    /** @internal */ _concatOutputChunks(first, second) {
        return this.bound._concatOutputChunks(first, second);
    }
    async *_streamIterator(input, options) {
        yield* this.bound._streamIterator(input, await this._mergeConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options), this.kwargs));
    }
    async stream(input, options) {
        return this.bound.stream(input, await this._mergeConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options), this.kwargs));
    }
    async *transform(generator, options) {
        yield* this.bound.transform(generator, await this._mergeConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options), this.kwargs));
    }
    streamEvents(input, options, streamOptions) {
        const outerThis = this;
        const generator = async function*() {
            yield* outerThis.bound.streamEvents(input, {
                ...await outerThis._mergeConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options), outerThis.kwargs),
                version: options.version
            }, streamOptions);
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromAsyncGenerator(generator());
    }
    static isRunnableBinding(thing) {
        return thing.bound && Runnable.isRunnable(thing.bound);
    }
    /**
	* Bind lifecycle listeners to a Runnable, returning a new Runnable.
	* The Run object contains information about the run, including its id,
	* type, input, output, error, startTime, endTime, and any tags or metadata
	* added to the run.
	*
	* @param {Object} params - The object containing the callback functions.
	* @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
	* @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
	* @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
	*/ withListeners({ onStart, onEnd, onError }) {
        return new RunnableBinding({
            bound: this.bound,
            kwargs: this.kwargs,
            config: this.config,
            configFactories: [
                (config)=>({
                        callbacks: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$root_listener$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RootListenersTracer"]({
                                config,
                                onStart,
                                onEnd,
                                onError
                            })
                        ]
                    })
            ]
        });
    }
};
/**
* A runnable that delegates calls to another runnable
* with each element of the input sequence.
* @example
* ```typescript
* import { RunnableEach, RunnableLambda } from "@langchain/core/runnables";
*
* const toUpperCase = (input: string): string => input.toUpperCase();
* const addGreeting = (input: string): string => `Hello, ${input}!`;
*
* const upperCaseLambda = RunnableLambda.from(toUpperCase);
* const greetingLambda = RunnableLambda.from(addGreeting);
*
* const chain = new RunnableEach({
*   bound: upperCaseLambda.pipe(greetingLambda),
* });
*
* const result = await chain.invoke(["alice", "bob", "carol"])
*
* // ["Hello, ALICE!", "Hello, BOB!", "Hello, CAROL!"]
* ```
*/ var RunnableEach = class RunnableEach extends Runnable {
    static lc_name() {
        return "RunnableEach";
    }
    lc_serializable = true;
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    bound;
    constructor(fields){
        super(fields);
        this.bound = fields.bound;
    }
    /**
	* Invokes the runnable with the specified input and configuration.
	* @param input The input to invoke the runnable with.
	* @param config The configuration to invoke the runnable with.
	* @returns A promise that resolves to the output of the runnable.
	*/ async invoke(inputs, config) {
        return this._callWithConfig(this._invoke.bind(this), inputs, config);
    }
    /**
	* A helper method that is used to invoke the runnable with the specified input and configuration.
	* @param input The input to invoke the runnable with.
	* @param config The configuration to invoke the runnable with.
	* @returns A promise that resolves to the output of the runnable.
	*/ async _invoke(inputs, config, runManager) {
        return this.bound.batch(inputs, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
            callbacks: runManager?.getChild()
        }));
    }
    /**
	* Bind lifecycle listeners to a Runnable, returning a new Runnable.
	* The Run object contains information about the run, including its id,
	* type, input, output, error, startTime, endTime, and any tags or metadata
	* added to the run.
	*
	* @param {Object} params - The object containing the callback functions.
	* @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
	* @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
	* @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
	*/ withListeners({ onStart, onEnd, onError }) {
        return new RunnableEach({
            bound: this.bound.withListeners({
                onStart,
                onEnd,
                onError
            })
        });
    }
};
/**
* Base class for runnables that can be retried a
* specified number of times.
* @example
* ```typescript
* import {
*   RunnableLambda,
*   RunnableRetry,
* } from "@langchain/core/runnables";
*
* // Simulate an API call that fails
* const simulateApiCall = (input: string): string => {
*   console.log(`Attempting API call with input: ${input}`);
*   throw new Error("API call failed due to network issue");
* };
*
* const apiCallLambda = RunnableLambda.from(simulateApiCall);
*
* // Apply retry logic using the .withRetry() method
* const apiCallWithRetry = apiCallLambda.withRetry({ stopAfterAttempt: 3 });
*
* // Alternatively, create a RunnableRetry instance manually
* const manualRetry = new RunnableRetry({
*   bound: apiCallLambda,
*   maxAttemptNumber: 3,
*   config: {},
* });
*
* // Example invocation using the .withRetry() method
* const res = await apiCallWithRetry
*   .invoke("Request 1")
*   .catch((error) => {
*     console.error("Failed after multiple retries:", error.message);
*   });
*
* // Example invocation using the manual retry instance
* const res2 = await manualRetry
*   .invoke("Request 2")
*   .catch((error) => {
*     console.error("Failed after multiple retries:", error.message);
*   });
* ```
*/ var RunnableRetry = class extends RunnableBinding {
    static lc_name() {
        return "RunnableRetry";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    maxAttemptNumber = 3;
    onFailedAttempt = ()=>{};
    constructor(fields){
        super(fields);
        this.maxAttemptNumber = fields.maxAttemptNumber ?? this.maxAttemptNumber;
        this.onFailedAttempt = fields.onFailedAttempt ?? this.onFailedAttempt;
    }
    _patchConfigForRetry(attempt, config, runManager) {
        const tag = attempt > 1 ? `retry:attempt:${attempt}` : void 0;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
            callbacks: runManager?.getChild(tag)
        });
    }
    async _invoke(input, config, runManager) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$p$2d$retry$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"])((attemptNumber)=>super.invoke(input, this._patchConfigForRetry(attemptNumber, config, runManager)), {
            onFailedAttempt: ({ error })=>this.onFailedAttempt(error, input),
            retries: Math.max(this.maxAttemptNumber - 1, 0),
            randomize: true
        });
    }
    /**
	* Method that invokes the runnable with the specified input, run manager,
	* and config. It handles the retry logic by catching any errors and
	* recursively invoking itself with the updated config for the next retry
	* attempt.
	* @param input The input for the runnable.
	* @param runManager The run manager for the runnable.
	* @param config The config for the runnable.
	* @returns A promise that resolves to the output of the runnable.
	*/ async invoke(input, config) {
        return this._callWithConfig(this._invoke.bind(this), input, config);
    }
    async _batch(inputs, configs, runManagers, batchOptions) {
        const resultsMap = {};
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$p$2d$retry$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"])(async (attemptNumber)=>{
                const remainingIndexes = inputs.map((_, i)=>i).filter((i)=>resultsMap[i.toString()] === void 0 || resultsMap[i.toString()] instanceof Error);
                const remainingInputs = remainingIndexes.map((i)=>inputs[i]);
                const patchedConfigs = remainingIndexes.map((i)=>this._patchConfigForRetry(attemptNumber, configs?.[i], runManagers?.[i]));
                const results = await super.batch(remainingInputs, patchedConfigs, {
                    ...batchOptions,
                    returnExceptions: true
                });
                let firstException;
                for(let i = 0; i < results.length; i += 1){
                    const result = results[i];
                    const resultMapIndex = remainingIndexes[i];
                    if (result instanceof Error) {
                        if (firstException === void 0) {
                            firstException = result;
                            firstException.input = remainingInputs[i];
                        }
                    }
                    resultsMap[resultMapIndex.toString()] = result;
                }
                if (firstException) throw firstException;
                return results;
            }, {
                onFailedAttempt: ({ error })=>this.onFailedAttempt(error, error.input),
                retries: Math.max(this.maxAttemptNumber - 1, 0),
                randomize: true
            });
        } catch (e) {
            if (batchOptions?.returnExceptions !== true) throw e;
        }
        return Object.keys(resultsMap).sort((a, b)=>parseInt(a, 10) - parseInt(b, 10)).map((key)=>resultsMap[parseInt(key, 10)]);
    }
    async batch(inputs, options, batchOptions) {
        return this._batchWithConfig(this._batch.bind(this), inputs, options, batchOptions);
    }
};
/**
* A sequence of runnables, where the output of each is the input of the next.
* @example
* ```typescript
* const promptTemplate = PromptTemplate.fromTemplate(
*   "Tell me a joke about {topic}",
* );
* const chain = RunnableSequence.from([promptTemplate, new ChatOpenAI({ model: "gpt-4o-mini" })]);
* const result = await chain.invoke({ topic: "bears" });
* ```
*/ var RunnableSequence = class RunnableSequence extends Runnable {
    static lc_name() {
        return "RunnableSequence";
    }
    first;
    middle = [];
    last;
    omitSequenceTags = false;
    lc_serializable = true;
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    constructor(fields){
        super(fields);
        this.first = fields.first;
        this.middle = fields.middle ?? this.middle;
        this.last = fields.last;
        this.name = fields.name;
        this.omitSequenceTags = fields.omitSequenceTags ?? this.omitSequenceTags;
    }
    get steps() {
        return [
            this.first,
            ...this.middle,
            this.last
        ];
    }
    async invoke(input, options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const runManager = await (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config))?.handleChainStart(this.toJSON(), _coerceToDict(input, "input"), config.runId, void 0, void 0, void 0, config?.runName);
        delete config.runId;
        let nextStepInput = input;
        let finalOutput;
        try {
            const initialSteps = [
                this.first,
                ...this.middle
            ];
            for(let i = 0; i < initialSteps.length; i += 1){
                const promise = initialSteps[i].invoke(nextStepInput, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:${i + 1}`)
                }));
                nextStepInput = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["raceWithSignal"])(promise, config.signal);
            }
            if (config.signal?.aborted) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAbortSignalError"])(config.signal);
            finalOutput = await this.last.invoke(nextStepInput, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                callbacks: runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:${this.steps.length}`)
            }));
        } catch (e) {
            await runManager?.handleChainError(e);
            throw e;
        }
        await runManager?.handleChainEnd(_coerceToDict(finalOutput, "output"));
        return finalOutput;
    }
    async batch(inputs, options, batchOptions) {
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(configList.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"]));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i)=>{
            const handleStartRes = await callbackManager?.handleChainStart(this.toJSON(), _coerceToDict(inputs[i], "input"), configList[i].runId, void 0, void 0, void 0, configList[i].runName);
            delete configList[i].runId;
            return handleStartRes;
        }));
        let nextStepInputs = inputs;
        try {
            for(let i = 0; i < this.steps.length; i += 1){
                const promise = this.steps[i].batch(nextStepInputs, runManagers.map((runManager, j)=>{
                    const childRunManager = runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:${i + 1}`);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(configList[j], {
                        callbacks: childRunManager
                    });
                }), batchOptions);
                nextStepInputs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["raceWithSignal"])(promise, configList[0]?.signal);
            }
        } catch (e) {
            await Promise.all(runManagers.map((runManager)=>runManager?.handleChainError(e)));
            throw e;
        }
        await Promise.all(runManagers.map((runManager)=>runManager?.handleChainEnd(_coerceToDict(nextStepInputs, "output"))));
        return nextStepInputs;
    }
    /** @internal */ _concatOutputChunks(first, second) {
        return this.last._concatOutputChunks(first, second);
    }
    async *_streamIterator(input, options) {
        const callbackManager_ = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(options);
        const { runId, ...otherOptions } = options ?? {};
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict(input, "input"), runId, void 0, void 0, void 0, otherOptions?.runName);
        const steps = [
            this.first,
            ...this.middle,
            this.last
        ];
        let concatSupported = true;
        let finalOutput;
        async function* inputGenerator() {
            yield input;
        }
        try {
            let finalGenerator = steps[0].transform(inputGenerator(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(otherOptions, {
                callbacks: runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:1`)
            }));
            for(let i = 1; i < steps.length; i += 1)finalGenerator = await steps[i].transform(finalGenerator, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(otherOptions, {
                callbacks: runManager?.getChild(this.omitSequenceTags ? void 0 : `seq:step:${i + 1}`)
            }));
            for await (const chunk of finalGenerator){
                options?.signal?.throwIfAborted();
                yield chunk;
                if (concatSupported) {
                    if (finalOutput === void 0) finalOutput = chunk;
                    else try {
                        finalOutput = this._concatOutputChunks(finalOutput, chunk);
                    } catch  {
                        finalOutput = void 0;
                        concatSupported = false;
                    }
                }
            }
        } catch (e) {
            await runManager?.handleChainError(e);
            throw e;
        }
        await runManager?.handleChainEnd(_coerceToDict(finalOutput, "output"));
    }
    getGraph(config) {
        const graph = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$graph$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Graph"]();
        let currentLastNode = null;
        this.steps.forEach((step, index)=>{
            const stepGraph = step.getGraph(config);
            if (index !== 0) stepGraph.trimFirstNode();
            if (index !== this.steps.length - 1) stepGraph.trimLastNode();
            graph.extend(stepGraph);
            const stepFirstNode = stepGraph.firstNode();
            if (!stepFirstNode) throw new Error(`Runnable ${step} has no first node`);
            if (currentLastNode) graph.addEdge(currentLastNode, stepFirstNode);
            currentLastNode = stepGraph.lastNode();
        });
        return graph;
    }
    pipe(coerceable) {
        if (RunnableSequence.isRunnableSequence(coerceable)) return new RunnableSequence({
            first: this.first,
            middle: this.middle.concat([
                this.last,
                coerceable.first,
                ...coerceable.middle
            ]),
            last: coerceable.last,
            name: this.name ?? coerceable.name
        });
        else return new RunnableSequence({
            first: this.first,
            middle: [
                ...this.middle,
                this.last
            ],
            last: _coerceToRunnable(coerceable),
            name: this.name
        });
    }
    static isRunnableSequence(thing) {
        return Array.isArray(thing.middle) && Runnable.isRunnable(thing);
    }
    static from([first, ...runnables], nameOrFields) {
        let extra = {};
        if (typeof nameOrFields === "string") extra.name = nameOrFields;
        else if (nameOrFields !== void 0) extra = nameOrFields;
        return new RunnableSequence({
            ...extra,
            first: _coerceToRunnable(first),
            middle: runnables.slice(0, -1).map(_coerceToRunnable),
            last: _coerceToRunnable(runnables[runnables.length - 1])
        });
    }
};
/**
* A runnable that runs a mapping of runnables in parallel,
* and returns a mapping of their outputs.
* @example
* ```typescript
* const mapChain = RunnableMap.from({
*   joke: PromptTemplate.fromTemplate("Tell me a joke about {topic}").pipe(
*     new ChatAnthropic({}),
*   ),
*   poem: PromptTemplate.fromTemplate("write a 2-line poem about {topic}").pipe(
*     new ChatAnthropic({}),
*   ),
* });
* const result = await mapChain.invoke({ topic: "bear" });
* ```
*/ var RunnableMap = class RunnableMap extends Runnable {
    static lc_name() {
        return "RunnableMap";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    lc_serializable = true;
    steps;
    getStepsKeys() {
        return Object.keys(this.steps);
    }
    constructor(fields){
        super(fields);
        this.steps = {};
        for (const [key, value] of Object.entries(fields.steps))this.steps[key] = _coerceToRunnable(value);
    }
    static from(steps) {
        return new RunnableMap({
            steps
        });
    }
    async invoke(input, options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const runManager = await (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config))?.handleChainStart(this.toJSON(), {
            input
        }, config.runId, void 0, void 0, void 0, config?.runName);
        delete config.runId;
        const output = {};
        try {
            const promises = Object.entries(this.steps).map(async ([key, runnable])=>{
                output[key] = await runnable.invoke(input, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild(`map:key:${key}`)
                }));
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["raceWithSignal"])(Promise.all(promises), config.signal);
        } catch (e) {
            await runManager?.handleChainError(e);
            throw e;
        }
        await runManager?.handleChainEnd(output);
        return output;
    }
    async *_transform(generator, runManager, options) {
        const steps = {
            ...this.steps
        };
        const inputCopies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["atee"])(generator, Object.keys(steps).length);
        const tasks = new Map(Object.entries(steps).map(([key, runnable], i)=>{
            const gen = runnable.transform(inputCopies[i], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(options, {
                callbacks: runManager?.getChild(`map:key:${key}`)
            }));
            return [
                key,
                gen.next().then((result)=>({
                        key,
                        gen,
                        result
                    }))
            ];
        }));
        while(tasks.size){
            const promise = Promise.race(tasks.values());
            const { key, result, gen } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["raceWithSignal"])(promise, options?.signal);
            tasks.delete(key);
            if (!result.done) {
                yield {
                    [key]: result.value
                };
                tasks.set(key, gen.next().then((result)=>({
                        key,
                        gen,
                        result
                    })));
            }
        }
    }
    transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
    }
    async stream(input, options) {
        async function* generator() {
            yield input;
        }
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const wrappedGenerator = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncGeneratorWithSetup"]({
            generator: this.transform(generator(), config),
            config
        });
        await wrappedGenerator.setup;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromAsyncGenerator(wrappedGenerator);
    }
};
/**
* A runnable that wraps a traced LangSmith function.
*/ var RunnableTraceable = class RunnableTraceable extends Runnable {
    lc_serializable = false;
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    func;
    constructor(fields){
        super(fields);
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$singletons$2f$traceable$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["isTraceableFunction"])(fields.func)) throw new Error("RunnableTraceable requires a function that is wrapped in traceable higher-order function");
        this.func = fields.func;
    }
    async invoke(input, options) {
        const [config] = this._getOptionsList(options ?? {}, 1);
        const callbacks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config);
        const promise = this.func((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
            callbacks
        }), input);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["raceWithSignal"])(promise, config?.signal);
    }
    async *_streamIterator(input, options) {
        const [config] = this._getOptionsList(options ?? {}, 1);
        const result = await this.invoke(input, options);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAsyncIterable"])(result)) {
            for await (const item of result){
                config?.signal?.throwIfAborted();
                yield item;
            }
            return;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isIterator"])(result)) {
            while(true){
                config?.signal?.throwIfAborted();
                const state = result.next();
                if (state.done) break;
                yield state.value;
            }
            return;
        }
        yield result;
    }
    static from(func) {
        return new RunnableTraceable({
            func
        });
    }
};
function assertNonTraceableFunction(func) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$singletons$2f$traceable$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["isTraceableFunction"])(func)) throw new Error("RunnableLambda requires a function that is not wrapped in traceable higher-order function. This shouldn't happen.");
}
/**
* A runnable that wraps an arbitrary function that takes a single argument.
* @example
* ```typescript
* import { RunnableLambda } from "@langchain/core/runnables";
*
* const add = (input: { x: number; y: number }) => input.x + input.y;
*
* const multiply = (input: { value: number; multiplier: number }) =>
*   input.value * input.multiplier;
*
* // Create runnables for the functions
* const addLambda = RunnableLambda.from(add);
* const multiplyLambda = RunnableLambda.from(multiply);
*
* // Chain the lambdas for a mathematical operation
* const chainedLambda = addLambda.pipe((result) =>
*   multiplyLambda.invoke({ value: result, multiplier: 2 })
* );
*
* // Example invocation of the chainedLambda
* const result = await chainedLambda.invoke({ x: 2, y: 3 });
*
* // Will log "10" (since (2 + 3) * 2 = 10)
* ```
*/ var RunnableLambda = class RunnableLambda extends Runnable {
    static lc_name() {
        return "RunnableLambda";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    func;
    constructor(fields){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$singletons$2f$traceable$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["isTraceableFunction"])(fields.func)) return RunnableTraceable.from(fields.func);
        super(fields);
        assertNonTraceableFunction(fields.func);
        this.func = fields.func;
    }
    static from(func) {
        return new RunnableLambda({
            func
        });
    }
    async _invoke(input, config, runManager) {
        return new Promise((resolve, reject)=>{
            const childConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                callbacks: runManager?.getChild(),
                recursionLimit: (config?.recursionLimit ?? 25) - 1
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(childConfig), async ()=>{
                try {
                    let output = await this.func(input, {
                        ...childConfig
                    });
                    if (output && Runnable.isRunnable(output)) {
                        if (config?.recursionLimit === 0) throw new Error("Recursion limit reached.");
                        output = await output.invoke(input, {
                            ...childConfig,
                            recursionLimit: (childConfig.recursionLimit ?? 25) - 1
                        });
                    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAsyncIterable"])(output)) {
                        let finalOutput;
                        for await (const chunk of (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["consumeAsyncIterableInContext"])(childConfig, output)){
                            config?.signal?.throwIfAborted();
                            if (finalOutput === void 0) finalOutput = chunk;
                            else try {
                                finalOutput = this._concatOutputChunks(finalOutput, chunk);
                            } catch  {
                                finalOutput = chunk;
                            }
                        }
                        output = finalOutput;
                    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isIterableIterator"])(output)) {
                        let finalOutput;
                        for (const chunk of (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["consumeIteratorInContext"])(childConfig, output)){
                            config?.signal?.throwIfAborted();
                            if (finalOutput === void 0) finalOutput = chunk;
                            else try {
                                finalOutput = this._concatOutputChunks(finalOutput, chunk);
                            } catch  {
                                finalOutput = chunk;
                            }
                        }
                        output = finalOutput;
                    }
                    resolve(output);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
    async invoke(input, options) {
        return this._callWithConfig(this._invoke.bind(this), input, options);
    }
    async *_transform(generator, runManager, config) {
        let finalChunk;
        for await (const chunk of generator)if (finalChunk === void 0) finalChunk = chunk;
        else try {
            finalChunk = this._concatOutputChunks(finalChunk, chunk);
        } catch  {
            finalChunk = chunk;
        }
        const childConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
            callbacks: runManager?.getChild(),
            recursionLimit: (config?.recursionLimit ?? 25) - 1
        });
        const output = await new Promise((resolve, reject)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(childConfig), async ()=>{
                try {
                    resolve(await this.func(finalChunk, {
                        ...childConfig,
                        config: childConfig
                    }));
                } catch (e) {
                    reject(e);
                }
            });
        });
        if (output && Runnable.isRunnable(output)) {
            if (config?.recursionLimit === 0) throw new Error("Recursion limit reached.");
            const stream = await output.stream(finalChunk, childConfig);
            for await (const chunk of stream)yield chunk;
        } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAsyncIterable"])(output)) for await (const chunk of (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["consumeAsyncIterableInContext"])(childConfig, output)){
            config?.signal?.throwIfAborted();
            yield chunk;
        }
        else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isIterableIterator"])(output)) for (const chunk of (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["consumeIteratorInContext"])(childConfig, output)){
            config?.signal?.throwIfAborted();
            yield chunk;
        }
        else yield output;
    }
    transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
    }
    async stream(input, options) {
        async function* generator() {
            yield input;
        }
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const wrappedGenerator = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncGeneratorWithSetup"]({
            generator: this.transform(generator(), config),
            config
        });
        await wrappedGenerator.setup;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromAsyncGenerator(wrappedGenerator);
    }
};
/**
* A runnable that runs a mapping of runnables in parallel,
* and returns a mapping of their outputs.
* @example
* ```typescript
* import {
*   RunnableLambda,
*   RunnableParallel,
* } from "@langchain/core/runnables";
*
* const addYears = (age: number): number => age + 5;
* const yearsToFifty = (age: number): number => 50 - age;
* const yearsToHundred = (age: number): number => 100 - age;
*
* const addYearsLambda = RunnableLambda.from(addYears);
* const milestoneFiftyLambda = RunnableLambda.from(yearsToFifty);
* const milestoneHundredLambda = RunnableLambda.from(yearsToHundred);
*
* // Pipe will coerce objects into RunnableParallel by default, but we
* // explicitly instantiate one here to demonstrate
* const sequence = addYearsLambda.pipe(
*   RunnableParallel.from({
*     years_to_fifty: milestoneFiftyLambda,
*     years_to_hundred: milestoneHundredLambda,
*   })
* );
*
* // Invoke the sequence with a single age input
* const res = await sequence.invoke(25);
*
* // { years_to_fifty: 20, years_to_hundred: 70 }
* ```
*/ var RunnableParallel = class extends RunnableMap {
};
/**
* A Runnable that can fallback to other Runnables if it fails.
* External APIs (e.g., APIs for a language model) may at times experience
* degraded performance or even downtime.
*
* In these cases, it can be useful to have a fallback Runnable that can be
* used in place of the original Runnable (e.g., fallback to another LLM provider).
*
* Fallbacks can be defined at the level of a single Runnable, or at the level
* of a chain of Runnables. Fallbacks are tried in order until one succeeds or
* all fail.
*
* While you can instantiate a `RunnableWithFallbacks` directly, it is usually
* more convenient to use the `withFallbacks` method on an existing Runnable.
*
* When streaming, fallbacks will only be called on failures during the initial
* stream creation. Errors that occur after a stream starts will not fallback
* to the next Runnable.
*
* @example
* ```typescript
* import {
*   RunnableLambda,
*   RunnableWithFallbacks,
* } from "@langchain/core/runnables";
*
* const primaryOperation = (input: string): string => {
*   if (input !== "safe") {
*     throw new Error("Primary operation failed due to unsafe input");
*   }
*   return `Processed: ${input}`;
* };
*
* // Define a fallback operation that processes the input differently
* const fallbackOperation = (input: string): string =>
*   `Fallback processed: ${input}`;
*
* const primaryRunnable = RunnableLambda.from(primaryOperation);
* const fallbackRunnable = RunnableLambda.from(fallbackOperation);
*
* // Apply the fallback logic using the .withFallbacks() method
* const runnableWithFallback = primaryRunnable.withFallbacks([fallbackRunnable]);
*
* // Alternatively, create a RunnableWithFallbacks instance manually
* const manualFallbackChain = new RunnableWithFallbacks({
*   runnable: primaryRunnable,
*   fallbacks: [fallbackRunnable],
* });
*
* // Example invocation using .withFallbacks()
* const res = await runnableWithFallback
*   .invoke("unsafe input")
*   .catch((error) => {
*     console.error("Failed after all attempts:", error.message);
*   });
*
* // "Fallback processed: unsafe input"
*
* // Example invocation using manual instantiation
* const res = await manualFallbackChain
*   .invoke("safe")
*   .catch((error) => {
*     console.error("Failed after all attempts:", error.message);
*   });
*
* // "Processed: safe"
* ```
*/ var RunnableWithFallbacks = class extends Runnable {
    static lc_name() {
        return "RunnableWithFallbacks";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    lc_serializable = true;
    runnable;
    fallbacks;
    constructor(fields){
        super(fields);
        this.runnable = fields.runnable;
        this.fallbacks = fields.fallbacks;
    }
    *runnables() {
        yield this.runnable;
        for (const fallback of this.fallbacks)yield fallback;
    }
    async invoke(input, options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const callbackManager_ = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config);
        const { runId, ...otherConfigFields } = config;
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict(input, "input"), runId, void 0, void 0, void 0, otherConfigFields?.runName);
        const childConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(otherConfigFields, {
            callbacks: runManager?.getChild()
        });
        return await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig(childConfig, async ()=>{
            let firstError;
            for (const runnable of this.runnables()){
                config?.signal?.throwIfAborted();
                try {
                    const output = await runnable.invoke(input, childConfig);
                    await runManager?.handleChainEnd(_coerceToDict(output, "output"));
                    return output;
                } catch (e) {
                    if (firstError === void 0) firstError = e;
                }
            }
            if (firstError === void 0) throw new Error("No error stored at end of fallback.");
            await runManager?.handleChainError(firstError);
            throw firstError;
        });
    }
    async *_streamIterator(input, options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const callbackManager_ = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config);
        const { runId, ...otherConfigFields } = config;
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict(input, "input"), runId, void 0, void 0, void 0, otherConfigFields?.runName);
        let firstError;
        let stream;
        for (const runnable of this.runnables()){
            config?.signal?.throwIfAborted();
            const childConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(otherConfigFields, {
                callbacks: runManager?.getChild()
            });
            try {
                const originalStream = await runnable.stream(input, childConfig);
                stream = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["consumeAsyncIterableInContext"])(childConfig, originalStream);
                break;
            } catch (e) {
                if (firstError === void 0) firstError = e;
            }
        }
        if (stream === void 0) {
            const error = firstError ?? /* @__PURE__ */ new Error("No error stored at end of fallback.");
            await runManager?.handleChainError(error);
            throw error;
        }
        let output;
        try {
            for await (const chunk of stream){
                yield chunk;
                try {
                    output = output === void 0 ? output : this._concatOutputChunks(output, chunk);
                } catch  {
                    output = void 0;
                }
            }
        } catch (e) {
            await runManager?.handleChainError(e);
            throw e;
        }
        await runManager?.handleChainEnd(_coerceToDict(output, "output"));
    }
    async batch(inputs, options, batchOptions) {
        if (batchOptions?.returnExceptions) throw new Error("Not implemented.");
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(configList.map((config)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config)));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i)=>{
            const handleStartRes = await callbackManager?.handleChainStart(this.toJSON(), _coerceToDict(inputs[i], "input"), configList[i].runId, void 0, void 0, void 0, configList[i].runName);
            delete configList[i].runId;
            return handleStartRes;
        }));
        let firstError;
        for (const runnable of this.runnables()){
            configList[0].signal?.throwIfAborted();
            try {
                const outputs = await runnable.batch(inputs, runManagers.map((runManager, j)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(configList[j], {
                        callbacks: runManager?.getChild()
                    })), batchOptions);
                await Promise.all(runManagers.map((runManager, i)=>runManager?.handleChainEnd(_coerceToDict(outputs[i], "output"))));
                return outputs;
            } catch (e) {
                if (firstError === void 0) firstError = e;
            }
        }
        if (!firstError) throw new Error("No error stored at end of fallbacks.");
        await Promise.all(runManagers.map((runManager)=>runManager?.handleChainError(firstError)));
        throw firstError;
    }
};
function _coerceToRunnable(coerceable) {
    if (typeof coerceable === "function") return new RunnableLambda({
        func: coerceable
    });
    else if (Runnable.isRunnable(coerceable)) return coerceable;
    else if (!Array.isArray(coerceable) && typeof coerceable === "object") {
        const runnables = {};
        for (const [key, value] of Object.entries(coerceable))runnables[key] = _coerceToRunnable(value);
        return new RunnableMap({
            steps: runnables
        });
    } else throw new Error(`Expected a Runnable, function or object.\nInstead got an unsupported type.`);
}
/**
* A runnable that assigns key-value pairs to inputs of type `Record<string, unknown>`.
* @example
* ```typescript
* import {
*   RunnableAssign,
*   RunnableLambda,
*   RunnableParallel,
* } from "@langchain/core/runnables";
*
* const calculateAge = (x: { birthYear: number }): { age: number } => {
*   const currentYear = new Date().getFullYear();
*   return { age: currentYear - x.birthYear };
* };
*
* const createGreeting = (x: { name: string }): { greeting: string } => {
*   return { greeting: `Hello, ${x.name}!` };
* };
*
* const mapper = RunnableParallel.from({
*   age_step: RunnableLambda.from(calculateAge),
*   greeting_step: RunnableLambda.from(createGreeting),
* });
*
* const runnableAssign = new RunnableAssign({ mapper });
*
* const res = await runnableAssign.invoke({ name: "Alice", birthYear: 1990 });
*
* // { name: "Alice", birthYear: 1990, age_step: { age: 34 }, greeting_step: { greeting: "Hello, Alice!" } }
* ```
*/ var RunnableAssign = class extends Runnable {
    static lc_name() {
        return "RunnableAssign";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    lc_serializable = true;
    mapper;
    constructor(fields){
        if (fields instanceof RunnableMap) fields = {
            mapper: fields
        };
        super(fields);
        this.mapper = fields.mapper;
    }
    async invoke(input, options) {
        const mapperResult = await this.mapper.invoke(input, options);
        return {
            ...input,
            ...mapperResult
        };
    }
    async *_transform(generator, runManager, options) {
        const mapperKeys = this.mapper.getStepsKeys();
        const [forPassthrough, forMapper] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["atee"])(generator);
        const mapperOutput = this.mapper.transform(forMapper, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(options, {
            callbacks: runManager?.getChild()
        }));
        const firstMapperChunkPromise = mapperOutput.next();
        for await (const chunk of forPassthrough){
            if (typeof chunk !== "object" || Array.isArray(chunk)) throw new Error(`RunnableAssign can only be used with objects as input, got ${typeof chunk}`);
            const filtered = Object.fromEntries(Object.entries(chunk).filter(([key])=>!mapperKeys.includes(key)));
            if (Object.keys(filtered).length > 0) yield filtered;
        }
        yield (await firstMapperChunkPromise).value;
        for await (const chunk of mapperOutput)yield chunk;
    }
    transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
    }
    async stream(input, options) {
        async function* generator() {
            yield input;
        }
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const wrappedGenerator = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncGeneratorWithSetup"]({
            generator: this.transform(generator(), config),
            config
        });
        await wrappedGenerator.setup;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromAsyncGenerator(wrappedGenerator);
    }
};
/**
* A runnable that assigns key-value pairs to inputs of type `Record<string, unknown>`.
* Useful for streaming, can be automatically created and chained by calling `runnable.pick();`.
* @example
* ```typescript
* import { RunnablePick } from "@langchain/core/runnables";
*
* const inputData = {
*   name: "John",
*   age: 30,
*   city: "New York",
*   country: "USA",
*   email: "john.doe@example.com",
*   phone: "+1234567890",
* };
*
* const basicInfoRunnable = new RunnablePick(["name", "city"]);
*
* // Example invocation
* const res = await basicInfoRunnable.invoke(inputData);
*
* // { name: 'John', city: 'New York' }
* ```
*/ var RunnablePick = class extends Runnable {
    static lc_name() {
        return "RunnablePick";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    lc_serializable = true;
    keys;
    constructor(fields){
        if (typeof fields === "string" || Array.isArray(fields)) fields = {
            keys: fields
        };
        super(fields);
        this.keys = fields.keys;
    }
    async _pick(input) {
        if (typeof this.keys === "string") return input[this.keys];
        else {
            const picked = this.keys.map((key)=>[
                    key,
                    input[key]
                ]).filter((v)=>v[1] !== void 0);
            return picked.length === 0 ? void 0 : Object.fromEntries(picked);
        }
    }
    async invoke(input, options) {
        return this._callWithConfig(this._pick.bind(this), input, options);
    }
    async *_transform(generator) {
        for await (const chunk of generator){
            const picked = await this._pick(chunk);
            if (picked !== void 0) yield picked;
        }
    }
    transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
    }
    async stream(input, options) {
        async function* generator() {
            yield input;
        }
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        const wrappedGenerator = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AsyncGeneratorWithSetup"]({
            generator: this.transform(generator(), config),
            config
        });
        await wrappedGenerator.setup;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromAsyncGenerator(wrappedGenerator);
    }
};
var RunnableToolLike = class extends RunnableBinding {
    name;
    description;
    schema;
    constructor(fields){
        const sequence = RunnableSequence.from([
            RunnableLambda.from(async (input)=>{
                let toolInput;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isToolCall"])(input)) try {
                    toolInput = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["interopParseAsync"])(this.schema, input.args);
                } catch  {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolInputParsingException"](`Received tool input did not match expected schema`, JSON.stringify(input.args));
                }
                else toolInput = input;
                return toolInput;
            }).withConfig({
                runName: `${fields.name}:parse_input`
            }),
            fields.bound
        ]).withConfig({
            runName: fields.name
        });
        super({
            bound: sequence,
            config: fields.config ?? {}
        });
        this.name = fields.name;
        this.description = fields.description;
        this.schema = fields.schema;
    }
    static lc_name() {
        return "RunnableToolLike";
    }
};
/**
* Given a runnable and a Zod schema, convert the runnable to a tool.
*
* @template RunInput The input type for the runnable.
* @template RunOutput The output type for the runnable.
*
* @param {Runnable<RunInput, RunOutput>} runnable The runnable to convert to a tool.
* @param fields
* @param {string | undefined} [fields.name] The name of the tool. If not provided, it will default to the name of the runnable.
* @param {string | undefined} [fields.description] The description of the tool. Falls back to the description on the Zod schema if not provided, or undefined if neither are provided.
* @param {InteropZodType<RunInput>} [fields.schema] The Zod schema for the input of the tool. Infers the Zod type from the input type of the runnable.
* @returns {RunnableToolLike<InteropZodType<RunInput>, RunOutput>} An instance of `RunnableToolLike` which is a runnable that can be used as a tool.
*/ function convertRunnableToTool(runnable, fields) {
    const name = fields.name ?? runnable.getName();
    const description = fields.description ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSchemaDescription"])(fields.schema);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSimpleStringZodSchema"])(fields.schema)) return new RunnableToolLike({
        name,
        description,
        schema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            input: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
        }).transform((input)=>input.input),
        bound: runnable
    });
    return new RunnableToolLike({
        name,
        description,
        schema: fields.schema,
        bound: runnable
    });
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/passthrough.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RunnablePassthrough",
    ()=>RunnablePassthrough
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [instrumentation] (ecmascript)");
;
;
;
//#region src/runnables/passthrough.ts
/**
* A runnable to passthrough inputs unchanged or with additional keys.
*
* This runnable behaves almost like the identity function, except that it
* can be configured to add additional keys to the output, if the input is
* an object.
*
* The example below demonstrates how to use `RunnablePassthrough to
* passthrough the input from the `.invoke()`
*
* @example
* ```typescript
* const chain = RunnableSequence.from([
*   {
*     question: new RunnablePassthrough(),
*     context: async () => loadContextFromStore(),
*   },
*   prompt,
*   llm,
*   outputParser,
* ]);
* const response = await chain.invoke(
*   "I can pass a single string instead of an object since I'm using `RunnablePassthrough`."
* );
* ```
*/ var RunnablePassthrough = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Runnable"] {
    static lc_name() {
        return "RunnablePassthrough";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    lc_serializable = true;
    func;
    constructor(fields){
        super(fields);
        if (fields) this.func = fields.func;
    }
    async invoke(input, options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        if (this.func) await this.func(input, config);
        return this._callWithConfig((input)=>Promise.resolve(input), input, config);
    }
    async *transform(generator, options) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options);
        let finalOutput;
        let finalOutputSupported = true;
        for await (const chunk of this._transformStreamWithConfig(generator, (input)=>input, config)){
            yield chunk;
            if (finalOutputSupported) {
                if (finalOutput === void 0) finalOutput = chunk;
                else try {
                    finalOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["concat"])(finalOutput, chunk);
                } catch  {
                    finalOutput = void 0;
                    finalOutputSupported = false;
                }
            }
        }
        if (this.func && finalOutput !== void 0) await this.func(finalOutput, config);
    }
    /**
	* A runnable that assigns key-value pairs to the input.
	*
	* The example below shows how you could use it with an inline function.
	*
	* @example
	* ```typescript
	* const prompt =
	*   PromptTemplate.fromTemplate(`Write a SQL query to answer the question using the following schema: {schema}
	* Question: {question}
	* SQL Query:`);
	*
	* // The `RunnablePassthrough.assign()` is used here to passthrough the input from the `.invoke()`
	* // call (in this example it's the question), along with any inputs passed to the `.assign()` method.
	* // In this case, we're passing the schema.
	* const sqlQueryGeneratorChain = RunnableSequence.from([
	*   RunnablePassthrough.assign({
	*     schema: async () => db.getTableInfo(),
	*   }),
	*   prompt,
	*   new ChatOpenAI({ model: "gpt-4o-mini" }).withConfig({ stop: ["\nSQLResult:"] }),
	*   new StringOutputParser(),
	* ]);
	* const result = await sqlQueryGeneratorChain.invoke({
	*   question: "How many employees are there?",
	* });
	* ```
	*/ static assign(mapping) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableAssign"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableMap"]({
            steps: mapping
        }));
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/router.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RouterRunnable",
    ()=>RouterRunnable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [instrumentation] (ecmascript)");
;
;
//#region src/runnables/router.ts
/**
* A runnable that routes to a set of runnables based on Input['key'].
* Returns the output of the selected runnable.
* @example
* ```typescript
* import { RouterRunnable, RunnableLambda } from "@langchain/core/runnables";
*
* const router = new RouterRunnable({
*   runnables: {
*     toUpperCase: RunnableLambda.from((text: string) => text.toUpperCase()),
*     reverseText: RunnableLambda.from((text: string) =>
*       text.split("").reverse().join("")
*     ),
*   },
* });
*
* // Invoke the 'reverseText' runnable
* const result1 = router.invoke({ key: "reverseText", input: "Hello World" });
*
* // "dlroW olleH"
*
* // Invoke the 'toUpperCase' runnable
* const result2 = router.invoke({ key: "toUpperCase", input: "Hello World" });
*
* // "HELLO WORLD"
* ```
*/ var RouterRunnable = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Runnable"] {
    static lc_name() {
        return "RouterRunnable";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    lc_serializable = true;
    runnables;
    constructor(fields){
        super(fields);
        this.runnables = fields.runnables;
    }
    async invoke(input, options) {
        const { key, input: actualInput } = input;
        const runnable = this.runnables[key];
        if (runnable === void 0) throw new Error(`No runnable associated with key "${key}".`);
        return runnable.invoke(actualInput, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"])(options));
    }
    async batch(inputs, options, batchOptions) {
        const keys = inputs.map((input)=>input.key);
        const actualInputs = inputs.map((input)=>input.input);
        if (keys.find((key)=>this.runnables[key] === void 0) !== void 0) throw new Error(`One or more keys do not have a corresponding runnable.`);
        const runnables = keys.map((key)=>this.runnables[key]);
        const optionsList = this._getOptionsList(options ?? {}, inputs.length);
        const maxConcurrency = optionsList[0]?.maxConcurrency ?? batchOptions?.maxConcurrency;
        const batchSize = maxConcurrency && maxConcurrency > 0 ? maxConcurrency : inputs.length;
        const batchResults = [];
        for(let i = 0; i < actualInputs.length; i += batchSize){
            const batchPromises = actualInputs.slice(i, i + batchSize).map((actualInput, i)=>runnables[i].invoke(actualInput, optionsList[i]));
            const batchResult = await Promise.all(batchPromises);
            batchResults.push(batchResult);
        }
        return batchResults.flat();
    }
    async stream(input, options) {
        const { key, input: actualInput } = input;
        const runnable = this.runnables[key];
        if (runnable === void 0) throw new Error(`No runnable associated with key "${key}".`);
        return runnable.stream(actualInput, options);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/branch.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RunnableBranch",
    ()=>RunnableBranch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [instrumentation] (ecmascript)");
;
;
;
//#region src/runnables/branch.ts
/**
* Class that represents a runnable branch. The RunnableBranch is
* initialized with an array of branches and a default branch. When invoked,
* it evaluates the condition of each branch in order and executes the
* corresponding branch if the condition is true. If none of the conditions
* are true, it executes the default branch.
* @example
* ```typescript
* const branch = RunnableBranch.from([
*   [
*     (x: { topic: string; question: string }) =>
*       x.topic.toLowerCase().includes("anthropic"),
*     anthropicChain,
*   ],
*   [
*     (x: { topic: string; question: string }) =>
*       x.topic.toLowerCase().includes("langchain"),
*     langChainChain,
*   ],
*   generalChain,
* ]);
*
* const fullChain = RunnableSequence.from([
*   {
*     topic: classificationChain,
*     question: (input: { question: string }) => input.question,
*   },
*   branch,
* ]);
*
* const result = await fullChain.invoke({
*   question: "how do I use LangChain?",
* });
* ```
*/ var RunnableBranch = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Runnable"] {
    static lc_name() {
        return "RunnableBranch";
    }
    lc_namespace = [
        "langchain_core",
        "runnables"
    ];
    lc_serializable = true;
    default;
    branches;
    constructor(fields){
        super(fields);
        this.branches = fields.branches;
        this.default = fields.default;
    }
    /**
	* Convenience method for instantiating a RunnableBranch from
	* RunnableLikes (objects, functions, or Runnables).
	*
	* Each item in the input except for the last one should be a
	* tuple with two items. The first is a "condition" RunnableLike that
	* returns "true" if the second RunnableLike in the tuple should run.
	*
	* The final item in the input should be a RunnableLike that acts as a
	* default branch if no other branches match.
	*
	* @example
	* ```ts
	* import { RunnableBranch } from "@langchain/core/runnables";
	*
	* const branch = RunnableBranch.from([
	*   [(x: number) => x > 0, (x: number) => x + 1],
	*   [(x: number) => x < 0, (x: number) => x - 1],
	*   (x: number) => x
	* ]);
	* ```
	* @param branches An array where the every item except the last is a tuple of [condition, runnable]
	*   pairs. The last item is a default runnable which is invoked if no other condition matches.
	* @returns A new RunnableBranch.
	*/ static from(branches) {
        if (branches.length < 1) throw new Error("RunnableBranch requires at least one branch");
        const coercedBranches = branches.slice(0, -1).map(([condition, runnable])=>[
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_coerceToRunnable"])(condition),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_coerceToRunnable"])(runnable)
            ]);
        const defaultBranch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_coerceToRunnable"])(branches[branches.length - 1]);
        return new this({
            branches: coercedBranches,
            default: defaultBranch
        });
    }
    async _invoke(input, config, runManager) {
        let result;
        for(let i = 0; i < this.branches.length; i += 1){
            const [condition, branchRunnable] = this.branches[i];
            if (await condition.invoke(input, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                callbacks: runManager?.getChild(`condition:${i + 1}`)
            }))) {
                result = await branchRunnable.invoke(input, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild(`branch:${i + 1}`)
                }));
                break;
            }
        }
        if (!result) result = await this.default.invoke(input, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
            callbacks: runManager?.getChild("branch:default")
        }));
        return result;
    }
    async invoke(input, config = {}) {
        return this._callWithConfig(this._invoke, input, config);
    }
    async *_streamIterator(input, config) {
        const runManager = await (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"])(config))?.handleChainStart(this.toJSON(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_coerceToDict"])(input, "input"), config?.runId, void 0, void 0, void 0, config?.runName);
        let finalOutput;
        let finalOutputSupported = true;
        let stream;
        try {
            for(let i = 0; i < this.branches.length; i += 1){
                const [condition, branchRunnable] = this.branches[i];
                if (await condition.invoke(input, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild(`condition:${i + 1}`)
                }))) {
                    stream = await branchRunnable.stream(input, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                        callbacks: runManager?.getChild(`branch:${i + 1}`)
                    }));
                    for await (const chunk of stream){
                        yield chunk;
                        if (finalOutputSupported) {
                            if (finalOutput === void 0) finalOutput = chunk;
                            else try {
                                finalOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["concat"])(finalOutput, chunk);
                            } catch  {
                                finalOutput = void 0;
                                finalOutputSupported = false;
                            }
                        }
                    }
                    break;
                }
            }
            if (stream === void 0) {
                stream = await this.default.stream(input, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild("branch:default")
                }));
                for await (const chunk of stream){
                    yield chunk;
                    if (finalOutputSupported) {
                        if (finalOutput === void 0) finalOutput = chunk;
                        else try {
                            finalOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["concat"])(finalOutput, chunk);
                        } catch  {
                            finalOutput = void 0;
                            finalOutputSupported = false;
                        }
                    }
                }
            }
        } catch (e) {
            await runManager?.handleChainError(e);
            throw e;
        }
        await runManager?.handleChainEnd(finalOutput ?? {});
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/history.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RunnableWithMessageHistory",
    ()=>RunnableWithMessageHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/passthrough.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
//#region src/runnables/history.ts
/**
* Wraps a LCEL chain and manages history. It appends input messages
* and chain outputs as history, and adds the current history messages to
* the chain input.
*
* @deprecated Use LangGraph's built-in persistence instead.
*
* @example
* ```typescript
* // pnpm install @langchain/anthropic @langchain/classic
*
* import {
*   ChatPromptTemplate,
*   MessagesPlaceholder,
* } from "@langchain/core/prompts";
* import { ChatAnthropic } from "@langchain/anthropic";
* import { ChatMessageHistory } from "@langchain/classic/stores/message/in_memory";
*
* const prompt = ChatPromptTemplate.fromMessages([
*   ["system", "You're an assistant who's good at {ability}"],
*   new MessagesPlaceholder("history"),
*   ["human", "{question}"],
* ]);
*
* const chain = prompt.pipe(new ChatAnthropic({}));
*
* const chainWithHistory = new RunnableWithMessageHistory({
*   runnable: chain,
*   getMessageHistory: (sessionId) =>
*     new UpstashRedisChatMessageHistory({
*       sessionId,
*       config: {
*         url: process.env.UPSTASH_REDIS_REST_URL!,
*         token: process.env.UPSTASH_REDIS_REST_TOKEN!,
*       },
*     }),
*   inputMessagesKey: "question",
*   historyMessagesKey: "history",
* });
*
* const result = await chainWithHistory.invoke(
*   {
*     ability: "math",
*     question: "What does cosine mean?",
*   },
*   {
*     configurable: {
*       sessionId: "some_string_identifying_a_user",
*     },
*   }
* );
*
* const result2 = await chainWithHistory.invoke(
*   {
*     ability: "math",
*     question: "What's its inverse?",
*   },
*   {
*     configurable: {
*       sessionId: "some_string_identifying_a_user",
*     },
*   }
* );
* ```
*/ var RunnableWithMessageHistory = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableBinding"] {
    runnable;
    inputMessagesKey;
    outputMessagesKey;
    historyMessagesKey;
    getMessageHistory;
    constructor(fields){
        let historyChain = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableLambda"].from((input, options)=>this._enterHistory(input, options ?? {})).withConfig({
            runName: "loadHistory"
        });
        const messagesKey = fields.historyMessagesKey ?? fields.inputMessagesKey;
        if (messagesKey) historyChain = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnablePassthrough"].assign({
            [messagesKey]: historyChain
        }).withConfig({
            runName: "insertHistory"
        });
        const bound = historyChain.pipe(fields.runnable.withListeners({
            onEnd: (run, config)=>this._exitHistory(run, config ?? {})
        })).withConfig({
            runName: "RunnableWithMessageHistory"
        });
        const config = fields.config ?? {};
        super({
            ...fields,
            config,
            bound
        });
        this.runnable = fields.runnable;
        this.getMessageHistory = fields.getMessageHistory;
        this.inputMessagesKey = fields.inputMessagesKey;
        this.outputMessagesKey = fields.outputMessagesKey;
        this.historyMessagesKey = fields.historyMessagesKey;
    }
    _getInputMessages(inputValue) {
        let parsedInputValue;
        if (typeof inputValue === "object" && !Array.isArray(inputValue) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBaseMessage"])(inputValue)) {
            let key;
            if (this.inputMessagesKey) key = this.inputMessagesKey;
            else if (Object.keys(inputValue).length === 1) key = Object.keys(inputValue)[0];
            else key = "input";
            if (Array.isArray(inputValue[key]) && Array.isArray(inputValue[key][0])) parsedInputValue = inputValue[key][0];
            else parsedInputValue = inputValue[key];
        } else parsedInputValue = inputValue;
        if (typeof parsedInputValue === "string") return [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessage"](parsedInputValue)
        ];
        else if (Array.isArray(parsedInputValue)) return parsedInputValue;
        else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBaseMessage"])(parsedInputValue)) return [
            parsedInputValue
        ];
        else throw new Error(`Expected a string, BaseMessage, or array of BaseMessages.\nGot ${JSON.stringify(parsedInputValue, null, 2)}`);
    }
    _getOutputMessages(outputValue) {
        let parsedOutputValue;
        if (!Array.isArray(outputValue) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBaseMessage"])(outputValue) && typeof outputValue !== "string") {
            let key;
            if (this.outputMessagesKey !== void 0) key = this.outputMessagesKey;
            else if (Object.keys(outputValue).length === 1) key = Object.keys(outputValue)[0];
            else key = "output";
            if (outputValue.generations !== void 0) parsedOutputValue = outputValue.generations[0][0].message;
            else parsedOutputValue = outputValue[key];
        } else parsedOutputValue = outputValue;
        if (typeof parsedOutputValue === "string") return [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessage"](parsedOutputValue)
        ];
        else if (Array.isArray(parsedOutputValue)) return parsedOutputValue;
        else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBaseMessage"])(parsedOutputValue)) return [
            parsedOutputValue
        ];
        else throw new Error(`Expected a string, BaseMessage, or array of BaseMessages. Received: ${JSON.stringify(parsedOutputValue, null, 2)}`);
    }
    async _enterHistory(input, kwargs) {
        const messages = await (kwargs?.configurable?.messageHistory).getMessages();
        if (this.historyMessagesKey === void 0) return messages.concat(this._getInputMessages(input));
        return messages;
    }
    async _exitHistory(run, config) {
        const history = config.configurable?.messageHistory;
        let inputs;
        if (Array.isArray(run.inputs) && Array.isArray(run.inputs[0])) inputs = run.inputs[0];
        else inputs = run.inputs;
        let inputMessages = this._getInputMessages(inputs);
        if (this.historyMessagesKey === void 0) {
            const existingMessages = await history.getMessages();
            inputMessages = inputMessages.slice(existingMessages.length);
        }
        const outputValue = run.outputs;
        if (!outputValue) throw new Error(`Output values from 'Run' undefined. Run: ${JSON.stringify(run, null, 2)}`);
        const outputMessages = this._getOutputMessages(outputValue);
        await history.addMessages([
            ...inputMessages,
            ...outputMessages
        ]);
    }
    async _mergeConfig(...configs) {
        const config = await super._mergeConfig(...configs);
        if (!config.configurable || !config.configurable.sessionId) {
            const exampleInput = {
                [this.inputMessagesKey ?? "input"]: "foo"
            };
            throw new Error(`sessionId is required. Pass it in as part of the config argument to .invoke() or .stream()\neg. chain.invoke(${JSON.stringify(exampleInput)}, ${JSON.stringify({
                configurable: {
                    sessionId: "123"
                }
            })})`);
        }
        const { sessionId } = config.configurable;
        config.configurable.messageHistory = await this.getMessageHistory(sessionId);
        return config;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runnables_exports",
    ()=>runnables_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/signal.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/passthrough.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$router$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/router.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$branch$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/branch.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$history$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/history.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
//#region src/runnables/index.ts
var runnables_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["__exportAll"])({
    RouterRunnable: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$router$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RouterRunnable"],
    Runnable: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Runnable"],
    RunnableAssign: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableAssign"],
    RunnableBinding: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableBinding"],
    RunnableBranch: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$branch$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableBranch"],
    RunnableEach: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableEach"],
    RunnableLambda: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableLambda"],
    RunnableMap: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableMap"],
    RunnableParallel: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableParallel"],
    RunnablePassthrough: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnablePassthrough"],
    RunnablePick: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnablePick"],
    RunnableRetry: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableRetry"],
    RunnableSequence: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableSequence"],
    RunnableToolLike: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableToolLike"],
    RunnableWithFallbacks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableWithFallbacks"],
    RunnableWithMessageHistory: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$history$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableWithMessageHistory"],
    _coerceToRunnable: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_coerceToRunnable"],
    ensureConfig: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureConfig"],
    getCallbackManagerForConfig: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallbackManagerForConfig"],
    mergeConfigs: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeConfigs"],
    patchConfig: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["patchConfig"],
    pickRunnableConfigKeys: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"],
    raceWithSignal: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["raceWithSignal"]
});
;
}),
];

//# sourceMappingURL=09_2_%40langchain_core_dist_runnables_0z6z97t._.js.map