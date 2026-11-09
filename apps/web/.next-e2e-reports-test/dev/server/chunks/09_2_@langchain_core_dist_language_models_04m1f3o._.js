module.exports = [
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/base.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseLangChain",
    ()=>BaseLangChain,
    "BaseLanguageModel",
    ()=>BaseLanguageModel,
    "base_exports",
    ()=>base_exports,
    "calculateMaxTokens",
    ()=>calculateMaxTokens,
    "getEmbeddingContextSize",
    ()=>getEmbeddingContextSize,
    "getModelContextSize",
    ()=>getModelContextSize,
    "getModelNameForTiktoken",
    ()=>getModelNameForTiktoken,
    "isOpenAITool",
    ()=>isOpenAITool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$caches$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/caches/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/async_caller.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompt_values.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$tiktoken$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/tiktoken.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
//#region src/language_models/base.ts
var base_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseLangChain: ()=>BaseLangChain,
    BaseLanguageModel: ()=>BaseLanguageModel,
    calculateMaxTokens: ()=>calculateMaxTokens,
    getEmbeddingContextSize: ()=>getEmbeddingContextSize,
    getModelContextSize: ()=>getModelContextSize,
    getModelNameForTiktoken: ()=>getModelNameForTiktoken,
    isOpenAITool: ()=>isOpenAITool
});
const getModelNameForTiktoken = (modelName)=>{
    if (modelName.startsWith("gpt-5")) return "gpt-5";
    if (modelName.startsWith("gpt-3.5-turbo-16k")) return "gpt-3.5-turbo-16k";
    if (modelName.startsWith("gpt-3.5-turbo-")) return "gpt-3.5-turbo";
    if (modelName.startsWith("gpt-4-32k")) return "gpt-4-32k";
    if (modelName.startsWith("gpt-4-")) return "gpt-4";
    if (modelName.startsWith("gpt-4o")) return "gpt-4o";
    return modelName;
};
const getEmbeddingContextSize = (modelName)=>{
    switch(modelName){
        case "text-embedding-ada-002":
            return 8191;
        default:
            return 2046;
    }
};
/**
* Get the context window size (max input tokens) for a given model.
*
* Context window sizes are sourced from official model documentation:
* - OpenAI: https://platform.openai.com/docs/models
* - Anthropic: https://docs.anthropic.com/claude/docs/models-overview
* - Google: https://ai.google.dev/gemini/docs/models/gemini
*
* @param modelName - The name of the model
* @returns The context window size in tokens
*/ const getModelContextSize = (modelName)=>{
    switch(getModelNameForTiktoken(modelName)){
        case "gpt-5":
        case "gpt-5-turbo":
        case "gpt-5-turbo-preview":
            return 4e5;
        case "gpt-4o":
        case "gpt-4o-mini":
        case "gpt-4o-2024-05-13":
        case "gpt-4o-2024-08-06":
            return 128e3;
        case "gpt-4-turbo":
        case "gpt-4-turbo-preview":
        case "gpt-4-turbo-2024-04-09":
        case "gpt-4-0125-preview":
        case "gpt-4-1106-preview":
            return 128e3;
        case "gpt-4-32k":
        case "gpt-4-32k-0314":
        case "gpt-4-32k-0613":
            return 32768;
        case "gpt-4":
        case "gpt-4-0314":
        case "gpt-4-0613":
            return 8192;
        case "gpt-3.5-turbo-16k":
        case "gpt-3.5-turbo-16k-0613":
            return 16384;
        case "gpt-3.5-turbo":
        case "gpt-3.5-turbo-0301":
        case "gpt-3.5-turbo-0613":
        case "gpt-3.5-turbo-1106":
        case "gpt-3.5-turbo-0125":
            return 4096;
        case "text-davinci-003":
        case "text-davinci-002":
            return 4097;
        case "text-davinci-001":
            return 2049;
        case "text-curie-001":
        case "text-babbage-001":
        case "text-ada-001":
            return 2048;
        case "code-davinci-002":
        case "code-davinci-001":
            return 8e3;
        case "code-cushman-001":
            return 2048;
        case "claude-3-5-sonnet-20241022":
        case "claude-3-5-sonnet-20240620":
        case "claude-3-opus-20240229":
        case "claude-3-sonnet-20240229":
        case "claude-3-haiku-20240307":
        case "claude-2.1":
            return 2e5;
        case "claude-2.0":
        case "claude-instant-1.2":
            return 1e5;
        case "gemini-1.5-pro":
        case "gemini-1.5-pro-latest":
        case "gemini-1.5-flash":
        case "gemini-1.5-flash-latest":
            return 1e6;
        case "gemini-pro":
        case "gemini-pro-vision":
            return 32768;
        default:
            return 4097;
    }
};
/**
* Whether or not the input matches the OpenAI tool definition.
* @param {unknown} tool The input to check.
* @returns {boolean} Whether the input is an OpenAI tool definition.
*/ function isOpenAITool(tool) {
    if (typeof tool !== "object" || !tool) return false;
    if ("type" in tool && tool.type === "function" && "function" in tool && typeof tool.function === "object" && tool.function && "name" in tool.function && "parameters" in tool.function) return true;
    return false;
}
const calculateMaxTokens = async ({ prompt, modelName })=>{
    let numTokens;
    try {
        numTokens = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$tiktoken$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodingForModel"])(getModelNameForTiktoken(modelName))).encode(prompt).length;
    } catch  {
        console.warn("Failed to calculate number of tokens, falling back to approximate count");
        numTokens = Math.ceil(prompt.length / 4);
    }
    return getModelContextSize(modelName) - numTokens;
};
const getVerbosity = ()=>false;
/**
* Base class for language models, chains, tools.
*/ var BaseLangChain = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Runnable"] {
    /**
	* Whether to print out response text.
	*/ verbose;
    callbacks;
    tags;
    metadata;
    get lc_attributes() {
        return {
            callbacks: void 0,
            verbose: void 0
        };
    }
    constructor(params){
        super(params);
        this.verbose = params.verbose ?? getVerbosity();
        this.callbacks = params.callbacks;
        this.tags = params.tags ?? [];
        this.metadata = params.metadata ?? {};
        this._addVersion("@langchain/core", "1.2.17");
    }
    _addVersion(pkg, version) {
        const existing = this.metadata?.versions;
        this.metadata = {
            ...this.metadata,
            versions: {
                ...typeof existing === "object" && existing !== null ? existing : {},
                [pkg]: version
            }
        };
    }
};
/**
* Base class for language models.
*/ var BaseLanguageModel = class extends BaseLangChain {
    /**
	* Keys that the language model accepts as call options.
	*/ get callKeys() {
        return [
            "stop",
            "timeout",
            "signal",
            "tags",
            "metadata",
            "callbacks"
        ];
    }
    /**
	* The async caller should be used by subclasses to make any async calls,
	* which will thus benefit from the concurrency and retry logic.
	*/ caller;
    cache;
    constructor({ callbacks, callbackManager, ...params }){
        const { cache, ...rest } = params;
        super({
            callbacks: callbacks ?? callbackManager,
            ...rest
        });
        if (typeof cache === "object") this.cache = cache;
        else if (cache) this.cache = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$caches$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InMemoryCache"].global();
        else this.cache = void 0;
        this.caller = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AsyncCaller"](params ?? {});
    }
    _encoding;
    /**
	* Get the number of tokens in the content.
	* @param content The content to get the number of tokens for.
	* @returns The number of tokens in the content.
	*/ async getNumTokens(content) {
        let textContent;
        if (typeof content === "string") textContent = content;
        else /**
		* Content is an array of ContentBlock
		*
		* ToDo(@christian-bromann): This is a temporary fix to get the number of tokens for the content.
		* We need to find a better way to do this.
		* @see https://github.com/langchain-ai/langchainjs/pull/8341#pullrequestreview-2933713116
		*/ textContent = content.map((item)=>{
            if (typeof item === "string") return item;
            if (item.type === "text" && "text" in item) return item.text;
            return "";
        }).join("");
        let numTokens = Math.ceil(textContent.length / 4);
        if (!this._encoding) try {
            this._encoding = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$tiktoken$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodingForModel"])("modelName" in this ? getModelNameForTiktoken(this.modelName) : "gpt2");
        } catch (error) {
            console.warn("Failed to calculate number of tokens, falling back to approximate count", error);
        }
        if (this._encoding) try {
            numTokens = this._encoding.encode(textContent).length;
        } catch (error) {
            console.warn("Failed to calculate number of tokens, falling back to approximate count", error);
        }
        return numTokens;
    }
    static _convertInputToPromptValue(input) {
        if (typeof input === "string") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StringPromptValue"](input);
        else if (Array.isArray(input)) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatPromptValue"](input.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]));
        else return input;
    }
    /**
	* Get the identifying parameters of the LLM.
	*/ _identifyingParams() {
        return {};
    }
    /**
	* Create a unique cache key for a specific call to a specific language model.
	* @param callOptions Call options for the model
	* @returns A unique cache key.
	*/ _getSerializedCacheKeyParametersForCall({ config, ...callOptions }) {
        const params = {
            ...this._identifyingParams(),
            ...callOptions,
            _type: this._llmType(),
            _model: this._modelType()
        };
        return Object.entries(params).filter(([_, value])=>value !== void 0).map(([key, value])=>`${key}:${JSON.stringify(value)}`).sort().join(",");
    }
    /**
	* @deprecated
	* Return a json-like object representing this LLM.
	*/ serialize() {
        return {
            ...this._identifyingParams(),
            _type: this._llmType(),
            _model: this._modelType()
        };
    }
    /**
	* @deprecated
	* Load an LLM from a json-like object describing it.
	*/ static async deserialize(_data) {
        throw new Error("Use .toJSON() instead");
    }
    /**
	* Return profiling information for the model.
	*
	* @returns {ModelProfile} An object describing the model's capabilities and constraints
	*/ get profile() {
        return {};
    }
    /**
	* Filter out large/inappropriate fields from invocation params for tracing metadata.
	* Removes fields like tools, functions, messages, response_format that can be large.
	*/ _filterInvocationParamsForTracing(params) {
        const { tools, functions, messages, response_format, ...rest } = params;
        return rest;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/structured_output.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assembleStructuredOutputPipeline",
    ()=>assembleStructuredOutputPipeline,
    "createContentParser",
    ()=>createContentParser,
    "createFunctionCallingParser",
    ()=>createFunctionCallingParser,
    "structured_output_exports",
    ()=>structured_output_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/standard_schema.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/passthrough.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/json.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$standard_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/standard_schema.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/structured.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_tools/json_output_tools_parsers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/index.js [app-route] (ecmascript) <locals>");
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
//#region src/language_models/structured_output.ts
var structured_output_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({
    assembleStructuredOutputPipeline: ()=>assembleStructuredOutputPipeline,
    createContentParser: ()=>createContentParser,
    createFunctionCallingParser: ()=>createFunctionCallingParser
});
/**
* Creates the appropriate content-based output parser for a schema. Use this for
* jsonMode/jsonSchema methods where the LLM returns JSON text.
*
* - Zod schema -> StructuredOutputParser (Zod validation)
* - Standard schema -> StandardSchemaOutputParser (standard schema validation)
* - Plain JSON schema -> JsonOutputParser (no validation)
*/ function createContentParser(schema) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(schema)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StructuredOutputParser"].fromZodSchema(schema);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSerializableSchema"])(schema)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$standard_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StandardSchemaOutputParser"].fromSerializableSchema(schema);
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["JsonOutputParser"]();
}
/**
* Creates the appropriate tool-calling output parser for a schema. Use this for
* function calling / tool use methods where the LLM returns structured tool calls.
*
* - Zod schema -> parser with Zod validation
* - Standard schema -> parser with standard schema validation
* - Plain JSON schema -> parser with no validation
*/ function createFunctionCallingParser(schema, keyName, ParserClass) {
    const Ctor = ParserClass ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JsonOutputKeyToolsParser"];
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(schema)) return new Ctor({
        returnSingle: true,
        keyName,
        zodSchema: schema
    });
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSerializableSchema"])(schema)) return new Ctor({
        returnSingle: true,
        keyName,
        serializableSchema: schema
    });
    return new Ctor({
        returnSingle: true,
        keyName
    });
}
/**
* Pipes an LLM through an output parser, optionally wrapping the result
* to include the raw LLM response alongside the parsed output.
*
* When `includeRaw` is true, returns `{ raw: BaseMessage, parsed: RunOutput }`.
* If parsing fails, `parsed` falls back to null.
*/ function assembleStructuredOutputPipeline(llm, outputParser, includeRaw, runName) {
    if (!includeRaw) {
        const result = llm.pipe(outputParser);
        return runName ? result.withConfig({
            runName
        }) : result;
    }
    const parserAssign = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RunnablePassthrough"].assign({
        parsed: (input, config)=>outputParser.invoke(input.raw, config)
    });
    const parserNone = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RunnablePassthrough"].assign({
        parsed: ()=>null
    });
    const parsedWithFallback = parserAssign.withFallbacks({
        fallbacks: [
            parserNone
        ]
    });
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RunnableSequence"].from([
        {
            raw: llm
        },
        parsedWithFallback
    ]);
    return runName ? result.withConfig({
        runName
    }) : result;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/stream.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatModelStream",
    ()=>ChatModelStream,
    "ReasoningContentStream",
    ()=>ReasoningContentStream,
    "TextContentStream",
    ()=>TextContentStream,
    "ToolCallsStream",
    ()=>ToolCallsStream,
    "UsageMetadataStream",
    ()=>UsageMetadataStream,
    "stream_exports",
    ()=>stream_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-route] (ecmascript)");
;
;
//#region src/language_models/stream.ts
/**
* Typed stream classes for chat model streaming.
*
* @module
*/ var stream_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({
    ChatModelStream: ()=>ChatModelStream,
    ReasoningContentStream: ()=>ReasoningContentStream,
    TextContentStream: ()=>TextContentStream,
    ToolCallsStream: ()=>ToolCallsStream,
    UsageMetadataStream: ()=>UsageMetadataStream
});
/**
* A buffer that caches emitted events for replay.
*
* Multiple consumers can independently iterate the same buffer —
* each gets its own cursor. Events are never consumed or removed.
*
* @internal
*/ var ReplayBuffer = class {
    events = [];
    finished = false;
    waiters = [];
    error = null;
    push(event) {
        this.events.push(event);
        const toWake = this.waiters.splice(0);
        for (const waiter of toWake)waiter();
    }
    finish() {
        this.finished = true;
        const toWake = this.waiters.splice(0);
        for (const waiter of toWake)waiter();
    }
    setError(err) {
        this.error = err;
        this.finished = true;
        const toWake = this.waiters.splice(0);
        for (const waiter of toWake)waiter();
    }
    async *iterate() {
        if (this.finished) {
            if (this.error) throw this.error;
            yield* this.events;
            return;
        }
        let cursor = 0;
        while(true){
            while(cursor < this.events.length){
                yield this.events[cursor];
                cursor++;
            }
            if (this.finished) {
                if (this.error) throw this.error;
                return;
            }
            await new Promise((resolve)=>{
                if (cursor < this.events.length || this.finished) {
                    resolve();
                    return;
                }
                this.waiters.push(resolve);
            });
        }
    }
};
/**
* Apply a typed delta to an accumulated content block.
*
* - `text-delta` → append text
* - `reasoning-delta` → append reasoning text
* - `data-delta` → append encoded data to `data`
* - `block-delta` → shallow merge fields
*
* @internal
*/ function applyDelta(block, delta) {
    switch(delta.type){
        case "text-delta":
            if (block.type === "text") return {
                ...block,
                text: (block.text ?? "") + delta.text
            };
            return block;
        case "reasoning-delta":
            if (block.type === "thinking") return {
                ...block,
                thinking: (block.thinking ?? "") + delta.reasoning
            };
            if (block.type === "reasoning") return {
                ...block,
                reasoning: (block.reasoning ?? "") + delta.reasoning
            };
            return block;
        case "data-delta":
            return {
                ...block,
                data: (block.data ?? "") + delta.data
            };
        case "block-delta":
            return {
                ...block,
                ...delta.fields
            };
        default:
            throw new Error(`Unknown delta type: ${JSON.stringify(delta)}`);
    }
}
/**
* Returns the typed delta carried by a content-block delta event.
*
* Stream protocol compliant language models store incremental updates in
* `event.delta`, e.g. `{ type: "text-delta", text: "hello" }`. Some models and
* adapters still emit the older content-shaped form on `event.content`, e.g.
* `{ type: "text", text: "hello" }`, which predates explicit delta event
* variants.
*
* Keep accepting that content-shaped form here so {@link ChatModelStream}
* remains a tolerant consumer while producers migrate to protocol compliant
* typed deltas.
*
* @internal
*/ function getEventDelta(event) {
    if (event.event !== "content-block-delta") return void 0;
    if ("delta" in event && event.delta) return event.delta;
    const content = event.content;
    if (content == null || typeof content !== "object") return void 0;
    const block = content;
    if (block.type === "text" && typeof block.text === "string") return {
        type: "text-delta",
        text: block.text
    };
    if (block.type === "reasoning" && typeof block.reasoning === "string") return {
        type: "reasoning-delta",
        reasoning: block.reasoning
    };
    if (block.type === "thinking" && typeof block.thinking === "string") return {
        type: "reasoning-delta",
        reasoning: block.thinking
    };
    if (typeof block.data === "string") return {
        type: "data-delta",
        data: block.data,
        encoding: "base64"
    };
    if (typeof block.type === "string") return {
        type: "block-delta",
        fields: {
            ...block,
            type: block.type
        }
    };
}
function getReasoningDelta(content) {
    if (content == null || typeof content !== "object") return void 0;
    const block = content;
    if (block.type === "reasoning" && typeof block.reasoning === "string") return block.reasoning;
    if (block.type === "thinking" && typeof block.thinking === "string") return block.thinking;
}
function isReasoningContent(content) {
    if (content == null || typeof content !== "object") return false;
    const type = content.type;
    return type === "reasoning" || type === "thinking";
}
/**
* Normalize protocol-compatible partial usage into Core's concrete usage shape.
*
* Some stream sources emit usage snapshots without every aggregate token field.
* Keep the stream event input permissive, then normalize at read time so
* high-level Core consumers always receive a complete {@link UsageMetadata}.
*/ function normalizeUsage(usage) {
    if (!usage) return void 0;
    return {
        ...usage,
        input_tokens: usage.input_tokens ?? 0,
        output_tokens: usage.output_tokens ?? 0,
        total_tokens: usage.total_tokens ?? 0
    };
}
function parseToolArgs(value) {
    if (value != null && typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value !== "string" || value.length === 0) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed != null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function standardizeToolBlock(block) {
    const record = block;
    if (block.type === "tool_call") return block;
    if (block.type !== "tool_call_chunk" && block.type !== "tool_use" && block.type !== "input_json_delta") return block;
    const name = typeof record.name === "string" ? record.name : void 0;
    if (name == null) return block;
    const args = record.args ?? record.input;
    return {
        ...record,
        type: "tool_call",
        name,
        args: parseToolArgs(args)
    };
}
/**
* Typed stream for text content.
*
* - **Iterate**: yields incremental text deltas.
* - **Await**: resolves to the complete concatenated text.
* - **`.full`**: yields the running accumulated text after each delta.
*/ var TextContentStream = class {
    /** @internal */ _buffer;
    /** @internal */ constructor(buffer){
        this._buffer = buffer;
    }
    /** Yields the accumulated text so far after each delta. */ get full() {
        const buffer = this._buffer;
        return {
            async *[Symbol.asyncIterator] () {
                let accumulated = "";
                for await (const event of buffer.iterate()){
                    const delta = getEventDelta(event);
                    if (delta?.type === "text-delta") {
                        accumulated += delta.text;
                        yield accumulated;
                    }
                }
            }
        };
    }
    /** Yields incremental text deltas. */ [Symbol.asyncIterator]() {
        const buffer = this._buffer;
        async function* gen() {
            for await (const event of buffer.iterate()){
                const delta = getEventDelta(event);
                if (delta?.type === "text-delta") yield delta.text;
            }
        }
        return gen();
    }
    then(onfulfilled, onrejected) {
        return (async ()=>{
            let text = "";
            for await (const delta of this)text += delta;
            return text;
        })().then(onfulfilled, onrejected);
    }
};
/**
* Typed stream for tool calls.
*
* - **Iterate**: yields individual `ToolCall` objects as each completes.
* - **Await**: resolves to the full array.
* - **`.full`**: yields the accumulated array after each new tool call.
*/ var ToolCallsStream = class {
    /** @internal */ _buffer;
    /** @internal */ constructor(buffer){
        this._buffer = buffer;
    }
    get full() {
        const buffer = this._buffer;
        return {
            async *[Symbol.asyncIterator] () {
                const calls = [];
                for await (const event of buffer.iterate())if (event.event === "content-block-finish" && event.content.type === "tool_call") {
                    calls.push(event.content);
                    yield [
                        ...calls
                    ];
                }
            }
        };
    }
    [Symbol.asyncIterator]() {
        const buffer = this._buffer;
        async function* gen() {
            for await (const event of buffer.iterate())if (event.event === "content-block-finish" && event.content.type === "tool_call") yield event.content;
        }
        return gen();
    }
    then(onfulfilled, onrejected) {
        return (async ()=>{
            const calls = [];
            for await (const call of this)calls.push(call);
            return calls;
        })().then(onfulfilled, onrejected);
    }
};
/**
* Typed stream for reasoning content (chain-of-thought).
* Same interface as {@link TextContentStream} but for reasoning blocks.
*/ var ReasoningContentStream = class {
    /** @internal */ _buffer;
    /** @internal */ constructor(buffer){
        this._buffer = buffer;
    }
    get full() {
        const buffer = this._buffer;
        return {
            async *[Symbol.asyncIterator] () {
                let accumulated = "";
                let seenReasoning = false;
                for await (const event of buffer.iterate())if (event.event === "content-block-start") {
                    if (!isReasoningContent(event.content)) {
                        if (seenReasoning) return;
                        continue;
                    }
                    seenReasoning = true;
                    const delta = getReasoningDelta(event.content);
                    if (delta == null || delta.length === 0) continue;
                    accumulated += delta;
                    yield accumulated;
                } else if (event.event === "content-block-delta") {
                    const eventDelta = getEventDelta(event);
                    if (eventDelta?.type !== "reasoning-delta") continue;
                    seenReasoning = true;
                    const delta = eventDelta.reasoning;
                    if (delta == null || delta.length === 0) continue;
                    accumulated += delta;
                    yield accumulated;
                } else if (event.event === "content-block-finish" && isReasoningContent(event.content)) return;
                else if (event.event === "message-finish") return;
            }
        };
    }
    [Symbol.asyncIterator]() {
        const buffer = this._buffer;
        async function* gen() {
            let seenReasoning = false;
            for await (const event of buffer.iterate())if (event.event === "content-block-start") {
                if (!isReasoningContent(event.content)) {
                    if (seenReasoning) return;
                    continue;
                }
                seenReasoning = true;
                const delta = getReasoningDelta(event.content);
                if (delta != null && delta.length > 0) yield delta;
            } else if (event.event === "content-block-delta") {
                const eventDelta = getEventDelta(event);
                if (eventDelta?.type !== "reasoning-delta") continue;
                seenReasoning = true;
                const delta = eventDelta.reasoning;
                if (delta != null && delta.length > 0) yield delta;
            } else if (event.event === "content-block-finish" && isReasoningContent(event.content)) return;
            else if (event.event === "message-finish") return;
        }
        return gen();
    }
    then(onfulfilled, onrejected) {
        return (async ()=>{
            let text = "";
            for await (const delta of this)text += delta;
            return text;
        })().then(onfulfilled, onrejected);
    }
};
/**
* Typed stream for usage metadata.
*/ var UsageMetadataStream = class {
    /** @internal */ _buffer;
    /** @internal */ constructor(buffer){
        this._buffer = buffer;
    }
    [Symbol.asyncIterator]() {
        const buffer = this._buffer;
        async function* gen() {
            for await (const event of buffer.iterate())if (event.event === "usage") {
                const usage = normalizeUsage(event.usage);
                if (usage) yield usage;
            } else if (event.event === "message-start" && event.usage) {
                const usage = normalizeUsage(event.usage);
                if (usage) yield usage;
            } else if (event.event === "message-finish" && event.usage) {
                const usage = normalizeUsage(event.usage);
                if (usage) yield usage;
            }
        }
        return gen();
    }
    then(onfulfilled, onrejected) {
        return (async ()=>{
            let latest;
            for await (const usage of this)latest = usage;
            return latest;
        })().then(onfulfilled, onrejected);
    }
};
/**
* The main stream object returned by chat model streaming.
*
* Implements `AsyncIterable<ChatModelStreamEvent>` for raw event access
* and `PromiseLike<AIMessage>` for simple `await` usage.
*/ var ChatModelStream = class {
    /** @internal */ _buffer;
    /** @internal */ constructor(source){
        this._buffer = new ReplayBuffer();
        this._consume(source);
    }
    /** @internal */ async _consume(source) {
        try {
            for await (const event of source)this._buffer.push(event);
            this._buffer.finish();
        } catch (err) {
            this._buffer.setError(err instanceof Error ? err : new Error(String(err)));
        }
    }
    [Symbol.asyncIterator]() {
        return this._buffer.iterate();
    }
    get text() {
        return new TextContentStream(this._buffer);
    }
    get toolCalls() {
        return new ToolCallsStream(this._buffer);
    }
    get reasoning() {
        return new ReasoningContentStream(this._buffer);
    }
    get usage() {
        return new UsageMetadataStream(this._buffer);
    }
    get output() {
        return this._assembleMessage();
    }
    then(onfulfilled, onrejected) {
        return this._assembleMessage().then(onfulfilled, onrejected);
    }
    /** @internal */ async _assembleMessage() {
        const contentBlocks = [];
        let id;
        let usage;
        let metadata = {};
        let finishReason;
        for await (const event of this._buffer.iterate())switch(event.event){
            case "message-start":
                id = event.id ?? id;
                if (event.usage) usage = normalizeUsage(event.usage);
                break;
            case "content-block-start":
                contentBlocks[event.index] = event.content;
                break;
            case "content-block-delta":
                {
                    const current = contentBlocks[event.index];
                    const delta = getEventDelta(event);
                    if (current) {
                        if (delta) contentBlocks[event.index] = applyDelta(current, delta);
                    }
                    break;
                }
            case "content-block-finish":
                contentBlocks[event.index] = event.content;
                break;
            case "usage":
                usage = normalizeUsage(event.usage);
                break;
            case "message-finish":
                finishReason = event.reason;
                if (event.usage) usage = normalizeUsage(event.usage);
                if (event.responseMetadata) metadata = {
                    ...metadata,
                    ...event.responseMetadata
                };
        }
        const filteredBlocks = contentBlocks.filter((b)=>b != null).map(standardizeToolBlock);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AIMessage"]({
            id,
            content: filteredBlocks,
            usage_metadata: usage,
            response_metadata: {
                ...metadata,
                ...finishReason ? {
                    finish_reason: finishReason
                } : {},
                output_version: "v1"
            }
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/compat.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compat_exports",
    ()=>compat_exports,
    "convertChunksToEvents",
    ()=>convertChunksToEvents,
    "finalizeContentBlock",
    ()=>finalizeContentBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-route] (ecmascript)");
;
;
//#region src/language_models/compat.ts
/**
* Compatibility bridge: converts legacy `_streamResponseChunks`
* (`ChatGenerationChunk` / `AIMessageChunk`) output to the new
* `ChatModelStreamEvent` protocol.
*
* @module
*/ var compat_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({
    convertChunksToEvents: ()=>convertChunksToEvents,
    finalizeContentBlock: ()=>finalizeContentBlock
});
const MIME_TYPE_BY_AUDIO_FORMAT = {
    wav: "audio/wav",
    mp3: "audio/mpeg",
    flac: "audio/flac",
    opus: "audio/opus",
    aac: "audio/aac",
    pcm16: "audio/pcm"
};
const MIME_TYPE_BY_IMAGE_FORMAT = {
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif"
};
function nextBlockIndex(activeBlocks) {
    let next = 0;
    for (const index of activeBlocks.keys())if (index >= next) next = index + 1;
    return next;
}
function getAdditionalKwargs(message) {
    const additional = message.additional_kwargs;
    return additional != null && typeof additional === "object" ? additional : {};
}
function extractImageBlocksFromToolOutputs(message) {
    const toolOutputs = getAdditionalKwargs(message).tool_outputs;
    if (!Array.isArray(toolOutputs)) return [];
    const blocks = [];
    for (const entry of toolOutputs){
        if (entry == null || typeof entry !== "object") continue;
        const record = entry;
        if (record.type !== "image_generation_call") continue;
        const data = typeof record.result === "string" ? record.result : void 0;
        const url = typeof record.url === "string" ? record.url : void 0;
        if (data == null && url == null) continue;
        const outputFormat = typeof record.output_format === "string" ? record.output_format.toLowerCase() : void 0;
        const mimeType = (outputFormat != null ? MIME_TYPE_BY_IMAGE_FORMAT[outputFormat] : void 0) ?? "image/png";
        blocks.push({
            type: "image",
            ...typeof record.id === "string" ? {
                id: record.id
            } : {},
            ...url != null ? {
                url
            } : {},
            ...data != null ? {
                data
            } : {},
            mimeType
        });
    }
    return blocks;
}
/**
* Get the audio payload from the message.
*
* This handles the OpenAI-shaped `additional_kwargs.audio` payload used by
* legacy chunk streams; other providers must normalize into this shape first.
*
* @param message - The message to get the audio payload from.
* @returns The audio payload.
* @internal
*/ function getAudioPayload(message) {
    const audio = getAdditionalKwargs(message).audio;
    if (audio == null || typeof audio !== "object") return void 0;
    const record = audio;
    const data = typeof record.data === "string" ? record.data : void 0;
    const url = typeof record.url === "string" ? record.url : void 0;
    const transcript = typeof record.transcript === "string" ? record.transcript : void 0;
    if (data == null && url == null && transcript == null) return void 0;
    const explicitMimeType = typeof record.mime_type === "string" ? record.mime_type : typeof record.mimeType === "string" ? record.mimeType : void 0;
    const format = typeof record.format === "string" ? record.format.toLowerCase() : void 0;
    const mimeType = explicitMimeType ?? (format != null ? MIME_TYPE_BY_AUDIO_FORMAT[format] : void 0) ?? (data != null ? "audio/wav" : "audio/pcm");
    return {
        ...typeof record.id === "string" ? {
            id: record.id
        } : {},
        ...data != null ? {
            data
        } : {},
        ...url != null ? {
            url
        } : {},
        ...transcript != null ? {
            transcript
        } : {},
        mimeType
    };
}
/**
* Convert an async iterable of legacy `ChatGenerationChunk`s into
* `ChatModelStreamEvent`s with typed deltas.
*/ async function* convertChunksToEvents(chunks, options) {
    const activeBlocks = /* @__PURE__ */ new Map();
    let messageStarted = false;
    let lastUsage;
    let audioStream;
    const emittedImageKeys = /* @__PURE__ */ new Set();
    for await (const chunk of chunks){
        options?.signal?.throwIfAborted();
        const msg = chunk.message;
        let usageHandledInStart = false;
        if (!messageStarted) {
            messageStarted = true;
            const startEvent = {
                event: "message-start",
                id: msg.id ?? void 0
            };
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AIMessageChunk"].isInstance(msg) && msg.usage_metadata) {
                startEvent.usage = msg.usage_metadata;
                lastUsage = {
                    ...msg.usage_metadata
                };
                usageHandledInStart = true;
            }
            yield startEvent;
        }
        const content = msg.content;
        if (typeof content === "string") {
            if (content !== "") {
                const blockIndex = 0;
                if (!activeBlocks.has(blockIndex)) {
                    const initial = {
                        type: "text",
                        text: ""
                    };
                    activeBlocks.set(blockIndex, {
                        type: "text",
                        accumulated: initial
                    });
                    yield {
                        event: "content-block-start",
                        index: blockIndex,
                        content: initial
                    };
                }
                const block = activeBlocks.get(blockIndex);
                block.accumulated = {
                    ...block.accumulated,
                    text: (block.accumulated.text ?? "") + content
                };
                yield {
                    event: "content-block-delta",
                    index: blockIndex,
                    delta: {
                        type: "text-delta",
                        text: content
                    }
                };
            }
        } else if (Array.isArray(content)) for (const part of content){
            const blockIndex = typeof part.index === "number" ? part.index : activeBlocks.size;
            if (!activeBlocks.has(blockIndex)) {
                activeBlocks.set(blockIndex, {
                    type: part.type,
                    accumulated: {
                        ...part
                    }
                });
                yield {
                    event: "content-block-start",
                    index: blockIndex,
                    content: {
                        ...part
                    }
                };
            } else {
                const block = activeBlocks.get(blockIndex);
                const delta = contentBlockToDelta(part);
                block.accumulated = applyDeltaToBlock(block.accumulated, delta);
                yield {
                    event: "content-block-delta",
                    index: blockIndex,
                    delta
                };
            }
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AIMessageChunk"].isInstance(msg) && msg.tool_call_chunks && msg.tool_call_chunks.length > 0) for (const toolChunk of msg.tool_call_chunks){
            const blockIndex = typeof toolChunk.index === "number" ? toolChunk.index : activeBlocks.size;
            if (!activeBlocks.has(blockIndex)) {
                const initial = {
                    type: "tool_call_chunk",
                    id: toolChunk.id,
                    name: toolChunk.name,
                    args: "",
                    index: blockIndex
                };
                activeBlocks.set(blockIndex, {
                    type: "tool_call_chunk",
                    accumulated: initial
                });
                yield {
                    event: "content-block-start",
                    index: blockIndex,
                    content: initial
                };
            }
            const acc = activeBlocks.get(blockIndex).accumulated;
            if (toolChunk.id != null) acc.id = toolChunk.id;
            if (toolChunk.name != null) acc.name = toolChunk.name;
            acc.args = (acc.args ?? "") + (toolChunk.args ?? "");
            yield {
                event: "content-block-delta",
                index: blockIndex,
                delta: {
                    type: "block-delta",
                    fields: {
                        type: "tool_call_chunk",
                        ..."id" in acc && acc.id != null ? {
                            id: acc.id
                        } : {},
                        ..."name" in acc && acc.name != null ? {
                            name: acc.name
                        } : {},
                        args: acc.args
                    }
                }
            };
        }
        const audioPayload = getAudioPayload(msg);
        if (audioPayload != null) {
            if (audioStream == null) {
                const index = nextBlockIndex(activeBlocks);
                audioStream = {
                    index,
                    id: audioPayload.id,
                    mimeType: audioPayload.mimeType,
                    transcript: ""
                };
                const initial = {
                    type: "audio",
                    ...audioPayload.id != null ? {
                        id: audioPayload.id
                    } : {},
                    ...audioPayload.url != null ? {
                        url: audioPayload.url
                    } : {},
                    data: "",
                    mimeType: audioPayload.mimeType
                };
                activeBlocks.set(index, {
                    type: "audio",
                    accumulated: initial
                });
                yield {
                    event: "content-block-start",
                    index,
                    content: initial
                };
            }
            const activeAudio = activeBlocks.get(audioStream.index);
            if (activeAudio != null) {
                const accumulated = activeAudio.accumulated;
                if (audioPayload.id != null && audioStream.id == null) {
                    audioStream.id = audioPayload.id;
                    accumulated.id = audioPayload.id;
                }
                if (audioPayload.transcript != null) {
                    audioStream.transcript += audioPayload.transcript;
                    accumulated.transcript = audioStream.transcript;
                    yield {
                        event: "content-block-delta",
                        index: audioStream.index,
                        delta: {
                            type: "block-delta",
                            fields: {
                                type: "audio",
                                transcript: audioStream.transcript
                            }
                        }
                    };
                }
                if (audioPayload.data != null && audioPayload.data.length > 0) {
                    accumulated.data = (accumulated.data ?? "") + audioPayload.data;
                    yield {
                        event: "content-block-delta",
                        index: audioStream.index,
                        delta: {
                            type: "data-delta",
                            data: audioPayload.data,
                            encoding: "base64"
                        }
                    };
                }
            }
        }
        for (const imageBlock of extractImageBlocksFromToolOutputs(msg)){
            const imageRecord = imageBlock;
            const imageKey = imageRecord.id ?? imageRecord.url ?? (imageRecord.data != null ? `${imageRecord.data.length}:${imageRecord.data.slice(0, 32)}` : void 0);
            if (imageKey != null && emittedImageKeys.has(imageKey)) continue;
            if (imageKey != null) emittedImageKeys.add(imageKey);
            const index = nextBlockIndex(activeBlocks);
            activeBlocks.set(index, {
                type: "image",
                accumulated: imageBlock
            });
            yield {
                event: "content-block-start",
                index,
                content: imageBlock
            };
        }
        if (!usageHandledInStart && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AIMessageChunk"].isInstance(msg) && msg.usage_metadata) {
            const chunkUsage = msg.usage_metadata;
            if (!lastUsage) lastUsage = {
                ...chunkUsage
            };
            else lastUsage = {
                input_tokens: lastUsage.input_tokens + chunkUsage.input_tokens,
                output_tokens: lastUsage.output_tokens + chunkUsage.output_tokens,
                total_tokens: lastUsage.total_tokens + chunkUsage.total_tokens
            };
            yield {
                event: "usage",
                usage: {
                    ...lastUsage
                }
            };
        }
    }
    for (const [index, block] of activeBlocks)yield {
        event: "content-block-finish",
        index,
        content: finalizeContentBlock(block.accumulated)
    };
    yield {
        event: "message-finish",
        reason: "stop",
        ...lastUsage ? {
            usage: lastUsage
        } : {}
    };
}
/**
* Apply a typed delta to an accumulated content block.
* @internal
*/ function applyDeltaToBlock(block, delta) {
    switch(delta.type){
        case "text-delta":
            if (block.type === "text") return {
                ...block,
                text: (block.text ?? "") + delta.text
            };
            return block;
        case "reasoning-delta":
            if (block.type === "thinking") return {
                ...block,
                thinking: (block.thinking ?? "") + delta.reasoning
            };
            if (block.type === "reasoning") return {
                ...block,
                reasoning: (block.reasoning ?? "") + delta.reasoning
            };
            return block;
        case "data-delta":
            return {
                ...block,
                data: (block.data ?? "") + delta.data
            };
        case "block-delta":
            return {
                ...block,
                ...delta.fields
            };
        default:
            throw new Error(`Unknown delta type: ${JSON.stringify(delta)}`);
    }
}
function contentBlockToDelta(block) {
    if (block.type === "text") return {
        type: "text-delta",
        text: block.text
    };
    if (block.type === "reasoning") return {
        type: "reasoning-delta",
        reasoning: block.reasoning
    };
    if (block.type === "thinking" && typeof block.thinking === "string") return {
        type: "reasoning-delta",
        reasoning: block.thinking
    };
    if (typeof block.data === "string") return {
        type: "data-delta",
        data: block.data,
        encoding: "base64"
    };
    if (typeof block.type === "string") return {
        type: "block-delta",
        fields: {
            ...block
        }
    };
    throw new Error(`Unsupported content block delta: ${JSON.stringify(block)}`);
}
/**
* Finalize a content block for the finish event.
* For tool calls, parse the accumulated JSON args string.
*/ function finalizeContentBlock(block) {
    if (block.type === "tool_call_chunk") {
        const chunk = block;
        let parsedArgs;
        try {
            parsedArgs = JSON.parse(chunk.args ?? "{}");
        } catch  {
            return {
                type: "invalid_tool_call",
                id: chunk.id,
                name: chunk.name,
                args: chunk.args,
                error: "Failed to parse tool call arguments as JSON"
            };
        }
        return {
            type: "tool_call",
            id: chunk.id,
            name: chunk.name,
            args: parsedArgs
        };
    }
    return block;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "castStandardMessageContent",
    ()=>castStandardMessageContent,
    "iife",
    ()=>iife
]);
//#region src/language_models/utils.ts
const iife = (fn)=>fn();
function castStandardMessageContent(message) {
    const Cls = message.constructor;
    return new Cls({
        ...message,
        content: message.contentBlocks,
        response_metadata: {
            ...message.response_metadata,
            output_version: "v1"
        }
    });
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/chat_models.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseChatModel",
    ()=>BaseChatModel,
    "SimpleChatModel",
    ()=>SimpleChatModel,
    "chat_models_exports",
    ()=>chat_models_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/errors/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/data.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/manager.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/outputs.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/standard_schema.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_schema.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/utils.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$structured_output$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/structured_output.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$stream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/stream.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/compat.js [app-route] (ecmascript)");
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
;
//#region src/language_models/chat_models.ts
var chat_models_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseChatModel: ()=>BaseChatModel,
    SimpleChatModel: ()=>SimpleChatModel
});
function _formatForTracing(messages) {
    const messagesToTrace = [];
    for (const message of messages){
        let messageToTrace = message;
        if (Array.isArray(message.content)) for(let idx = 0; idx < message.content.length; idx++){
            const block = message.content[idx];
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isURLContentBlock"])(block) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBase64ContentBlock"])(block)) {
                if (messageToTrace === message) messageToTrace = new message.constructor({
                    ...messageToTrace,
                    content: [
                        ...message.content.slice(0, idx),
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertToOpenAIImageBlock"])(block),
                        ...message.content.slice(idx + 1)
                    ]
                });
            }
        }
        messagesToTrace.push(messageToTrace);
    }
    return messagesToTrace;
}
/**
* Base class for chat models. It extends the BaseLanguageModel class and
* provides methods for generating chat based on input messages.
*/ var BaseChatModel = class BaseChatModel extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseLanguageModel"] {
    lc_namespace = [
        "langchain",
        "chat_models",
        this._llmType()
    ];
    disableStreaming = false;
    outputVersion;
    get callKeys() {
        return [
            ...super.callKeys,
            "outputVersion"
        ];
    }
    constructor(fields){
        super(fields);
        this.outputVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["iife"])(()=>{
            const outputVersion = fields.outputVersion ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LC_OUTPUT_VERSION");
            if (outputVersion && [
                "v0",
                "v1"
            ].includes(outputVersion)) return outputVersion;
            return "v0";
        });
    }
    _separateRunnableConfigFromCallOptionsCompat(options) {
        const [runnableConfig, callOptions] = super._separateRunnableConfigFromCallOptions(options);
        callOptions.signal = runnableConfig.signal;
        return [
            runnableConfig,
            callOptions
        ];
    }
    /**
	* Invokes the chat model with a single input.
	* @param input The input for the language model.
	* @param options The call options.
	* @returns A Promise that resolves to a BaseMessageChunk.
	*/ async invoke(input, options) {
        const promptValue = BaseChatModel._convertInputToPromptValue(input);
        return (await this.generatePrompt([
            promptValue
        ], options, options?.callbacks)).generations[0][0].message;
    }
    async *_streamResponseChunks(_messages, _options, _runManager) {
        throw new Error("Not implemented.");
    }
    /**
	* Stream chat model events using the new content-block-centric protocol.
	*
	* Override this method to provide native event streaming from the provider SDK.
	* The default implementation bridges from `_streamResponseChunks` by
	* synthesizing lifecycle events from `ChatGenerationChunk` objects.
	*
	* ## Event lifecycle
	*
	* ```
	* MessageStart
	*   -> ContentBlockStart(index, contentBlock)
	*     -> ContentBlockDelta(index, delta) ...
	*   -> ContentBlockFinish(index, contentBlock)
	* -> MessageFinish(reason, usage?)
	* ```
	*
	* Content blocks may interleave (e.g., parallel tool calls). The only
	* invariant: a block's start precedes its deltas, and its deltas precede
	* its finish.
	*
	* @param messages - The input messages.
	* @param options - Parsed call options.
	* @param runManager - Optional callback manager for the run.
	* @returns An async generator of {@link ChatModelStreamEvent}.
	*/ async *_streamChatModelEvents(messages, options, runManager) {
        const chunks = this._streamResponseChunks(messages, options, runManager);
        yield* (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertChunksToEvents"])(chunks, {
            signal: options.signal
        });
    }
    streamEvents(input, options, streamOptions) {
        if (options?.version === "v1" || options?.version === "v2") return super.streamEvents(input, options, streamOptions);
        const messages = BaseChatModel._convertInputToPromptValue(input).toChatMessages();
        const [, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(options);
        const generator = this._streamChatModelEvents(messages, callOptions);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$stream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatModelStream"](generator);
    }
    /**
	* @deprecated Use {@link BaseChatModel.streamEvents} instead. This method will be removed in the next major version.
	*/ streamV2(input, options) {
        return this.streamEvents(input, options);
    }
    async *_streamIterator(input, options) {
        if (this._streamResponseChunks === BaseChatModel.prototype._streamResponseChunks || this.disableStreaming) yield this.invoke(input, options);
        else {
            const messages = BaseChatModel._convertInputToPromptValue(input).toChatMessages();
            const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(options);
            const inheritableMetadata = {
                ...runnableConfig.metadata,
                ...this.getLsParamsWithDefaults(callOptions)
            };
            const invocationParams = this._getInvocationParamsForTracing(callOptions);
            const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CallbackManager"].configure(runnableConfig.callbacks, this.callbacks, runnableConfig.tags, this.tags, inheritableMetadata, this.metadata, {
                verbose: this.verbose,
                tracerInheritableMetadata: this._filterInvocationParamsForTracing(invocationParams)
            });
            const extra = {
                options: this._getCallOptionsForTracing(callOptions, invocationParams),
                invocation_params: invocationParams,
                batch_size: 1
            };
            const outputVersion = callOptions.outputVersion ?? this.outputVersion;
            const runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), [
                _formatForTracing(messages)
            ], runnableConfig.runId, void 0, extra, void 0, void 0, runnableConfig.runName);
            let generationChunk;
            try {
                for await (const chunk of this._streamResponseChunks(messages, callOptions, runManagers?.[0])){
                    callOptions.signal?.throwIfAborted();
                    if (chunk.message.id == null) {
                        const runId = runManagers?.at(0)?.runId;
                        if (runId != null) chunk.message._updateId(`run-${runId}`);
                    }
                    chunk.message.response_metadata = {
                        ...chunk.generationInfo,
                        ...chunk.message.response_metadata
                    };
                    if (outputVersion === "v1") yield (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["castStandardMessageContent"])(chunk.message);
                    else yield chunk.message;
                    if (!generationChunk) generationChunk = chunk;
                    else generationChunk = generationChunk.concat(chunk);
                }
                callOptions.signal?.throwIfAborted();
            } catch (err) {
                await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMError(err)));
                throw err;
            }
            let llmOutput;
            if (generationChunk && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AIMessageChunk"].isInstance(generationChunk.message) && generationChunk.message.usage_metadata !== void 0) llmOutput = {
                tokenUsage: {
                    promptTokens: generationChunk.message.usage_metadata.input_tokens,
                    completionTokens: generationChunk.message.usage_metadata.output_tokens,
                    totalTokens: generationChunk.message.usage_metadata.total_tokens
                }
            };
            await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMEnd({
                    generations: [
                        [
                            generationChunk
                        ]
                    ],
                    llmOutput
                })));
        }
    }
    getLsParams(options) {
        const providerName = this.getName().startsWith("Chat") ? this.getName().replace("Chat", "") : this.getName();
        return {
            ls_model_type: "chat",
            ls_stop: options.stop,
            ls_provider: providerName
        };
    }
    /**
	* Wraps getLsParams() and always appends ls_integration.
	* This ensures the integration tag is present even when
	* partner packages fully override getLsParams().
	*/ getLsParamsWithDefaults(options) {
        return {
            ...this.getLsParams(options),
            ls_integration: "langchain_chat_model"
        };
    }
    /** @ignore */ async _generateUncached(messages, parsedOptions, handledOptions, startedRunManagers) {
        const baseMessages = messages.map((messageList)=>messageList.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]));
        let runManagers;
        if (startedRunManagers !== void 0 && startedRunManagers.length === baseMessages.length) runManagers = startedRunManagers;
        else {
            const inheritableMetadata = {
                ...handledOptions.metadata,
                ...this.getLsParamsWithDefaults(parsedOptions)
            };
            const invocationParams = this._getInvocationParamsForTracing(parsedOptions);
            const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CallbackManager"].configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, inheritableMetadata, this.metadata, {
                verbose: this.verbose,
                tracerInheritableMetadata: this._filterInvocationParamsForTracing(invocationParams)
            });
            const extra = {
                options: this._getCallOptionsForTracing(parsedOptions, invocationParams),
                invocation_params: invocationParams,
                batch_size: 1
            };
            runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), baseMessages.map(_formatForTracing), handledOptions.runId, void 0, extra, void 0, void 0, handledOptions.runName);
        }
        const outputVersion = parsedOptions.outputVersion ?? this.outputVersion;
        const generations = [];
        const llmOutputs = [];
        const hasChatModelStreamEventHandler = !!runManagers?.[0].handlers.find(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callbackHandlerPrefersChatModelStreamEvents"]);
        const hasStreamingHandler = !!runManagers?.[0].handlers.find(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callbackHandlerPrefersStreaming"]);
        if (hasChatModelStreamEventHandler && !this.disableStreaming && baseMessages.length === 1 && (this._streamChatModelEvents !== BaseChatModel.prototype._streamChatModelEvents || this._streamResponseChunks !== BaseChatModel.prototype._streamResponseChunks)) try {
            let sawEvent = false;
            const runManager = runManagers?.[0];
            const events = this._streamChatModelEvents(baseMessages[0], parsedOptions);
            const message = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$stream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatModelStream"]({
                async *[Symbol.asyncIterator] () {
                    for await (const event of events){
                        parsedOptions.signal?.throwIfAborted();
                        sawEvent = true;
                        const streamEvent = event.event === "message-start" && event.id == null && runManager?.runId != null ? {
                            ...event,
                            id: `run-${runManager.runId}`
                        } : event;
                        await runManager?.handleChatModelStreamEvent(streamEvent);
                        yield streamEvent;
                    }
                }
            });
            parsedOptions.signal?.throwIfAborted();
            if (!sawEvent) throw new Error("Received empty response from chat model call.");
            if (message.id == null) {
                const runId = runManagers?.at(0)?.runId;
                if (runId != null) message._updateId(`run-${runId}`);
            }
            const generation = {
                text: message.text,
                message
            };
            generations.push([
                generation
            ]);
            const llmOutput = message.usage_metadata !== void 0 ? {
                tokenUsage: {
                    promptTokens: message.usage_metadata.input_tokens,
                    completionTokens: message.usage_metadata.output_tokens,
                    totalTokens: message.usage_metadata.total_tokens
                }
            } : void 0;
            await runManagers?.[0].handleLLMEnd({
                generations,
                llmOutput
            });
        } catch (e) {
            await runManagers?.[0].handleLLMError(e);
            throw e;
        }
        else if (hasStreamingHandler && !this.disableStreaming && baseMessages.length === 1 && this._streamResponseChunks !== BaseChatModel.prototype._streamResponseChunks) try {
            const stream = await this._streamResponseChunks(baseMessages[0], parsedOptions, runManagers?.[0]);
            let aggregated;
            for await (const chunk of stream){
                if (parsedOptions.signal?.aborted) {
                    const partialMessage = aggregated?.message;
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ModelAbortError"]("Model invocation was aborted.", partialMessage);
                }
                if (chunk.message.id == null) {
                    const runId = runManagers?.at(0)?.runId;
                    if (runId != null) chunk.message._updateId(`run-${runId}`);
                }
                if (aggregated === void 0) aggregated = chunk;
                else aggregated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["concat"])(aggregated, chunk);
            }
            if (parsedOptions.signal?.aborted) {
                const partialMessage = aggregated?.message;
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ModelAbortError"]("Model invocation was aborted.", partialMessage);
            }
            if (aggregated === void 0) throw new Error("Received empty response from chat model call.");
            if (outputVersion === "v1") aggregated.message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["castStandardMessageContent"])(aggregated.message);
            generations.push([
                aggregated
            ]);
            let llmOutput;
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AIMessageChunk"].isInstance(aggregated.message) && aggregated.message.usage_metadata !== void 0) llmOutput = {
                tokenUsage: {
                    promptTokens: aggregated.message.usage_metadata.input_tokens,
                    completionTokens: aggregated.message.usage_metadata.output_tokens,
                    totalTokens: aggregated.message.usage_metadata.total_tokens
                }
            };
            await runManagers?.[0].handleLLMEnd({
                generations,
                llmOutput
            });
        } catch (e) {
            await runManagers?.[0].handleLLMError(e);
            throw e;
        }
        else {
            const results = await Promise.allSettled(baseMessages.map(async (messageList, i)=>{
                const generateResults = await this._generate(messageList, {
                    ...parsedOptions,
                    promptIndex: i
                }, runManagers?.[i]);
                if (outputVersion === "v1") for (const generation of generateResults.generations)generation.message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["castStandardMessageContent"])(generation.message);
                return generateResults;
            }));
            await Promise.all(results.map(async (pResult, i)=>{
                if (pResult.status === "fulfilled") {
                    const result = pResult.value;
                    for (const generation of result.generations){
                        if (generation.message.id == null) {
                            const runId = runManagers?.at(0)?.runId;
                            if (runId != null) generation.message._updateId(`run-${runId}`);
                        }
                        generation.message.response_metadata = {
                            ...generation.generationInfo,
                            ...generation.message.response_metadata
                        };
                    }
                    if (result.generations.length === 1) result.generations[0].message.response_metadata = {
                        ...result.llmOutput,
                        ...result.generations[0].message.response_metadata
                    };
                    generations[i] = result.generations;
                    llmOutputs[i] = result.llmOutput;
                    return runManagers?.[i]?.handleLLMEnd({
                        generations: [
                            result.generations
                        ],
                        llmOutput: result.llmOutput
                    });
                } else {
                    await runManagers?.[i]?.handleLLMError(pResult.reason);
                    return Promise.reject(pResult.reason);
                }
            }));
        }
        const output = {
            generations,
            llmOutput: llmOutputs.length ? this._combineLLMOutput?.(...llmOutputs) : void 0
        };
        Object.defineProperty(output, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RUN_KEY"], {
            value: runManagers ? {
                runIds: runManagers?.map((manager)=>manager.runId)
            } : void 0,
            configurable: true
        });
        return output;
    }
    async _generateCached({ messages, cache, llmStringKey, parsedOptions, handledOptions }) {
        const baseMessages = messages.map((messageList)=>messageList.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]));
        const inheritableMetadata = {
            ...handledOptions.metadata,
            ...this.getLsParamsWithDefaults(parsedOptions)
        };
        const invocationParams = this._getInvocationParamsForTracing(parsedOptions);
        const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CallbackManager"].configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, inheritableMetadata, this.metadata, {
            verbose: this.verbose,
            tracerInheritableMetadata: this._filterInvocationParamsForTracing(invocationParams)
        });
        const extra = {
            options: this._getCallOptionsForTracing(parsedOptions, invocationParams),
            invocation_params: invocationParams,
            batch_size: 1
        };
        const runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), baseMessages.map(_formatForTracing), handledOptions.runId, void 0, extra, void 0, void 0, handledOptions.runName);
        const missingPromptIndices = [];
        const cachedResults = (await Promise.allSettled(baseMessages.map(async (baseMessage, index)=>{
            const prompt = BaseChatModel._convertInputToPromptValue(baseMessage).toString();
            const result = await cache.lookup(prompt, llmStringKey);
            if (result == null) missingPromptIndices.push(index);
            return result;
        }))).map((result, index)=>({
                result,
                runManager: runManagers?.[index]
            })).filter(({ result })=>result.status === "fulfilled" && result.value != null || result.status === "rejected");
        const outputVersion = parsedOptions.outputVersion ?? this.outputVersion;
        const generations = [];
        await Promise.all(cachedResults.map(async ({ result: promiseResult, runManager }, i)=>{
            if (promiseResult.status === "fulfilled") {
                const result = promiseResult.value;
                generations[i] = result.map((result)=>{
                    if ("message" in result && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBaseMessage"])(result.message) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAIMessage"])(result.message)) {
                        result.message.usage_metadata = {
                            input_tokens: 0,
                            output_tokens: 0,
                            total_tokens: 0
                        };
                        if (outputVersion === "v1") result.message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["castStandardMessageContent"])(result.message);
                    }
                    result.generationInfo = {
                        ...result.generationInfo,
                        tokenUsage: {}
                    };
                    return result;
                });
                if (result.length) await runManager?.handleLLMNewToken(result[0].text);
                return runManager?.handleLLMEnd({
                    generations: [
                        result
                    ]
                }, void 0, void 0, void 0, {
                    cached: true
                });
            } else {
                await runManager?.handleLLMError(promiseResult.reason, void 0, void 0, void 0, {
                    cached: true
                });
                return Promise.reject(promiseResult.reason);
            }
        }));
        const output = {
            generations,
            missingPromptIndices,
            startedRunManagers: runManagers
        };
        Object.defineProperty(output, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RUN_KEY"], {
            value: runManagers ? {
                runIds: runManagers?.map((manager)=>manager.runId)
            } : void 0,
            configurable: true
        });
        return output;
    }
    /**
	* Generates chat based on the input messages.
	* @param messages An array of arrays of BaseMessage instances.
	* @param options The call options or an array of stop sequences.
	* @param callbacks The callbacks for the language model.
	* @returns A Promise that resolves to an LLMResult.
	*/ async generate(messages, options, callbacks) {
        let parsedOptions;
        if (Array.isArray(options)) parsedOptions = {
            stop: options
        };
        else parsedOptions = options;
        const baseMessages = messages.map((messageList)=>messageList.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]));
        const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(parsedOptions);
        runnableConfig.callbacks = runnableConfig.callbacks ?? callbacks;
        if (!this.cache) return this._generateUncached(baseMessages, callOptions, runnableConfig);
        const { cache } = this;
        const llmStringKey = this._getSerializedCacheKeyParametersForCall(callOptions);
        const { generations, missingPromptIndices, startedRunManagers } = await this._generateCached({
            messages: baseMessages,
            cache,
            llmStringKey,
            parsedOptions: callOptions,
            handledOptions: runnableConfig
        });
        let llmOutput = {};
        if (missingPromptIndices.length > 0) {
            const results = await this._generateUncached(missingPromptIndices.map((i)=>baseMessages[i]), callOptions, runnableConfig, startedRunManagers !== void 0 ? missingPromptIndices.map((i)=>startedRunManagers?.[i]) : void 0);
            await Promise.all(results.generations.map(async (generation, index)=>{
                const promptIndex = missingPromptIndices[index];
                generations[promptIndex] = generation;
                const prompt = BaseChatModel._convertInputToPromptValue(baseMessages[promptIndex]).toString();
                return cache.update(prompt, llmStringKey, generation);
            }));
            llmOutput = results.llmOutput ?? {};
        }
        return {
            generations,
            llmOutput
        };
    }
    _getInvocationParamsForTracing(options) {
        return this.invocationParams(options);
    }
    _getCallOptionsForTracing(options, _invocationParams) {
        return options;
    }
    /**
	* Get the parameters used to invoke the model
	*/ invocationParams(_options) {
        return {};
    }
    _modelType() {
        return "base_chat_model";
    }
    /**
	* Generates a prompt based on the input prompt values.
	* @param promptValues An array of BasePromptValue instances.
	* @param options The call options or an array of stop sequences.
	* @param callbacks The callbacks for the language model.
	* @returns A Promise that resolves to an LLMResult.
	*/ async generatePrompt(promptValues, options, callbacks) {
        const promptMessages = promptValues.map((promptValue)=>promptValue.toChatMessages());
        return this.generate(promptMessages, options, callbacks);
    }
    withStructuredOutput(outputSchema, config) {
        if (typeof this.bindTools !== "function") throw new Error(`Chat model must implement ".bindTools()" to use withStructuredOutput.`);
        if (config?.strict) throw new Error(`"strict" mode is not supported for this model by default.`);
        const schema = outputSchema;
        const name = config?.name;
        const description = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSchemaDescription"])(schema) ?? "A function available to call.";
        const method = config?.method;
        const includeRaw = config?.includeRaw;
        if (method === "jsonMode") throw new Error(`Base withStructuredOutput implementation only supports "functionCalling" as a method.`);
        let functionName = name ?? "extract";
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(schema) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSerializableSchema"])(schema) && "name" in schema) functionName = schema.name;
        const asJsonSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(schema) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSerializableSchema"])(schema) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(schema) : schema;
        const tools = [
            {
                type: "function",
                function: {
                    name: functionName,
                    description,
                    parameters: asJsonSchema
                }
            }
        ];
        const llm = this.bindTools(tools);
        const outputParser = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RunnableLambda"].from((input)=>{
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AIMessageChunk"].isInstance(input)) throw new Error("Input is not an AIMessageChunk.");
            if (!input.tool_calls || input.tool_calls.length === 0) throw new Error("No tool calls found in the response.");
            const toolCall = input.tool_calls.find((tc)=>tc.name === functionName);
            if (!toolCall) throw new Error(`No tool call found with name ${functionName}.`);
            return toolCall.args;
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$structured_output$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assembleStructuredOutputPipeline"])(llm, outputParser, includeRaw, includeRaw ? "StructuredOutputRunnable" : "StructuredOutput");
    }
};
/**
* An abstract class that extends BaseChatModel and provides a simple
* implementation of _generate.
*/ var SimpleChatModel = class extends BaseChatModel {
    async _generate(messages, options, runManager) {
        const text = await this._call(messages, options, runManager);
        const message = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AIMessage"](text);
        if (typeof message.content !== "string") throw new Error("Cannot generate with a simple chat model when output is not a string.");
        return {
            generations: [
                {
                    text: message.content,
                    message
                }
            ]
        };
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/openai_completions_stream.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertOpenAICompletionsStream",
    ()=>convertOpenAICompletionsStream,
    "openai_completions_stream_exports",
    ()=>openai_completions_stream_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/compat.js [app-route] (ecmascript)");
;
;
//#region src/language_models/openai_completions_stream.ts
/**
* Converts OpenAI Chat Completions-shaped stream chunks into
* {@link ChatModelStreamEvent}s.
*
* Used by `@langchain/openai` and OpenAI-compatible providers (Groq, Mistral,
* OpenRouter, IBM watsonx, etc.) without requiring a dependency on
* `@langchain/openai`.
*
* @module
*/ var openai_completions_stream_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({
    convertOpenAICompletionsStream: ()=>convertOpenAICompletionsStream
});
/**
* Convert an async iterable of OpenAI Chat Completions-shaped stream chunks into
* LangChain `ChatModelStreamEvent`s with typed deltas.
*/ async function* convertOpenAICompletionsStream(source, options = {}) {
    const shouldStreamUsage = options.streamUsage ?? true;
    const provider = options.provider ?? "openai";
    const mapChunk = options.mapChunk;
    const blockAccumulators = /* @__PURE__ */ new Map();
    const blockKeyToIndex = /* @__PURE__ */ new Map();
    let nextBlockIndex = 0;
    let messageStarted = false;
    let usageSnapshot;
    let finishReason;
    let responseMetadata;
    let emittedProviderMetadata = false;
    const getOrCreateBlockIndex = (key, initial)=>{
        const existing = blockKeyToIndex.get(key);
        if (existing !== void 0) return {
            index: existing,
            isNew: false
        };
        const index = nextBlockIndex++;
        blockKeyToIndex.set(key, index);
        blockAccumulators.set(index, {
            ...initial
        });
        return {
            index,
            isNew: true
        };
    };
    for await (let data of source){
        if (mapChunk) data = mapChunk(data);
        if (!messageStarted) {
            messageStarted = true;
            yield {
                event: "message-start",
                id: data.id
            };
        }
        if (!emittedProviderMetadata && (data.model || data.service_tier)) {
            emittedProviderMetadata = true;
            yield {
                event: "provider",
                provider,
                name: "stream_metadata",
                payload: {
                    model: data.model,
                    service_tier: data.service_tier
                }
            };
        }
        if (data.usage && shouldStreamUsage) {
            usageSnapshot = buildUsageSnapshot(data.usage);
            yield {
                event: "usage",
                usage: usageSnapshot
            };
        }
        const groqUsage = data.x_groq?.usage;
        if (groqUsage && shouldStreamUsage) {
            usageSnapshot = buildGroqUsageSnapshot(groqUsage);
            yield {
                event: "usage",
                usage: usageSnapshot
            };
        }
        const choice = data.choices?.[0];
        if (!choice) continue;
        if (choice.finish_reason != null) {
            finishReason = mapFinishReason(choice.finish_reason);
            responseMetadata = buildResponseMetadata(data, choice);
        }
        const { delta } = choice;
        if (!delta) continue;
        const reasoningText = getReasoningDeltaText(delta);
        if (reasoningText) {
            const { index, isNew } = getOrCreateBlockIndex("reasoning", {
                type: "reasoning",
                reasoning: ""
            });
            if (isNew) yield {
                event: "content-block-start",
                index,
                content: {
                    type: "reasoning",
                    reasoning: ""
                }
            };
            const acc = blockAccumulators.get(index);
            acc.reasoning = (acc.reasoning ?? "") + reasoningText;
            yield {
                event: "content-block-delta",
                index,
                delta: {
                    type: "reasoning-delta",
                    reasoning: reasoningText
                }
            };
        }
        if (delta.content) {
            const { index, isNew } = getOrCreateBlockIndex("text", {
                type: "text",
                text: ""
            });
            if (isNew) yield {
                event: "content-block-start",
                index,
                content: {
                    type: "text",
                    text: ""
                }
            };
            const acc = blockAccumulators.get(index);
            acc.text = (acc.text ?? "") + delta.content;
            yield {
                event: "content-block-delta",
                index,
                delta: {
                    type: "text-delta",
                    text: delta.content
                }
            };
        }
        if (Array.isArray(delta.tool_calls)) for (const rawToolCall of delta.tool_calls){
            const toolIndex = rawToolCall.index ?? 0;
            const { index, isNew } = getOrCreateBlockIndex(`tool:${toolIndex}`, {
                type: "tool_call_chunk",
                id: rawToolCall.id,
                name: rawToolCall.function?.name,
                args: "",
                index: toolIndex
            });
            if (isNew) yield {
                event: "content-block-start",
                index,
                content: {
                    type: "tool_call_chunk",
                    id: rawToolCall.id,
                    name: rawToolCall.function?.name,
                    args: "",
                    index: toolIndex
                }
            };
            const acc = blockAccumulators.get(index);
            if (rawToolCall.id != null) acc.id = rawToolCall.id;
            if (rawToolCall.function?.name != null) acc.name = rawToolCall.function.name;
            const argDelta = rawToolCall.function?.arguments ?? "";
            acc.args = (acc.args ?? "") + argDelta;
            yield {
                event: "content-block-delta",
                index,
                delta: {
                    type: "block-delta",
                    fields: {
                        type: "tool_call_chunk",
                        ...acc.id != null ? {
                            id: acc.id
                        } : {},
                        ...acc.name != null ? {
                            name: acc.name
                        } : {},
                        args: acc.args
                    }
                }
            };
        }
        if (delta.audio) {
            const { index, isNew } = getOrCreateBlockIndex("audio", {
                type: "audio",
                id: delta.audio.id,
                data: "",
                mimeType: "audio/pcm",
                transcript: delta.audio.transcript ?? ""
            });
            if (isNew) yield {
                event: "content-block-start",
                index,
                content: {
                    type: "audio",
                    id: delta.audio.id,
                    data: "",
                    mimeType: "audio/pcm",
                    transcript: delta.audio.transcript ?? ""
                }
            };
            const acc = blockAccumulators.get(index);
            if (delta.audio.transcript) {
                acc.transcript = (acc.transcript ?? "") + delta.audio.transcript;
                yield {
                    event: "content-block-delta",
                    index,
                    delta: {
                        type: "block-delta",
                        fields: {
                            type: "audio",
                            transcript: acc.transcript
                        }
                    }
                };
            }
            if (delta.audio.data) {
                acc.data = (acc.data ?? "") + delta.audio.data;
                yield {
                    event: "content-block-delta",
                    index,
                    delta: {
                        type: "data-delta",
                        data: delta.audio.data,
                        encoding: "base64"
                    }
                };
            }
        }
        if (delta.function_call) yield {
            event: "provider",
            provider,
            name: "function_call",
            payload: delta.function_call
        };
        if (choice.logprobs) yield {
            event: "provider",
            provider,
            name: "logprobs",
            payload: choice.logprobs
        };
    }
    for (const [index, acc] of blockAccumulators)yield {
        event: "content-block-finish",
        index,
        content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$compat$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["finalizeContentBlock"])(acc)
    };
    yield {
        event: "message-finish",
        reason: finishReason,
        ...usageSnapshot ? {
            usage: usageSnapshot
        } : {},
        ...responseMetadata ? {
            responseMetadata
        } : {}
    };
}
function getReasoningDeltaText(delta) {
    const reasoning = delta.reasoning_content ?? delta.reasoning;
    return typeof reasoning === "string" && reasoning.length > 0 ? reasoning : void 0;
}
function buildGroqUsageSnapshot(usage) {
    return {
        input_tokens: usage.prompt_tokens ?? 0,
        output_tokens: usage.completion_tokens ?? 0,
        total_tokens: usage.total_tokens ?? 0
    };
}
function mapFinishReason(reason) {
    switch(reason){
        case "stop":
            return "stop";
        case "length":
        case "max_tokens":
            return "length";
        case "tool_calls":
        case "function_call":
            return "tool_use";
        case "content_filter":
            return "content_filter";
        default:
            return "stop";
    }
}
function buildUsageSnapshot(usage) {
    const inputTokenDetails = {
        ...usage.prompt_tokens_details?.audio_tokens != null && {
            audio: usage.prompt_tokens_details.audio_tokens
        },
        ...usage.prompt_tokens_details?.cached_tokens != null && {
            cache_read: usage.prompt_tokens_details.cached_tokens
        }
    };
    const outputTokenDetails = {
        ...usage.completion_tokens_details?.audio_tokens != null && {
            audio: usage.completion_tokens_details.audio_tokens
        },
        ...usage.completion_tokens_details?.reasoning_tokens != null && {
            reasoning: usage.completion_tokens_details.reasoning_tokens
        }
    };
    return {
        input_tokens: usage.prompt_tokens ?? 0,
        output_tokens: usage.completion_tokens ?? 0,
        total_tokens: usage.total_tokens ?? 0,
        ...Object.keys(inputTokenDetails).length > 0 && {
            input_token_details: inputTokenDetails
        },
        ...Object.keys(outputTokenDetails).length > 0 && {
            output_token_details: outputTokenDetails
        }
    };
}
function buildResponseMetadata(data, choice) {
    return {
        model_provider: "openai",
        model_name: data.model,
        system_fingerprint: data.system_fingerprint,
        service_tier: data.service_tier,
        finish_reason: choice.finish_reason,
        ...data.usage ? {
            usage: data.usage
        } : {}
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/event.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "event_exports",
    ()=>event_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
;
//#region src/language_models/event.ts
var event_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/llms.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseLLM",
    ()=>BaseLLM,
    "LLM",
    ()=>LLM,
    "llms_exports",
    ()=>llms_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/manager.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/outputs.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/base.js [app-route] (ecmascript)");
;
;
;
;
;
;
//#region src/language_models/llms.ts
var llms_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseLLM: ()=>BaseLLM,
    LLM: ()=>LLM
});
/**
* LLM Wrapper. Takes in a prompt (or prompts) and returns a string.
*/ var BaseLLM = class BaseLLM extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseLanguageModel"] {
    lc_namespace = [
        "langchain",
        "llms",
        this._llmType()
    ];
    /**
	* This method takes an input and options, and returns a string. It
	* converts the input to a prompt value and generates a result based on
	* the prompt.
	* @param input Input for the LLM.
	* @param options Options for the LLM call.
	* @returns A string result based on the prompt.
	*/ async invoke(input, options) {
        const promptValue = BaseLLM._convertInputToPromptValue(input);
        return (await this.generatePrompt([
            promptValue
        ], options, options?.callbacks)).generations[0][0].text;
    }
    async *_streamResponseChunks(_input, _options, _runManager) {
        throw new Error("Not implemented.");
    }
    _separateRunnableConfigFromCallOptionsCompat(options) {
        const [runnableConfig, callOptions] = super._separateRunnableConfigFromCallOptions(options);
        callOptions.signal = runnableConfig.signal;
        return [
            runnableConfig,
            callOptions
        ];
    }
    async *_streamIterator(input, options) {
        if (this._streamResponseChunks === BaseLLM.prototype._streamResponseChunks) yield this.invoke(input, options);
        else {
            const prompt = BaseLLM._convertInputToPromptValue(input);
            const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(options);
            const invocationParams = this.invocationParams(callOptions);
            const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CallbackManager"].configure(runnableConfig.callbacks, this.callbacks, runnableConfig.tags, this.tags, runnableConfig.metadata, this.metadata, {
                verbose: this.verbose,
                tracerInheritableMetadata: this._filterInvocationParamsForTracing(invocationParams)
            });
            const extra = {
                options: callOptions,
                invocation_params: invocationParams,
                batch_size: 1
            };
            const runManagers = await callbackManager_?.handleLLMStart(this.toJSON(), [
                prompt.toString()
            ], runnableConfig.runId, void 0, extra, void 0, void 0, runnableConfig.runName);
            let generation = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GenerationChunk"]({
                text: ""
            });
            try {
                for await (const chunk of this._streamResponseChunks(prompt.toString(), callOptions, runManagers?.[0])){
                    if (!generation) generation = chunk;
                    else generation = generation.concat(chunk);
                    if (typeof chunk.text === "string") yield chunk.text;
                }
            } catch (err) {
                await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMError(err)));
                throw err;
            }
            await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMEnd({
                    generations: [
                        [
                            generation
                        ]
                    ]
                })));
        }
    }
    /**
	* This method takes prompt values, options, and callbacks, and generates
	* a result based on the prompts.
	* @param promptValues Prompt values for the LLM.
	* @param options Options for the LLM call.
	* @param callbacks Callbacks for the LLM call.
	* @returns An LLMResult based on the prompts.
	*/ async generatePrompt(promptValues, options, callbacks) {
        const prompts = promptValues.map((promptValue)=>promptValue.toString());
        return this.generate(prompts, options, callbacks);
    }
    /**
	* Get the parameters used to invoke the model
	*/ invocationParams(_options) {
        return {};
    }
    _flattenLLMResult(llmResult) {
        const llmResults = [];
        for(let i = 0; i < llmResult.generations.length; i += 1){
            const genList = llmResult.generations[i];
            if (i === 0) llmResults.push({
                generations: [
                    genList
                ],
                llmOutput: llmResult.llmOutput
            });
            else {
                const llmOutput = llmResult.llmOutput ? {
                    ...llmResult.llmOutput,
                    tokenUsage: {}
                } : void 0;
                llmResults.push({
                    generations: [
                        genList
                    ],
                    llmOutput
                });
            }
        }
        return llmResults;
    }
    /** @ignore */ async _generateUncached(prompts, parsedOptions, handledOptions, startedRunManagers) {
        let runManagers;
        if (startedRunManagers !== void 0 && startedRunManagers.length === prompts.length) runManagers = startedRunManagers;
        else {
            const invocationParams = this.invocationParams(parsedOptions);
            const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CallbackManager"].configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, handledOptions.metadata, this.metadata, {
                verbose: this.verbose,
                tracerInheritableMetadata: this._filterInvocationParamsForTracing(invocationParams)
            });
            const extra = {
                options: parsedOptions,
                invocation_params: invocationParams,
                batch_size: prompts.length
            };
            runManagers = await callbackManager_?.handleLLMStart(this.toJSON(), prompts, handledOptions.runId, void 0, extra, void 0, void 0, handledOptions?.runName);
        }
        const hasStreamingHandler = !!runManagers?.[0].handlers.find(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callbackHandlerPrefersStreaming"]);
        let output;
        if (hasStreamingHandler && prompts.length === 1 && this._streamResponseChunks !== BaseLLM.prototype._streamResponseChunks) try {
            const stream = await this._streamResponseChunks(prompts[0], parsedOptions, runManagers?.[0]);
            let aggregated;
            for await (const chunk of stream)if (aggregated === void 0) aggregated = chunk;
            else aggregated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["concat"])(aggregated, chunk);
            if (aggregated === void 0) throw new Error("Received empty response from chat model call.");
            output = {
                generations: [
                    [
                        aggregated
                    ]
                ],
                llmOutput: {}
            };
            await runManagers?.[0].handleLLMEnd(output);
        } catch (e) {
            await runManagers?.[0].handleLLMError(e);
            throw e;
        }
        else {
            try {
                output = await this._generate(prompts, parsedOptions, runManagers?.[0]);
            } catch (err) {
                await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMError(err)));
                throw err;
            }
            const flattenedOutputs = this._flattenLLMResult(output);
            await Promise.all((runManagers ?? []).map((runManager, i)=>runManager?.handleLLMEnd(flattenedOutputs[i])));
        }
        const runIds = runManagers?.map((manager)=>manager.runId) || void 0;
        Object.defineProperty(output, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RUN_KEY"], {
            value: runIds ? {
                runIds
            } : void 0,
            configurable: true
        });
        return output;
    }
    async _generateCached({ prompts, cache, llmStringKey, parsedOptions, handledOptions, runId }) {
        const invocationParams = this.invocationParams(parsedOptions);
        const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CallbackManager"].configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, handledOptions.metadata, this.metadata, {
            verbose: this.verbose,
            tracerInheritableMetadata: this._filterInvocationParamsForTracing(invocationParams)
        });
        const extra = {
            options: parsedOptions,
            invocation_params: invocationParams,
            batch_size: prompts.length
        };
        const runManagers = await callbackManager_?.handleLLMStart(this.toJSON(), prompts, runId, void 0, extra, void 0, void 0, handledOptions?.runName);
        const missingPromptIndices = [];
        const cachedResults = (await Promise.allSettled(prompts.map(async (prompt, index)=>{
            const result = await cache.lookup(prompt, llmStringKey);
            if (result == null) missingPromptIndices.push(index);
            return result;
        }))).map((result, index)=>({
                result,
                runManager: runManagers?.[index]
            })).filter(({ result })=>result.status === "fulfilled" && result.value != null || result.status === "rejected");
        const generations = [];
        await Promise.all(cachedResults.map(async ({ result: promiseResult, runManager }, i)=>{
            if (promiseResult.status === "fulfilled") {
                const result = promiseResult.value;
                generations[i] = result.map((result)=>{
                    result.generationInfo = {
                        ...result.generationInfo,
                        tokenUsage: {}
                    };
                    return result;
                });
                if (result.length) await runManager?.handleLLMNewToken(result[0].text);
                return runManager?.handleLLMEnd({
                    generations: [
                        result
                    ]
                }, void 0, void 0, void 0, {
                    cached: true
                });
            } else {
                await runManager?.handleLLMError(promiseResult.reason, void 0, void 0, void 0, {
                    cached: true
                });
                return Promise.reject(promiseResult.reason);
            }
        }));
        const output = {
            generations,
            missingPromptIndices,
            startedRunManagers: runManagers
        };
        Object.defineProperty(output, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RUN_KEY"], {
            value: runManagers ? {
                runIds: runManagers?.map((manager)=>manager.runId)
            } : void 0,
            configurable: true
        });
        return output;
    }
    /**
	* Run the LLM on the given prompts and input, handling caching.
	*/ async generate(prompts, options, callbacks) {
        if (!Array.isArray(prompts)) throw new Error("Argument 'prompts' is expected to be a string[]");
        let parsedOptions;
        if (Array.isArray(options)) parsedOptions = {
            stop: options
        };
        else parsedOptions = options;
        const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(parsedOptions);
        runnableConfig.callbacks = runnableConfig.callbacks ?? callbacks;
        if (!this.cache) return this._generateUncached(prompts, callOptions, runnableConfig);
        const { cache } = this;
        const llmStringKey = this._getSerializedCacheKeyParametersForCall(callOptions);
        const { generations, missingPromptIndices, startedRunManagers } = await this._generateCached({
            prompts,
            cache,
            llmStringKey,
            parsedOptions: callOptions,
            handledOptions: runnableConfig,
            runId: runnableConfig.runId
        });
        let llmOutput = {};
        if (missingPromptIndices.length > 0) {
            const results = await this._generateUncached(missingPromptIndices.map((i)=>prompts[i]), callOptions, runnableConfig, startedRunManagers !== void 0 ? missingPromptIndices.map((i)=>startedRunManagers?.[i]) : void 0);
            await Promise.all(results.generations.map(async (generation, index)=>{
                const promptIndex = missingPromptIndices[index];
                generations[promptIndex] = generation;
                return cache.update(prompts[promptIndex], llmStringKey, generation);
            }));
            llmOutput = results.llmOutput ?? {};
        }
        return {
            generations,
            llmOutput
        };
    }
    /**
	* Get the identifying parameters of the LLM.
	*/ _identifyingParams() {
        return {};
    }
    _modelType() {
        return "base_llm";
    }
};
/**
* LLM class that provides a simpler interface to subclass than {@link BaseLLM}.
*
* Requires only implementing a simpler {@link _call} method instead of {@link _generate}.
*
* @augments BaseLLM
*/ var LLM = class extends BaseLLM {
    async _generate(prompts, options, runManager) {
        return {
            generations: await Promise.all(prompts.map((prompt, promptIndex)=>this._call(prompt, {
                    ...options,
                    promptIndex
                }, runManager).then((text)=>[
                        {
                            text
                        }
                    ])))
        };
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/profile.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "profile_exports",
    ()=>profile_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-route] (ecmascript)");
;
//#region src/language_models/profile.ts
var profile_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__exportAll"])({});
;
}),
];

//# sourceMappingURL=09_2_%40langchain_core_dist_language_models_04m1f3o._.js.map