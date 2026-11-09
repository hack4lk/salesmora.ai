module.exports = [
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/data.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToOpenAIImageBlock",
    ()=>convertToOpenAIImageBlock,
    "convertToProviderContentBlock",
    ()=>convertToProviderContentBlock,
    "isBase64ContentBlock",
    ()=>isBase64ContentBlock,
    "isDataContentBlock",
    ()=>isDataContentBlock,
    "isIDContentBlock",
    ()=>isIDContentBlock,
    "isPlainTextContentBlock",
    ()=>isPlainTextContentBlock,
    "isURLContentBlock",
    ()=>isURLContentBlock,
    "parseBase64DataUrl",
    ()=>parseBase64DataUrl,
    "parseMimeType",
    ()=>parseMimeType
]);
//#region src/messages/content/data.ts
/**
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function isDataContentBlock(content_block) {
    return typeof content_block === "object" && content_block !== null && "type" in content_block && typeof content_block.type === "string" && "source_type" in content_block && (content_block.source_type === "url" || content_block.source_type === "base64" || content_block.source_type === "text" || content_block.source_type === "id");
}
/**
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function isURLContentBlock(content_block) {
    return isDataContentBlock(content_block) && content_block.source_type === "url" && "url" in content_block && typeof content_block.url === "string";
}
/**
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function isBase64ContentBlock(content_block) {
    return isDataContentBlock(content_block) && content_block.source_type === "base64" && "data" in content_block && typeof content_block.data === "string";
}
/**
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function isPlainTextContentBlock(content_block) {
    return isDataContentBlock(content_block) && content_block.source_type === "text" && "text" in content_block && typeof content_block.text === "string";
}
/**
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function isIDContentBlock(content_block) {
    return isDataContentBlock(content_block) && content_block.source_type === "id" && "id" in content_block && typeof content_block.id === "string";
}
/**
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function convertToOpenAIImageBlock(content_block) {
    if (isDataContentBlock(content_block)) {
        if (content_block.source_type === "url") return {
            type: "image_url",
            image_url: {
                url: content_block.url
            }
        };
        if (content_block.source_type === "base64") {
            if (!content_block.mime_type) throw new Error("mime_type key is required for base64 data.");
            return {
                type: "image_url",
                image_url: {
                    url: `data:${content_block.mime_type};base64,${content_block.data}`
                }
            };
        }
    }
    throw new Error("Unsupported source type. Only 'url' and 'base64' are supported.");
}
/**
* Utility function for ChatModelProviders. Parses a mime type into a type, subtype, and parameters.
*
* @param mime_type - The mime type to parse.
* @returns An object containing the type, subtype, and parameters.
*
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function parseMimeType(mime_type) {
    const parts = mime_type.split(";")[0].split("/");
    if (parts.length !== 2) throw new Error(`Invalid mime type: "${mime_type}" - does not match type/subtype format.`);
    const type = parts[0].trim();
    const subtype = parts[1].trim();
    if (type === "" || subtype === "") throw new Error(`Invalid mime type: "${mime_type}" - type or subtype is empty.`);
    const parameters = {};
    for (const parameterKvp of mime_type.split(";").slice(1)){
        const parameterParts = parameterKvp.split("=");
        if (parameterParts.length !== 2) throw new Error(`Invalid parameter syntax in mime type: "${mime_type}".`);
        const key = parameterParts[0].trim();
        const value = parameterParts[1].trim();
        if (key === "") throw new Error(`Invalid parameter syntax in mime type: "${mime_type}".`);
        parameters[key] = value;
    }
    return {
        type,
        subtype,
        parameters
    };
}
/**
* Utility function for ChatModelProviders. Parses a base64 data URL into a typed array or string.
*
* @param dataUrl - The base64 data URL to parse.
* @param asTypedArray - Whether to return the data as a typed array.
* @returns The parsed data and mime type, or undefined if the data URL is invalid.
*
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function parseBase64DataUrl({ dataUrl: data_url, asTypedArray = false }) {
    const formatMatch = data_url.match(/^data:(\w+\/\w+);base64,([A-Za-z0-9+/]+=*)$/);
    let mime_type;
    if (formatMatch) {
        mime_type = formatMatch[1].toLowerCase();
        const data = asTypedArray ? Uint8Array.from(atob(formatMatch[2]), (c)=>c.charCodeAt(0)) : formatMatch[2];
        return {
            mime_type,
            data
        };
    }
}
/**
* Convert from a standard data content block to a provider's proprietary data content block format.
*
* Don't override this method. Instead, override the more specific conversion methods and use this
* method unmodified.
*
* @param block - The standard data content block to convert.
* @returns The provider data content block.
* @throws An error if the standard data content block type is not supported.
*
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
*/ function convertToProviderContentBlock(block, converter) {
    if (block.type === "text") {
        if (!converter.fromStandardTextBlock) throw new Error(`Converter for ${converter.providerName} does not implement \`fromStandardTextBlock\` method.`);
        return converter.fromStandardTextBlock(block);
    }
    if (block.type === "image") {
        if (!converter.fromStandardImageBlock) throw new Error(`Converter for ${converter.providerName} does not implement \`fromStandardImageBlock\` method.`);
        return converter.fromStandardImageBlock(block);
    }
    if (block.type === "audio") {
        if (!converter.fromStandardAudioBlock) throw new Error(`Converter for ${converter.providerName} does not implement \`fromStandardAudioBlock\` method.`);
        return converter.fromStandardAudioBlock(block);
    }
    if (block.type === "file") {
        if (!converter.fromStandardFileBlock) throw new Error(`Converter for ${converter.providerName} does not implement \`fromStandardFileBlock\` method.`);
        return converter.fromStandardFileBlock(block);
    }
    throw new Error(`Unable to convert content block type '${block.type}' to provider-specific format: not recognized.`);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_isArray",
    ()=>_isArray,
    "_isBytesArray",
    ()=>_isBytesArray,
    "_isContentBlock",
    ()=>_isContentBlock,
    "_isNumber",
    ()=>_isNumber,
    "_isObject",
    ()=>_isObject,
    "_isString",
    ()=>_isString,
    "iife",
    ()=>iife,
    "safeParseJson",
    ()=>safeParseJson
]);
//#region src/messages/block_translators/utils.ts
function _isContentBlock(block, type) {
    return _isObject(block) && block.type === type;
}
function _isObject(value) {
    return typeof value === "object" && value !== null;
}
function _isArray(value) {
    return Array.isArray(value);
}
function _isString(value) {
    return typeof value === "string";
}
function _isNumber(value) {
    return typeof value === "number";
}
function _isBytesArray(value) {
    return value instanceof Uint8Array;
}
function safeParseJson(value) {
    try {
        return JSON.parse(value);
    } catch  {
        return;
    }
}
const iife = (fn)=>fn();
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/anthropic.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatAnthropicTranslator",
    ()=>ChatAnthropicTranslator,
    "convertToV1FromAnthropicContentBlock",
    ()=>convertToV1FromAnthropicContentBlock,
    "convertToV1FromAnthropicInput",
    ()=>convertToV1FromAnthropicInput,
    "convertToV1FromAnthropicMessage",
    ()=>convertToV1FromAnthropicMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/anthropic.ts
function convertAnthropicAnnotation(citation) {
    if (citation.type === "char_location" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.document_title) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(citation.start_char_index) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(citation.end_char_index) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.cited_text)) {
        const { document_title, start_char_index, end_char_index, cited_text, ...rest } = citation;
        return {
            ...rest,
            type: "citation",
            source: "char",
            title: document_title ?? void 0,
            startIndex: start_char_index,
            endIndex: end_char_index,
            citedText: cited_text
        };
    }
    if (citation.type === "page_location" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.document_title) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(citation.start_page_number) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(citation.end_page_number) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.cited_text)) {
        const { document_title, start_page_number, end_page_number, cited_text, ...rest } = citation;
        return {
            ...rest,
            type: "citation",
            source: "page",
            title: document_title ?? void 0,
            startIndex: start_page_number,
            endIndex: end_page_number,
            citedText: cited_text
        };
    }
    if (citation.type === "content_block_location" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.document_title) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(citation.start_block_index) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(citation.end_block_index) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.cited_text)) {
        const { document_title, start_block_index, end_block_index, cited_text, ...rest } = citation;
        return {
            ...rest,
            type: "citation",
            source: "block",
            title: document_title ?? void 0,
            startIndex: start_block_index,
            endIndex: end_block_index,
            citedText: cited_text
        };
    }
    if (citation.type === "web_search_result_location" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.url) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.title) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.encrypted_index) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.cited_text)) {
        const { url, title, encrypted_index, cited_text, ...rest } = citation;
        return {
            ...rest,
            type: "citation",
            source: "url",
            url,
            title,
            startIndex: Number(encrypted_index),
            endIndex: Number(encrypted_index),
            citedText: cited_text
        };
    }
    if (citation.type === "search_result_location" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.source) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.title) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(citation.start_block_index) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(citation.end_block_index) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(citation.cited_text)) {
        const { source, title, start_block_index, end_block_index, cited_text, ...rest } = citation;
        return {
            ...rest,
            type: "citation",
            source: "search",
            url: source,
            title: title ?? void 0,
            startIndex: start_block_index,
            endIndex: end_block_index,
            citedText: cited_text
        };
    }
}
/**
* Converts an Anthropic content block to a standard V1 content block.
*
* This function handles the conversion of Anthropic-specific content blocks
* (document and image blocks) to the standardized V1 format. It supports
* various source types including base64 data, URLs, file IDs, and text data.
*
* @param block - The Anthropic content block to convert
* @returns A standard V1 content block if conversion is successful, undefined otherwise
*
* @example
* ```typescript
* const anthropicBlock = {
*   type: "image",
*   source: {
*     type: "base64",
*     media_type: "image/png",
*     data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
*   }
* };
*
* const standardBlock = convertToV1FromAnthropicContentBlock(anthropicBlock);
* // Returns: { type: "image", mimeType: "image/png", data: "..." }
* ```
*/ function convertToV1FromAnthropicContentBlock(block) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "document") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.source) && "type" in block.source) {
        if (block.source.type === "base64" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.media_type) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.data)) return {
            type: "file",
            mimeType: block.source.media_type,
            data: block.source.data
        };
        else if (block.source.type === "url" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.url)) return {
            type: "file",
            url: block.source.url
        };
        else if (block.source.type === "file" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.file_id)) return {
            type: "file",
            fileId: block.source.file_id
        };
        else if (block.source.type === "text" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.data)) return {
            type: "file",
            mimeType: String(block.source.media_type ?? "text/plain"),
            data: block.source.data
        };
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "image") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.source) && "type" in block.source) {
        if (block.source.type === "base64" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.media_type) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.data)) return {
            type: "image",
            mimeType: block.source.media_type,
            data: block.source.data
        };
        else if (block.source.type === "url" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.url)) return {
            type: "image",
            url: block.source.url
        };
        else if (block.source.type === "file" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.source.file_id)) return {
            type: "image",
            fileId: block.source.file_id
        };
    }
}
/**
* Converts an array of content blocks from Anthropic format to v1 standard format.
*
* This function processes each content block in the input array, attempting to convert
* Anthropic-specific block formats (like image blocks with source objects, document blocks, etc.)
* to the standardized v1 content block format. If a block cannot be converted, it is
* passed through as-is with a type assertion to ContentBlock.Standard.
*
* @param content - Array of content blocks in Anthropic format to be converted
* @returns Array of content blocks in v1 standard format
*/ function convertToV1FromAnthropicInput(content) {
    function* iterateContent() {
        for (const block of content){
            const stdBlock = convertToV1FromAnthropicContentBlock(block);
            if (stdBlock) yield stdBlock;
            else yield block;
        }
    }
    return Array.from(iterateContent());
}
/**
* Converts an Anthropic AI message to an array of v1 standard content blocks.
*
* This function processes an AI message containing Anthropic-specific content blocks
* and converts them to the standardized v1 content block format.
*
* @param message - The AI message containing Anthropic-formatted content blocks
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const message = new AIMessage([
*   { type: "text", text: "Hello world" },
*   { type: "thinking", text: "Let me think about this..." },
*   { type: "tool_use", id: "123", name: "calculator", input: { a: 1, b: 2 } }
* ]);
*
* const standardBlocks = convertToV1FromAnthropicMessage(message);
* // Returns:
* // [
* //   { type: "text", text: "Hello world" },
* //   { type: "reasoning", reasoning: "Let me think about this..." },
* //   { type: "tool_call", id: "123", name: "calculator", args: { a: 1, b: 2 } }
* // ]
* ```
*/ function convertToV1FromAnthropicMessage(message) {
    function* iterateContent() {
        const content = typeof message.content === "string" ? [
            {
                type: "text",
                text: message.content
            }
        ] : message.content;
        for (const block of content){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "text") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) {
                const { text, citations, ...rest } = block;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(citations) && citations.length) {
                    const _citations = citations.reduce((acc, item)=>{
                        const citation = convertAnthropicAnnotation(item);
                        if (citation) return [
                            ...acc,
                            citation
                        ];
                        return acc;
                    }, []);
                    yield {
                        ...rest,
                        type: "text",
                        text,
                        annotations: _citations
                    };
                    continue;
                } else {
                    yield {
                        ...rest,
                        type: "text",
                        text
                    };
                    continue;
                }
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "thinking") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.thinking)) {
                const { thinking, signature, ...rest } = block;
                yield {
                    ...rest,
                    type: "reasoning",
                    reasoning: thinking,
                    signature
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "redacted_thinking")) {
                yield {
                    type: "non_standard",
                    value: block
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "tool_use") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.name) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.id)) {
                yield {
                    type: "tool_call",
                    id: block.id,
                    name: block.name,
                    args: block.input
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "input_json_delta")) {
                if (_isAIMessageChunk(message) && message.tool_call_chunks?.length) {
                    const tool_call_chunk = message.tool_call_chunks[0];
                    yield {
                        type: "tool_call_chunk",
                        id: tool_call_chunk.id,
                        name: tool_call_chunk.name,
                        args: tool_call_chunk.args,
                        index: tool_call_chunk.index
                    };
                    continue;
                }
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "server_tool_use") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.name) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.id)) {
                const { name, id } = block;
                if (name === "web_search") {
                    yield {
                        id,
                        type: "server_tool_call",
                        name: "web_search",
                        args: {
                            query: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"])(()=>{
                                if (typeof block.input === "string") return block.input;
                                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.input) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.input.query)) return block.input.query;
                                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.partial_json)) {
                                    const json = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeParseJson"])(block.partial_json);
                                    if (json?.query) return json.query;
                                }
                                return "";
                            })
                        }
                    };
                    continue;
                } else if (block.name === "code_execution") {
                    yield {
                        id,
                        type: "server_tool_call",
                        name: "code_execution",
                        args: {
                            code: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"])(()=>{
                                if (typeof block.input === "string") return block.input;
                                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.input) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.input.code)) return block.input.code;
                                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.partial_json)) {
                                    const json = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeParseJson"])(block.partial_json);
                                    if (json?.code) return json.code;
                                }
                                return "";
                            })
                        }
                    };
                    continue;
                }
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "web_search_tool_result") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.tool_use_id) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(block.content)) {
                const { content, tool_use_id } = block;
                yield {
                    type: "server_tool_call_result",
                    name: "web_search",
                    toolCallId: tool_use_id,
                    status: "success",
                    output: {
                        urls: content.reduce((acc, content)=>{
                            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(content, "web_search_result")) return [
                                ...acc,
                                content.url
                            ];
                            return acc;
                        }, [])
                    }
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "code_execution_tool_result") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.tool_use_id) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.content)) {
                yield {
                    type: "server_tool_call_result",
                    name: "code_execution",
                    toolCallId: block.tool_use_id,
                    status: "success",
                    output: block.content
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "mcp_tool_use")) {
                yield {
                    id: block.id,
                    type: "server_tool_call",
                    name: "mcp_tool_use",
                    args: block.input
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "mcp_tool_result") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.tool_use_id) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.content)) {
                yield {
                    type: "server_tool_call_result",
                    name: "mcp_tool_use",
                    toolCallId: block.tool_use_id,
                    status: "success",
                    output: block.content
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "container_upload")) {
                yield {
                    type: "server_tool_call",
                    name: "container_upload",
                    args: block.input
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "search_result")) {
                yield {
                    id: block.id,
                    type: "non_standard",
                    value: block
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "tool_result")) {
                yield {
                    id: block.id,
                    type: "non_standard",
                    value: block
                };
                continue;
            } else {
                const stdBlock = convertToV1FromAnthropicContentBlock(block);
                if (stdBlock) {
                    yield stdBlock;
                    continue;
                }
            }
            yield {
                type: "non_standard",
                value: block
            };
        }
    }
    return Array.from(iterateContent());
}
const ChatAnthropicTranslator = {
    translateContent: convertToV1FromAnthropicMessage,
    translateContentChunk: convertToV1FromAnthropicMessage
};
function _isAIMessageChunk(message) {
    return typeof message?._getType === "function" && typeof message.concat === "function" && message._getType() === "ai";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/data.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToV1FromDataContent",
    ()=>convertToV1FromDataContent,
    "convertToV1FromDataContentBlock",
    ()=>convertToV1FromDataContentBlock,
    "convertToV1FromOpenAIDataBlock",
    ()=>convertToV1FromOpenAIDataBlock,
    "isOpenAIDataBlock",
    ()=>isOpenAIDataBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/data.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
;
//#region src/messages/block_translators/data.ts
function convertToV1FromDataContentBlock(block) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isURLContentBlock"])(block)) return {
        type: block.type,
        mimeType: block.mime_type,
        url: block.url,
        metadata: block.metadata
    };
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBase64ContentBlock"])(block)) return {
        type: block.type,
        mimeType: block.mime_type ?? "application/octet-stream",
        data: block.data,
        metadata: block.metadata
    };
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isIDContentBlock"])(block)) return {
        type: block.type,
        mimeType: block.mime_type,
        fileId: block.id,
        metadata: block.metadata
    };
    return block;
}
function convertToV1FromDataContent(content) {
    return content.map(convertToV1FromDataContentBlock);
}
function isOpenAIDataBlock(block) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "image_url") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.image_url)) return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "input_audio") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.input_audio)) return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "file") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.file)) return true;
    return false;
}
function convertToV1FromOpenAIDataBlock(block) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "image_url") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.image_url) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.image_url.url)) {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseBase64DataUrl"])({
            dataUrl: block.image_url.url
        });
        if (parsed) return {
            type: "image",
            mimeType: parsed.mime_type,
            data: parsed.data
        };
        else return {
            type: "image",
            url: block.image_url.url
        };
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "input_audio") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.input_audio) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.input_audio.data) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.input_audio.format)) return {
        type: "audio",
        data: block.input_audio.data,
        mimeType: `audio/${block.input_audio.format}`
    };
    else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "file") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.file) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.file.data)) {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseBase64DataUrl"])({
            dataUrl: block.file.data
        });
        if (parsed) return {
            type: "file",
            data: parsed.data,
            mimeType: parsed.mime_type
        };
        else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.file.file_id)) return {
            type: "file",
            fileId: block.file.file_id
        };
    }
    return block;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/openai.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatOpenAITranslator",
    ()=>ChatOpenAITranslator,
    "convertToV1FromChatCompletions",
    ()=>convertToV1FromChatCompletions,
    "convertToV1FromChatCompletionsChunk",
    ()=>convertToV1FromChatCompletionsChunk,
    "convertToV1FromChatCompletionsInput",
    ()=>convertToV1FromChatCompletionsInput,
    "convertToV1FromResponses",
    ()=>convertToV1FromResponses,
    "convertToV1FromResponsesChunk",
    ()=>convertToV1FromResponsesChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/data.js [instrumentation] (ecmascript)");
;
;
//#region src/messages/block_translators/openai.ts
/**
* Converts a ChatOpenAICompletions message to an array of v1 standard content blocks.
*
* This function processes an AI message from ChatOpenAICompletions API format
* and converts it to the standardized v1 content block format. It handles both
* string content and structured content blocks, as well as tool calls.
*
* @param message - The AI message containing ChatOpenAICompletions formatted content
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const message = new AIMessage("Hello world");
* const standardBlocks = convertToV1FromChatCompletions(message);
* // Returns: [{ type: "text", text: "Hello world" }]
* ```
*
* @example
* ```typescript
* const message = new AIMessage([
*   { type: "text", text: "Hello" },
*   { type: "image_url", image_url: { url: "https://example.com/image.png" } }
* ]);
* message.tool_calls = [
*   { id: "call_123", name: "calculator", args: { a: 1, b: 2 } }
* ];
*
* const standardBlocks = convertToV1FromChatCompletions(message);
* // Returns:
* // [
* //   { type: "text", text: "Hello" },
* //   { type: "image", url: "https://example.com/image.png" },
* //   { type: "tool_call", id: "call_123", name: "calculator", args: { a: 1, b: 2 } }
* // ]
* ```
*/ function convertToV1FromChatCompletions(message) {
    const blocks = [];
    if (typeof message.content === "string") {
        if (message.content.length > 0) blocks.push({
            type: "text",
            text: message.content
        });
    } else blocks.push(...convertToV1FromChatCompletionsInput(message.content));
    for (const toolCall of message.tool_calls ?? [])blocks.push({
        type: "tool_call",
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args
    });
    return blocks;
}
/**
* Converts a ChatOpenAICompletions message chunk to an array of v1 standard content blocks.
*
* This function processes an AI message chunk from OpenAI's chat completions API and converts
* it to the standardized v1 content block format. It handles both string and array content,
* as well as tool calls that may be present in the chunk.
*
* @param message - The AI message chunk containing OpenAI-formatted content blocks
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const chunk = new AIMessage("Hello");
* const standardBlocks = convertToV1FromChatCompletionsChunk(chunk);
* // Returns: [{ type: "text", text: "Hello" }]
* ```
*
* @example
* ```typescript
* const chunk = new AIMessage([
*   { type: "text", text: "Processing..." }
* ]);
* chunk.tool_calls = [
*   { id: "call_456", name: "search", args: { query: "test" } }
* ];
*
* const standardBlocks = convertToV1FromChatCompletionsChunk(chunk);
* // Returns:
* // [
* //   { type: "text", text: "Processing..." },
* //   { type: "tool_call", id: "call_456", name: "search", args: { query: "test" } }
* // ]
* ```
*/ function convertToV1FromChatCompletionsChunk(message) {
    const blocks = [];
    if (typeof message.content === "string") {
        if (message.content.length > 0) blocks.push({
            type: "text",
            text: message.content
        });
    } else blocks.push(...convertToV1FromChatCompletionsInput(message.content));
    for (const toolCall of message.tool_calls ?? [])blocks.push({
        type: "tool_call",
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args
    });
    return blocks;
}
/**
* Converts an array of ChatOpenAICompletions content blocks to v1 standard content blocks.
*
* This function processes content blocks from OpenAI's Chat Completions API format
* and converts them to the standardized v1 content block format. It handles both
* OpenAI-specific data blocks (which require conversion) and standard blocks
* (which are passed through with type assertion).
*
* @param blocks - Array of content blocks in ChatOpenAICompletions format
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const openaiBlocks = [
*   { type: "text", text: "Hello world" },
*   { type: "image_url", image_url: { url: "https://example.com/image.png" } }
* ];
*
* const standardBlocks = convertToV1FromChatCompletionsInput(openaiBlocks);
* // Returns:
* // [
* //   { type: "text", text: "Hello world" },
* //   { type: "image", url: "https://example.com/image.png" }
* // ]
* ```
*/ function convertToV1FromChatCompletionsInput(blocks) {
    const convertedBlocks = [];
    for (const block of blocks)if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isOpenAIDataBlock"])(block)) convertedBlocks.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToV1FromOpenAIDataBlock"])(block));
    else convertedBlocks.push(block);
    return convertedBlocks;
}
function convertResponsesAnnotation(annotation) {
    if (annotation.type === "url_citation") {
        const { url, title, start_index, end_index } = annotation;
        return {
            type: "citation",
            url,
            title,
            startIndex: start_index,
            endIndex: end_index
        };
    }
    if (annotation.type === "file_citation") {
        const { file_id, filename, index } = annotation;
        return {
            type: "citation",
            title: filename,
            startIndex: index,
            endIndex: index,
            fileId: file_id
        };
    }
    return annotation;
}
/** Builds a reasoning content block, including id/encrypted_content when present. */ function mapReasoningItemToV1(item) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(item.summary)) return void 0;
    return {
        type: "reasoning",
        reasoning: item.summary.reduce((acc, part)=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(part) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(part.text)) return `${acc}${part.text}`;
            return acc;
        }, ""),
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(item.id) ? {
            id: item.id
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(item.encrypted_content) ? {
            encrypted_content: item.encrypted_content
        } : {}
    };
}
function* mapToolOutputToV1Blocks(toolOutput) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "web_search_call")) {
        const webSearchArgs = {};
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(toolOutput.action) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.action.query)) webSearchArgs.query = toolOutput.action.query;
        yield {
            id: toolOutput.id,
            type: "server_tool_call",
            name: "web_search",
            args: webSearchArgs
        };
        if (toolOutput.status === "completed" || toolOutput.status === "failed") {
            const output = {};
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(toolOutput.action)) output.action = toolOutput.action;
            yield {
                type: "server_tool_call_result",
                toolCallId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.id) ? toolOutput.id : "",
                status: toolOutput.status === "completed" ? "success" : "error",
                output
            };
        }
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "file_search_call")) {
        yield {
            id: toolOutput.id,
            type: "server_tool_call",
            name: "file_search",
            args: {
                queries: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(toolOutput.queries) ? toolOutput.queries : []
            }
        };
        if (toolOutput.status === "completed" || toolOutput.status === "failed") yield {
            type: "server_tool_call_result",
            toolCallId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.id) ? toolOutput.id : "",
            status: toolOutput.status === "completed" ? "success" : "error",
            output: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(toolOutput.results) ? {
                results: toolOutput.results
            } : {}
        };
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "computer_call")) {
        yield {
            type: "non_standard",
            value: toolOutput
        };
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "code_interpreter_call")) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.code)) yield {
            id: toolOutput.id,
            type: "server_tool_call",
            name: "code_interpreter",
            args: {
                code: toolOutput.code
            }
        };
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(toolOutput.outputs)) {
            const returnCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"])(()=>{
                if (toolOutput.status === "in_progress") return void 0;
                if (toolOutput.status === "completed") return 0;
                if (toolOutput.status === "incomplete") return 127;
                if (toolOutput.status === "interpreting") return void 0;
                if (toolOutput.status === "failed") return 1;
            });
            for (const output of toolOutput.outputs)if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(output, "logs")) yield {
                type: "server_tool_call_result",
                toolCallId: toolOutput.id ?? "",
                status: "success",
                output: {
                    type: "code_interpreter_output",
                    returnCode: returnCode ?? 0,
                    stderr: [
                        0,
                        void 0
                    ].includes(returnCode) ? void 0 : String(output.logs),
                    stdout: [
                        0,
                        void 0
                    ].includes(returnCode) ? String(output.logs) : void 0
                }
            };
        }
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "mcp_call")) {
        yield {
            id: toolOutput.id,
            type: "server_tool_call",
            name: "mcp_call",
            args: toolOutput.input
        };
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "mcp_list_tools")) {
        yield {
            id: toolOutput.id,
            type: "server_tool_call",
            name: "mcp_list_tools",
            args: toolOutput.input
        };
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "mcp_approval_request")) {
        yield {
            type: "non_standard",
            value: toolOutput
        };
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "tool_search_call")) {
        const toolSearchArgs = {};
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(toolOutput.arguments)) Object.assign(toolSearchArgs, toolOutput.arguments);
        const toolSearchCallExtras = {};
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.execution)) toolSearchCallExtras.execution = toolOutput.execution;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.status)) toolSearchCallExtras.status = toolOutput.status;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.call_id)) toolSearchCallExtras.call_id = toolOutput.call_id;
        yield {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.id) ? toolOutput.id : "",
            type: "server_tool_call",
            name: "tool_search",
            args: toolSearchArgs,
            ...Object.keys(toolSearchCallExtras).length > 0 ? {
                extras: toolSearchCallExtras
            } : {}
        };
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "tool_search_output")) {
        const toolSearchOutputExtras = {
            name: "tool_search"
        };
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.execution)) toolSearchOutputExtras.execution = toolOutput.execution;
        yield {
            type: "server_tool_call_result",
            toolCallId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.id) ? toolOutput.id : "",
            status: toolOutput.status === "completed" ? "success" : toolOutput.status === "failed" ? "error" : "success",
            output: {
                tools: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(toolOutput.tools) ? toolOutput.tools : []
            },
            extras: toolSearchOutputExtras
        };
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(toolOutput, "image_generation_call")) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.result)) yield {
            type: "image",
            mimeType: "image/png",
            data: toolOutput.result,
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.id) ? toolOutput.id : void 0,
            metadata: {
                status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.status) ? toolOutput.status : void 0
            }
        };
        yield {
            type: "non_standard",
            value: toolOutput
        };
        return;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(toolOutput)) yield {
        type: "non_standard",
        value: toolOutput
    };
}
/**
* Converts a ChatOpenAIResponses message to an array of v1 standard content blocks.
*
* This function processes an AI message containing OpenAI Responses-specific content blocks
* and converts them to the standardized v1 content block format. It handles reasoning summaries,
* text content with annotations, tool calls, and various tool outputs including code interpreter,
* web search, file search, computer calls, and MCP-related blocks.
*
* A response can hold more than one reasoning item (e.g. multiple tool calls
* in one turn, common on GPT-5.6-class models). When `response_metadata.output`
* is available, each item's own `id`/`encrypted_content` is preserved and
* blocks are sorted back into original order, so replay under Zero Data
* Retention interleaves reasoning and tool calls correctly. Without it (e.g.
* a hand-built message), falls back to a single reasoning block from
* `additional_kwargs.reasoning`, as before.
*
* @param message - The AI message containing OpenAI Responses-formatted content blocks
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const message = new AIMessage({
*   content: [{ type: "text", text: "Hello world", annotations: [] }],
*   tool_calls: [{ id: "123", name: "calculator", args: { a: 1, b: 2 } }],
*   additional_kwargs: {
*     reasoning: { summary: [{ text: "Let me calculate this..." }] },
*     tool_outputs: [
*       {
*         type: "code_interpreter_call",
*         code: "print('hello')",
*         outputs: [{ type: "logs", logs: "hello" }]
*       }
*     ]
*   }
* });
*
* const standardBlocks = convertToV1FromResponses(message);
* // Returns:
* // [
* //   { type: "reasoning", reasoning: "Let me calculate this..." },
* //   { type: "text", text: "Hello world", annotations: [] },
* //   { type: "tool_call", id: "123", name: "calculator", args: { a: 1, b: 2 } },
* //   { type: "server_tool_call", name: "code_interpreter", args: { code: "print('hello')" } },
* //   { type: "server_tool_call_result", toolCallId: "", status: "success", output: { type: "code_interpreter_output", returnCode: 0, stdout: "hello" } }
* // ]
* ```
*/ function convertToV1FromResponses(message) {
    const rawOutput = message.response_metadata?.output;
    const hasRawOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(rawOutput) && rawOutput.length > 0;
    const positionByKey = /* @__PURE__ */ new Map();
    let messageItemCount = 0;
    let onlyMessageItemIndex;
    if (hasRawOutput) rawOutput.forEach((rawItem, index)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(rawItem) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(rawItem.type)) return;
        if (rawItem.type === "reasoning" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(rawItem.id)) positionByKey.set(`reasoning:${rawItem.id}`, index);
        else if ((rawItem.type === "function_call" || rawItem.type === "custom_tool_call" || rawItem.type === "computer_call") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(rawItem.call_id)) positionByKey.set(`tool_call:${rawItem.call_id}`, index);
        else if (rawItem.type === "message") {
            messageItemCount += 1;
            onlyMessageItemIndex = index;
        } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(rawItem.id)) positionByKey.set(`other:${rawItem.type}:${rawItem.id}`, index);
    });
    const textBlockKey = messageItemCount === 1 && onlyMessageItemIndex != null ? `message:${onlyMessageItemIndex}` : void 0;
    if (textBlockKey != null) positionByKey.set(textBlockKey, onlyMessageItemIndex);
    function* iterateContent() {
        if (hasRawOutput) {
            for (const rawItem of rawOutput)if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(rawItem) && rawItem.type === "reasoning") {
                const block = mapReasoningItemToV1(rawItem);
                if (block) yield [
                    block,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(rawItem.id) ? `reasoning:${rawItem.id}` : void 0
                ];
            }
        } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(message.additional_kwargs?.reasoning) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(message.additional_kwargs.reasoning.summary)) {
            const block = mapReasoningItemToV1(message.additional_kwargs.reasoning);
            if (block) yield [
                block,
                void 0
            ];
        }
        const content = typeof message.content === "string" ? [
            {
                type: "text",
                text: message.content
            }
        ] : message.content;
        for (const block of content)if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "text")) {
            const { text, annotations, phase, extras: existingExtras, ...rest } = block;
            const extras = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(existingExtras) ? {
                ...existingExtras
            } : {};
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(phase)) extras.phase = phase;
            const extrasSpread = Object.keys(extras).length > 0 ? {
                extras
            } : {};
            yield [
                {
                    ...rest,
                    ...extrasSpread,
                    type: "text",
                    text: String(text),
                    ...Array.isArray(annotations) ? {
                        annotations: annotations.map(convertResponsesAnnotation)
                    } : {}
                },
                textBlockKey
            ];
        }
        for (const toolCall of message.tool_calls ?? [])yield [
            {
                type: "tool_call",
                id: toolCall.id,
                name: toolCall.name,
                args: toolCall.args
            },
            toolCall.id ? `tool_call:${toolCall.id}` : void 0
        ];
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(message.additional_kwargs) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(message.additional_kwargs.tool_outputs)) for (const toolOutput of message.additional_kwargs.tool_outputs){
            const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(toolOutput) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.type) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(toolOutput.id) ? `other:${toolOutput.type}:${toolOutput.id}` : void 0;
            for (const block of mapToolOutputToV1Blocks(toolOutput))yield [
                block,
                key
            ];
        }
    }
    const withKeys = Array.from(iterateContent());
    if (!hasRawOutput) return withKeys.map(([block])=>block);
    return withKeys.map(([block, key], pushIndex)=>({
            block,
            pushIndex,
            position: key != null ? positionByKey.get(key) : void 0
        })).sort((a, b)=>{
        const aPos = a.position ?? Number.POSITIVE_INFINITY;
        const bPos = b.position ?? Number.POSITIVE_INFINITY;
        if (aPos !== bPos) return aPos - bPos;
        return a.pushIndex - b.pushIndex;
    }).map((entry)=>entry.block);
}
/**
* Converts a ChatOpenAIResponses message chunk to an array of v1 standard content blocks.
*
* This function processes an AI message chunk containing OpenAI-specific content blocks
* and converts them to the standardized v1 content block format. It handles both the
* regular message content and tool call chunks that are specific to streaming responses.
*
* @param message - The AI message chunk containing OpenAI-formatted content blocks
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const messageChunk = new AIMessageChunk({
*   content: [{ type: "text", text: "Hello" }],
*   tool_call_chunks: [
*     { id: "call_123", name: "calculator", args: '{"a": 1' }
*   ]
* });
*
* const standardBlocks = convertToV1FromResponsesChunk(messageChunk);
* // Returns:
* // [
* //   { type: "text", text: "Hello" },
* //   { type: "tool_call_chunk", id: "call_123", name: "calculator", args: '{"a": 1' }
* // ]
* ```
*/ function convertToV1FromResponsesChunk(message) {
    function* iterateContent() {
        yield* convertToV1FromResponses(message);
        for (const toolCallChunk of message.tool_call_chunks ?? [])yield {
            type: "tool_call_chunk",
            id: toolCallChunk.id,
            name: toolCallChunk.name,
            args: toolCallChunk.args
        };
    }
    return Array.from(iterateContent());
}
const ChatOpenAITranslator = {
    translateContent: (message)=>{
        if (typeof message.content === "string") return convertToV1FromChatCompletions(message);
        return convertToV1FromResponses(message);
    },
    translateContentChunk: (message)=>{
        if (typeof message.content === "string") return convertToV1FromChatCompletionsChunk(message);
        return convertToV1FromResponsesChunk(message);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/message.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isMessage",
    ()=>isMessage
]);
//#region src/messages/message.ts
/**
* Type guard to check if a value is a valid Message object.
*
* @param message - The value to check
* @returns true if the value is a valid Message object, false otherwise
*/ function isMessage(message) {
    return typeof message === "object" && message !== null && "type" in message && "content" in message && (typeof message.content === "string" || Array.isArray(message.content));
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/format.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToFormattedString",
    ()=>convertToFormattedString
]);
//#region src/messages/format.ts
function convertToFormattedString(message, format = "pretty") {
    if (format === "pretty") return convertToPrettyString(message);
    return JSON.stringify(message);
}
function convertToPrettyString(message) {
    const lines = [];
    const title = ` ${message.type.charAt(0).toUpperCase() + message.type.slice(1)} Message `;
    const sepLen = Math.floor((80 - title.length) / 2);
    const sep = "=".repeat(sepLen);
    const secondSep = title.length % 2 === 0 ? sep : `${sep}=`;
    lines.push(`${sep}${title}${secondSep}`);
    if (message.type === "ai") {
        const aiMessage = message;
        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
            lines.push("Tool Calls:");
            for (const tc of aiMessage.tool_calls){
                lines.push(`  ${tc.name} (${tc.id})`);
                lines.push(` Call ID: ${tc.id}`);
                lines.push("  Args:");
                for (const [key, value] of Object.entries(tc.args))lines.push(`    ${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`);
            }
        }
    }
    if (message.type === "tool") {
        const toolMessage = message;
        if (toolMessage.name) lines.push(`Name: ${toolMessage.name}`);
    }
    if (typeof message.content === "string" && message.content.trim()) {
        if (lines.length > 1) lines.push("");
        lines.push(message.content);
    }
    return lines.join("\n");
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseMessage",
    ()=>BaseMessage,
    "BaseMessageChunk",
    ()=>BaseMessageChunk,
    "DEFAULT_MERGE_IGNORE_KEYS",
    ()=>DEFAULT_MERGE_IGNORE_KEYS,
    "_isMessageFieldWithRole",
    ()=>_isMessageFieldWithRole,
    "_mergeDicts",
    ()=>_mergeDicts,
    "_mergeLists",
    ()=>_mergeLists,
    "_mergeObj",
    ()=>_mergeObj,
    "_mergeStatus",
    ()=>_mergeStatus,
    "isBaseMessage",
    ()=>isBaseMessage,
    "isBaseMessageChunk",
    ()=>isBaseMessageChunk,
    "isOpenAIToolCallArray",
    ()=>isOpenAIToolCallArray,
    "mergeContent",
    ()=>mergeContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/data.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$anthropic$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/anthropic.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/data.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$openai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/openai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$message$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/message.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$format$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/format.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
//#region src/messages/base.ts
/** @internal */ const MESSAGE_SYMBOL = Symbol.for("langchain.message");
/**
* Normalize non-string `firstContent` to a block array for merge/spread.
* Some serializers (e.g. Anthropic-style) yield a single block object instead of a one-element array;
* spreading that object as an array throws ("is not iterable").
*/ function contentBlocksFromNonStringFirst(firstContent) {
    if (Array.isArray(firstContent)) return firstContent;
    if (typeof firstContent === "string") return firstContent === "" ? [] : [
        {
            type: "text",
            text: firstContent
        }
    ];
    if (firstContent == null) return [];
    return [
        firstContent
    ];
}
function mergeContent(firstContent, secondContent) {
    if (typeof firstContent === "string") {
        if (firstContent === "") return secondContent;
        if (typeof secondContent === "string") return firstContent + secondContent;
        else if (Array.isArray(secondContent) && secondContent.length === 0) return firstContent;
        else if (Array.isArray(secondContent) && secondContent.some((c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isDataContentBlock"])(c))) return [
            {
                type: "text",
                source_type: "text",
                text: firstContent
            },
            ...secondContent
        ];
        else return [
            {
                type: "text",
                text: firstContent
            },
            ...secondContent
        ];
    } else if (Array.isArray(secondContent)) {
        const left = contentBlocksFromNonStringFirst(firstContent);
        return _mergeLists(left, secondContent) ?? [
            ...left,
            ...secondContent
        ];
    } else if (secondContent === "") return firstContent;
    else if (Array.isArray(firstContent) && firstContent.some((c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isDataContentBlock"])(c))) return [
        ...firstContent,
        {
            type: "file",
            source_type: "text",
            text: secondContent
        }
    ];
    else return [
        ...contentBlocksFromNonStringFirst(firstContent),
        {
            type: "text",
            text: secondContent
        }
    ];
}
/**
* 'Merge' two statuses. If either value passed is 'error', it will return 'error'. Else
* it will return 'success'.
*
* @param {"success" | "error" | undefined} left The existing value to 'merge' with the new value.
* @param {"success" | "error" | undefined} right The new value to 'merge' with the existing value
* @returns {"success" | "error"} The 'merged' value.
*/ function _mergeStatus(left, right) {
    if (left === "error" || right === "error") return "error";
    return "success";
}
function stringifyWithDepthLimit(obj, depthLimit) {
    function helper(obj, currentDepth) {
        if (typeof obj !== "object" || obj === null || obj === void 0) return obj;
        if (currentDepth >= depthLimit) {
            if (Array.isArray(obj)) return "[Array]";
            return "[Object]";
        }
        if (Array.isArray(obj)) return obj.map((item)=>helper(item, currentDepth + 1));
        const result = {};
        for (const key of Object.keys(obj))result[key] = helper(obj[key], currentDepth + 1);
        return result;
    }
    return JSON.stringify(helper(obj, 0), null, 2);
}
/**
* Base class for all types of messages in a conversation. It includes
* properties like `content`, `name`, and `additional_kwargs`. It also
* includes methods like `toDict()` and `_getType()`.
*/ var BaseMessage = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Serializable"] {
    lc_namespace = [
        "langchain_core",
        "messages"
    ];
    lc_serializable = true;
    get lc_aliases() {
        return {
            additional_kwargs: "additional_kwargs",
            response_metadata: "response_metadata"
        };
    }
    [MESSAGE_SYMBOL] = true;
    id;
    /** @inheritdoc */ name;
    content;
    additional_kwargs;
    response_metadata;
    /**
	* @deprecated Use .getType() instead or import the proper typeguard.
	* For example:
	*
	* ```ts
	* import { isAIMessage } from "@langchain/core/messages";
	*
	* const message = new AIMessage("Hello!");
	* isAIMessage(message); // true
	* ```
	*/ _getType() {
        return this.type;
    }
    /**
	* @deprecated Use .type instead
	* The type of the message.
	*/ getType() {
        return this._getType();
    }
    constructor(arg){
        const fields = typeof arg === "string" || Array.isArray(arg) ? {
            content: arg
        } : arg;
        if (!fields.additional_kwargs) fields.additional_kwargs = {};
        if (!fields.response_metadata) fields.response_metadata = {};
        super(fields);
        this.name = fields.name;
        if (fields.content === void 0 && fields.contentBlocks !== void 0) {
            this.content = fields.contentBlocks;
            this.response_metadata = {
                output_version: "v1",
                ...fields.response_metadata
            };
        } else if (fields.content !== void 0) {
            this.content = fields.content ?? [];
            this.response_metadata = fields.response_metadata;
        } else {
            this.content = [];
            this.response_metadata = fields.response_metadata;
        }
        this.additional_kwargs = fields.additional_kwargs;
        this.id = fields.id;
    }
    /** Get text content of the message. */ get text() {
        return this.contentBlocks.filter((block)=>block.type === "text").reduce((acc, block)=>acc + (block.text ?? ""), "");
    }
    get contentBlocks() {
        const blocks = typeof this.content === "string" ? [
            {
                type: "text",
                text: this.content
            }
        ] : this.content;
        return [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToV1FromDataContent"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$openai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToV1FromChatCompletionsInput"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$anthropic$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToV1FromAnthropicInput"]
        ].reduce((blocks, step)=>step(blocks), blocks);
    }
    toDict() {
        return {
            type: this.getType(),
            data: this.toJSON().kwargs
        };
    }
    static lc_name() {
        return "BaseMessage";
    }
    get _printableFields() {
        return {
            id: this.id,
            content: this.content,
            name: this.name,
            additional_kwargs: this.additional_kwargs,
            response_metadata: this.response_metadata
        };
    }
    static isInstance(obj) {
        return typeof obj === "object" && obj !== null && MESSAGE_SYMBOL in obj && obj[MESSAGE_SYMBOL] === true && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$message$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isMessage"])(obj);
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
    _updateId(value) {
        this.id = value;
        this.lc_kwargs.id = value;
    }
    get [Symbol.toStringTag]() {
        return this.constructor.lc_name();
    }
    [Symbol.for("nodejs.util.inspect.custom")](depth) {
        if (depth === null) return this;
        const printable = stringifyWithDepthLimit(this._printableFields, Math.max(4, depth));
        return `${this.constructor.lc_name()} ${printable}`;
    }
    toFormattedString(format = "pretty") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$format$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToFormattedString"])(this, format);
    }
};
function isOpenAIToolCallArray(value) {
    return Array.isArray(value) && value.every((v)=>typeof v.index === "number");
}
/**
* Default keys that should be preserved (not merged) when concatenating message chunks.
* These are identification and timestamp fields that shouldn't be summed or concatenated.
*/ const DEFAULT_MERGE_IGNORE_KEYS = [
    "index",
    "created",
    "timestamp"
];
function _mergeDicts(left, right, options) {
    /**
	* The keys to ignore during merging.
	*/ const ignoreKeys = options?.ignoreKeys ?? DEFAULT_MERGE_IGNORE_KEYS;
    if (left == null && right == null) return;
    if (left == null || right == null) return left ?? right;
    const merged = {
        ...left
    };
    for (const [key, value] of Object.entries(right))if (merged[key] == null) merged[key] = value;
    else if (value == null) continue;
    else if (typeof merged[key] !== typeof value || Array.isArray(merged[key]) !== Array.isArray(value)) throw new Error(`field[${key}] already exists in the message chunk, but with a different type.`);
    else if (typeof merged[key] === "string") {
        if (key === "type") continue;
        else if ([
            "id",
            "name",
            "output_version",
            "model_provider"
        ].includes(key)) {
            if (value) merged[key] = value;
        } else if (ignoreKeys.includes(key)) continue;
        else merged[key] += value;
    } else if (typeof merged[key] === "number") {
        if (ignoreKeys.includes(key)) continue;
        merged[key] = merged[key] + value;
    } else if (typeof merged[key] === "object" && !Array.isArray(merged[key])) merged[key] = _mergeDicts(merged[key], value, options);
    else if (Array.isArray(merged[key])) merged[key] = _mergeLists(merged[key], value, options);
    else if (merged[key] === value) continue;
    else console.warn(`field[${key}] already exists in this message chunk and value has unsupported type.`);
    return merged;
}
function isMergeableIndex(index) {
    return typeof index === "number" || typeof index === "string";
}
function hasMergeableIndex(value) {
    if (typeof value !== "object" || value === null) return false;
    if (!("index" in value)) return false;
    return isMergeableIndex(value.index);
}
function hasMergeableId(value) {
    if (typeof value !== "object" || value === null) return false;
    if (!("id" in value)) return false;
    const id = value.id;
    return id != null && id !== "";
}
function getMergeableTypeBase(type) {
    return type.endsWith("_delta") ? type.slice(0, -6) : type;
}
function hasMismatchedMergeableType(left, right) {
    if (typeof left !== "object" || left === null) return false;
    if (typeof right !== "object" || right === null) return false;
    if (!("type" in left) || !("type" in right)) return false;
    return typeof left.type === "string" && typeof right.type === "string" && getMergeableTypeBase(left.type) !== getMergeableTypeBase(right.type);
}
/**
* Find the index of an existing item in `merged` that should be merged with
* `item`, based on index and/or id matching.
*
* Matching priority:
* 1. Both have index → match on index (+ id when both present)
* 2. Neither has index, both have id → match on id alone
* 3. Otherwise → no match (item should be appended)
*/ function _findMergeTarget(merged, item) {
    const itemHasIndex = hasMergeableIndex(item);
    const itemHasId = hasMergeableId(item);
    if (!itemHasIndex && !itemHasId) return -1;
    return merged.findIndex((leftItem)=>{
        const leftHasIndex = hasMergeableIndex(leftItem);
        const leftHasId = hasMergeableId(leftItem);
        if (itemHasIndex && leftHasIndex) {
            if (!(leftItem.index === item.index)) return false;
            if (hasMismatchedMergeableType(leftItem, item)) return false;
            if (leftHasId && itemHasId) return leftItem.id === item.id;
            return true;
        }
        if (!itemHasIndex && !leftHasIndex && itemHasId && leftHasId) return leftItem.id === item.id;
        return false;
    });
}
function _mergeLists(left, right, options) {
    if (left == null && right == null) return;
    else if (left == null || right == null) return left || right;
    else {
        const merged = [
            ...left
        ];
        for (const item of right){
            const toMerge = _findMergeTarget(merged, item);
            if (toMerge !== -1) merged[toMerge] = _mergeDicts(merged[toMerge], item, options);
            else if (typeof item === "object" && item !== null && "text" in item && item.text === "") continue;
            else merged.push(item);
        }
        return merged;
    }
}
function _mergeObj(left, right, options) {
    if (left == null && right == null) return;
    if (left == null || right == null) return left ?? right;
    else if (typeof left !== typeof right) throw new Error(`Cannot merge objects of different types.\nLeft ${typeof left}\nRight ${typeof right}`);
    else if (typeof left === "string" && typeof right === "string") return left + right;
    else if (Array.isArray(left) && Array.isArray(right)) return _mergeLists(left, right, options);
    else if (typeof left === "object" && typeof right === "object") return _mergeDicts(left, right, options);
    else if (left === right) return left;
    else throw new Error(`Can not merge objects of different types.\nLeft ${left}\nRight ${right}`);
}
/**
* Represents a chunk of a message, which can be concatenated with other
* message chunks. It includes a method `_merge_kwargs_dict()` for merging
* additional keyword arguments from another `BaseMessageChunk` into this
* one. It also overrides the `__add__()` method to support concatenation
* of `BaseMessageChunk` instances.
*/ var BaseMessageChunk = class BaseMessageChunk extends BaseMessage {
    static isInstance(obj) {
        if (!super.isInstance(obj)) return false;
        let proto = Object.getPrototypeOf(obj);
        while(proto !== null){
            if (proto === BaseMessageChunk.prototype) return true;
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
function _isMessageFieldWithRole(x) {
    return typeof x.role === "string";
}
/**
* @deprecated Use {@link BaseMessage.isInstance} instead
*/ function isBaseMessage(messageLike) {
    return typeof messageLike?._getType === "function";
}
/**
* @deprecated Use {@link BaseMessageChunk.isInstance} instead
*/ function isBaseMessageChunk(messageLike) {
    return BaseMessageChunk.isInstance(messageLike);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/tool.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToolMessage",
    ()=>ToolMessage,
    "ToolMessageChunk",
    ()=>ToolMessageChunk,
    "defaultToolCallParser",
    ()=>defaultToolCallParser,
    "isDirectToolOutput",
    ()=>isDirectToolOutput,
    "isToolMessage",
    ()=>isToolMessage,
    "isToolMessageChunk",
    ()=>isToolMessageChunk,
    "tool_exports",
    ()=>tool_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
;
;
//#region src/messages/tool.ts
var tool_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["__exportAll"])({
    ToolMessage: ()=>ToolMessage,
    ToolMessageChunk: ()=>ToolMessageChunk,
    defaultToolCallParser: ()=>defaultToolCallParser,
    isDirectToolOutput: ()=>isDirectToolOutput,
    isToolMessage: ()=>isToolMessage,
    isToolMessageChunk: ()=>isToolMessageChunk
});
function isDirectToolOutput(x) {
    return x != null && typeof x === "object" && "lc_direct_tool_output" in x && x.lc_direct_tool_output === true;
}
/**
* Represents a tool message in a conversation.
*/ var ToolMessage = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessage"] {
    static lc_name() {
        return "ToolMessage";
    }
    get lc_aliases() {
        return {
            tool_call_id: "tool_call_id"
        };
    }
    lc_direct_tool_output = true;
    type = "tool";
    /**
	* Status of the tool invocation.
	* @version 0.2.19
	*/ status;
    tool_call_id;
    metadata;
    /**
	* Artifact of the Tool execution which is not meant to be sent to the model.
	*
	* Should only be specified if it is different from the message content, e.g. if only
	* a subset of the full tool output is being passed as message content but the full
	* output is needed in other parts of the code.
	*/ artifact;
    constructor(fields, tool_call_id, name){
        const toolMessageFields = typeof fields === "string" || Array.isArray(fields) ? {
            content: fields,
            name,
            tool_call_id
        } : fields;
        super(toolMessageFields);
        this.tool_call_id = toolMessageFields.tool_call_id;
        this.artifact = toolMessageFields.artifact;
        this.status = toolMessageFields.status;
        this.metadata = toolMessageFields.metadata;
    }
    static isInstance(message) {
        return super.isInstance(message) && message.type === "tool";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            tool_call_id: this.tool_call_id,
            artifact: this.artifact
        };
    }
};
/**
* Represents a chunk of a tool message, which can be concatenated
* with other tool message chunks.
*/ var ToolMessageChunk = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessageChunk"] {
    type = "tool";
    tool_call_id;
    /**
	* Status of the tool invocation.
	* @version 0.2.19
	*/ status;
    /**
	* Artifact of the Tool execution which is not meant to be sent to the model.
	*
	* Should only be specified if it is different from the message content, e.g. if only
	* a subset of the full tool output is being passed as message content but the full
	* output is needed in other parts of the code.
	*/ artifact;
    constructor(fields){
        super(fields);
        this.tool_call_id = fields.tool_call_id;
        this.artifact = fields.artifact;
        this.status = fields.status;
    }
    static lc_name() {
        return "ToolMessageChunk";
    }
    concat(chunk) {
        const Cls = this.constructor;
        return new Cls({
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"])(this.content, chunk.content),
            additional_kwargs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.response_metadata, chunk.response_metadata),
            artifact: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeObj"])(this.artifact, chunk.artifact),
            tool_call_id: this.tool_call_id,
            id: this.id ?? chunk.id,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeStatus"])(this.status, chunk.status)
        });
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "tool";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            tool_call_id: this.tool_call_id,
            artifact: this.artifact
        };
    }
};
function defaultToolCallParser(rawToolCalls) {
    const toolCalls = [];
    const invalidToolCalls = [];
    for (const toolCall of rawToolCalls)if (!toolCall.function) continue;
    else {
        const functionName = toolCall.function.name;
        try {
            const functionArgs = JSON.parse(toolCall.function.arguments);
            toolCalls.push({
                name: functionName || "",
                args: functionArgs || {},
                id: toolCall.id
            });
        } catch  {
            invalidToolCalls.push({
                name: functionName,
                args: toolCall.function.arguments,
                id: toolCall.id,
                error: "Malformed args."
            });
        }
    }
    return [
        toolCalls,
        invalidToolCalls
    ];
}
/**
* @deprecated Use {@link ToolMessage.isInstance} instead
*/ function isToolMessage(x) {
    return typeof x === "object" && x !== null && "getType" in x && typeof x.getType === "function" && x.getType() === "tool";
}
/**
* @deprecated Use {@link ToolMessageChunk.isInstance} instead
*/ function isToolMessageChunk(x) {
    return x._getType() === "tool";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/bedrock_converse.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatBedrockConverseTranslator",
    ()=>ChatBedrockConverseTranslator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/bedrock_converse.ts
function convertFileFormatToMimeType(format) {
    switch(format){
        case "csv":
            return "text/csv";
        case "doc":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "html":
            return "text/html";
        case "md":
            return "text/markdown";
        case "pdf":
            return "application/pdf";
        case "txt":
            return "text/plain";
        case "xls":
            return "application/vnd.ms-excel";
        case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case "gif":
            return "image/gif";
        case "jpeg":
            return "image/jpeg";
        case "jpg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "webp":
            return "image/webp";
        case "flv":
            return "video/flv";
        case "mkv":
            return "video/mkv";
        case "mov":
            return "video/mov";
        case "mp4":
            return "video/mp4";
        case "mpeg":
            return "video/mpeg";
        case "mpg":
            return "video/mpg";
        case "three_gp":
            return "video/three_gp";
        case "webm":
            return "video/webm";
        case "wmv":
            return "video/wmv";
        default:
            return "application/octet-stream";
    }
}
function convertConverseDocumentBlock(block) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.document) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.document.source)) {
        const mimeType = convertFileFormatToMimeType((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.document) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.document.format) ? block.document.format : "");
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.document.source)) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.document.source.s3Location) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.document.source.s3Location.uri)) return {
                type: "file",
                mimeType,
                fileId: block.document.source.s3Location.uri
            };
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isBytesArray"])(block.document.source.bytes)) return {
                type: "file",
                mimeType,
                data: block.document.source.bytes
            };
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.document.source.text)) return {
                type: "file",
                mimeType,
                data: Buffer.from(block.document.source.text).toString("base64")
            };
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(block.document.source.content)) return {
                type: "file",
                mimeType,
                data: block.document.source.content.reduce((acc, item)=>{
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(item) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(item.text)) return acc + item.text;
                    return acc;
                }, "")
            };
        }
    }
    return {
        type: "non_standard",
        value: block
    };
}
function convertConverseImageBlock(block) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "image") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.image)) {
        const mimeType = convertFileFormatToMimeType((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.image) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.image.format) ? block.image.format : "");
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.image.source)) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.image.source.s3Location) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.image.source.s3Location.uri)) return {
                type: "image",
                mimeType,
                fileId: block.image.source.s3Location.uri
            };
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isBytesArray"])(block.image.source.bytes)) return {
                type: "image",
                mimeType,
                data: block.image.source.bytes
            };
        }
    }
    return {
        type: "non_standard",
        value: block
    };
}
function convertConverseVideoBlock(block) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "video") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.video)) {
        const mimeType = convertFileFormatToMimeType((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.video) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.video.format) ? block.video.format : "");
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.video.source)) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.video.source.s3Location) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.video.source.s3Location.uri)) return {
                type: "video",
                mimeType,
                fileId: block.video.source.s3Location.uri
            };
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isBytesArray"])(block.video.source.bytes)) return {
                type: "video",
                mimeType,
                data: block.video.source.bytes
            };
        }
    }
    return {
        type: "non_standard",
        value: block
    };
}
function convertToV1FromChatBedrockConverseMessage(message) {
    function* iterateContent() {
        const content = typeof message.content === "string" ? [
            {
                type: "text",
                text: message.content
            }
        ] : message.content;
        for (const block of content){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "reasoning") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.reasoning)) {
                yield {
                    ...block,
                    type: "reasoning",
                    reasoning: block.reasoning
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "cache_point")) {
                yield {
                    type: "non_standard",
                    value: block
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "citations_content") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.citationsContent)) {
                yield {
                    type: "text",
                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(block.citationsContent.content) ? block.citationsContent.content.reduce((acc, item)=>{
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(item) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(item.text)) return acc + item.text;
                        return acc;
                    }, "") : "",
                    annotations: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(block.citationsContent.citations) ? block.citationsContent.citations.reduce((acc, item)=>{
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(item)) {
                            const citedText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(item.sourceContent) ? item.sourceContent.reduce((acc, item)=>{
                                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(item) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(item.text)) return acc + item.text;
                                return acc;
                            }, "") : "";
                            const properties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"])(()=>{
                                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(item.location)) {
                                    const location = item.location.documentChar || item.location.documentPage || item.location.documentChunk;
                                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(location)) return {
                                        source: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(location.documentIndex) ? location.documentIndex.toString() : void 0,
                                        startIndex: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(location.start) ? location.start : void 0,
                                        endIndex: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isNumber"])(location.end) ? location.end : void 0
                                    };
                                }
                                return {};
                            });
                            acc.push({
                                type: "citation",
                                citedText,
                                ...properties
                            });
                        }
                        return acc;
                    }, []) : []
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "document") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.document)) {
                yield convertConverseDocumentBlock(block);
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "guard_content")) {
                yield {
                    type: "non_standard",
                    value: block
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "image") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.image)) {
                yield convertConverseImageBlock(block);
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "reasoning_content") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.reasoningText) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.reasoningText.text)) {
                yield {
                    type: "reasoning",
                    reasoning: block.reasoningText.text,
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.reasoningText.signature) ? {
                        signature: block.reasoningText.signature
                    } : {}
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "reasoning_content") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.reasoningText)) {
                yield {
                    type: "reasoning",
                    reasoning: block.reasoningText
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "text") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) {
                yield {
                    type: "text",
                    text: block.text
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "tool_result")) {
                yield {
                    type: "non_standard",
                    value: block
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "tool_call")) continue;
            else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "video") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.video)) {
                yield convertConverseVideoBlock(block);
                continue;
            }
            yield {
                type: "non_standard",
                value: block
            };
        }
    }
    return Array.from(iterateContent());
}
const ChatBedrockConverseTranslator = {
    translateContent: convertToV1FromChatBedrockConverseMessage,
    translateContentChunk: convertToV1FromChatBedrockConverseMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/deepseek.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatDeepSeekTranslator",
    ()=>ChatDeepSeekTranslator,
    "convertToV1FromDeepSeekMessage",
    ()=>convertToV1FromDeepSeekMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/deepseek.ts
/**
* Converts a DeepSeek AI message to an array of v1 standard content blocks.
*
* This function processes an AI message from DeepSeek's API format
* and converts it to the standardized v1 content block format. It handles
* both string content and the reasoning_content in additional_kwargs.
*
* @param message - The AI message containing DeepSeek-formatted content
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const message = new AIMessage({
*   content: "The answer is 42",
*   additional_kwargs: { reasoning_content: "Let me think about this..." }
* });
* const standardBlocks = convertToV1FromDeepSeekMessage(message);
* // Returns:
* // [
* //   { type: "reasoning", reasoning: "Let me think about this..." },
* //   { type: "text", text: "The answer is 42" }
* // ]
* ```
*/ function convertToV1FromDeepSeekMessage(message) {
    const blocks = [];
    const reasoningContent = message.additional_kwargs?.reasoning_content;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(reasoningContent) && reasoningContent.length > 0) blocks.push({
        type: "reasoning",
        reasoning: reasoningContent
    });
    if (typeof message.content === "string") {
        if (message.content.length > 0) blocks.push({
            type: "text",
            text: message.content
        });
    } else for (const block of message.content)if (typeof block === "object" && "type" in block && block.type === "text" && "text" in block && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) blocks.push({
        type: "text",
        text: block.text
    });
    for (const toolCall of message.tool_calls ?? [])blocks.push({
        type: "tool_call",
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args
    });
    return blocks;
}
const ChatDeepSeekTranslator = {
    translateContent: convertToV1FromDeepSeekMessage,
    translateContentChunk: convertToV1FromDeepSeekMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/google_genai.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatGoogleGenAITranslator",
    ()=>ChatGoogleGenAITranslator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/google_genai.ts
function convertToV1FromChatGoogleMessage(message) {
    function* iterateContent() {
        const content = typeof message.content === "string" ? [
            {
                type: "text",
                text: message.content
            }
        ] : message.content;
        for (const block of content){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "text") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) {
                yield {
                    type: "text",
                    text: block.text
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "thinking") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.thinking)) {
                yield {
                    type: "reasoning",
                    reasoning: block.thinking,
                    ...block.signature ? {
                        signature: block.signature
                    } : {}
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "inlineData") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.inlineData) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.inlineData.mimeType) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.inlineData.data)) {
                yield {
                    type: "file",
                    mimeType: block.inlineData.mimeType,
                    data: block.inlineData.data
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "functionCall") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.functionCall) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.functionCall.name) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.functionCall.args)) {
                yield {
                    type: "tool_call",
                    id: message.id,
                    name: block.functionCall.name,
                    args: block.functionCall.args
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "functionResponse")) {
                yield {
                    type: "non_standard",
                    value: block
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "fileData") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.fileData) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.fileData.mimeType) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.fileData.fileUri)) {
                yield {
                    type: "file",
                    mimeType: block.fileData.mimeType,
                    fileId: block.fileData.fileUri
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "executableCode")) {
                yield {
                    type: "non_standard",
                    value: block
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "codeExecutionResult")) {
                yield {
                    type: "non_standard",
                    value: block
                };
                continue;
            }
            yield {
                type: "non_standard",
                value: block
            };
        }
    }
    return Array.from(iterateContent());
}
const ChatGoogleGenAITranslator = {
    translateContent: convertToV1FromChatGoogleMessage,
    translateContentChunk: convertToV1FromChatGoogleMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/google_vertexai.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatVertexTranslator",
    ()=>ChatVertexTranslator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/google_vertexai.ts
function convertToV1FromChatVertexMessage(message) {
    function* iterateContent() {
        const content = typeof message.content === "string" ? [
            {
                type: "text",
                text: message.content
            }
        ] : message.content;
        for (const block of content){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "reasoning") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.reasoning)) {
                const signature = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"])(()=>{
                    const reasoningIndex = content.indexOf(block);
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(message.additional_kwargs?.signatures) && reasoningIndex >= 0) return message.additional_kwargs.signatures.at(reasoningIndex);
                });
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(signature)) yield {
                    type: "reasoning",
                    reasoning: block.reasoning,
                    signature
                };
                else yield {
                    type: "reasoning",
                    reasoning: block.reasoning
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "thinking") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.thinking)) {
                yield {
                    type: "reasoning",
                    reasoning: block.thinking,
                    ...block.signature ? {
                        signature: block.signature
                    } : {}
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "text") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) {
                if (block.text === "") continue;
                yield {
                    type: "text",
                    text: block.text
                };
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "image_url")) {
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.image_url)) {
                    if (block.image_url.startsWith("data:")) {
                        const match = block.image_url.match(/^data:([^;]+);base64,(.+)$/);
                        if (match) yield {
                            type: "image",
                            data: match[2],
                            mimeType: match[1]
                        };
                        else yield {
                            type: "image",
                            url: block.image_url
                        };
                    } else yield {
                        type: "image",
                        url: block.image_url
                    };
                }
                continue;
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "media") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.mimeType) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.data)) {
                yield {
                    type: "file",
                    mimeType: block.mimeType,
                    data: block.data
                };
                continue;
            }
            yield {
                type: "non_standard",
                value: block
            };
        }
        for (const toolCall of message.tool_calls ?? [])yield {
            type: "tool_call",
            id: toolCall.id,
            name: toolCall.name,
            args: toolCall.args
        };
    }
    return Array.from(iterateContent());
}
const ChatVertexTranslator = {
    translateContent: convertToV1FromChatVertexMessage,
    translateContentChunk: convertToV1FromChatVertexMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/groq.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatGroqTranslator",
    ()=>ChatGroqTranslator,
    "convertToV1FromGroqMessage",
    ()=>convertToV1FromGroqMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/groq.ts
/**
* Converts a Groq AI message to an array of v1 standard content blocks.
*
* This function processes an AI message from Groq's API format
* and converts it to the standardized v1 content block format. It handles
* both parsed reasoning (in additional_kwargs.reasoning) and raw reasoning
* (in <think> tags within content).
*
* @param message - The AI message containing Groq-formatted content
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* // Parsed format (reasoning_format="parsed")
* const message = new AIMessage({
*   content: "The answer is 42",
*   additional_kwargs: { reasoning: "Let me think about this..." }
* });
* const standardBlocks = convertToV1FromGroqMessage(message);
* // Returns:
* // [
* //   { type: "reasoning", reasoning: "Let me think about this..." },
* //   { type: "text", text: "The answer is 42" }
* // ]
* ```
*
* @example
* ```typescript
* // Raw format (reasoning_format="raw")
* const message = new AIMessage({
*   content: "<think>Let me think...</think>The answer is 42"
* });
* const standardBlocks = convertToV1FromGroqMessage(message);
* // Returns:
* // [
* //   { type: "reasoning", reasoning: "Let me think..." },
* //   { type: "text", text: "The answer is 42" }
* // ]
* ```
*/ function convertToV1FromGroqMessage(message) {
    const blocks = [];
    const parsedReasoning = message.additional_kwargs?.reasoning;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(parsedReasoning) && parsedReasoning.length > 0) blocks.push({
        type: "reasoning",
        reasoning: parsedReasoning
    });
    if (typeof message.content === "string") {
        let textContent = message.content;
        const thinkMatch = textContent.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
            const thinkingContent = thinkMatch[1].trim();
            if (thinkingContent.length > 0) blocks.push({
                type: "reasoning",
                reasoning: thinkingContent
            });
            textContent = textContent.replace(/<think>[\s\S]*?<\/think>/, "").trim();
        }
        if (textContent.length > 0) blocks.push({
            type: "text",
            text: textContent
        });
    } else for (const block of message.content)if (typeof block === "object" && "type" in block && block.type === "text" && "text" in block && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) {
        let textContent = block.text;
        const thinkMatch = textContent.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
            const thinkingContent = thinkMatch[1].trim();
            if (thinkingContent.length > 0) blocks.push({
                type: "reasoning",
                reasoning: thinkingContent
            });
            textContent = textContent.replace(/<think>[\s\S]*?<\/think>/, "").trim();
        }
        if (textContent.length > 0) blocks.push({
            type: "text",
            text: textContent
        });
    }
    for (const toolCall of message.tool_calls ?? [])blocks.push({
        type: "tool_call",
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args
    });
    return blocks;
}
const ChatGroqTranslator = {
    translateContent: convertToV1FromGroqMessage,
    translateContentChunk: convertToV1FromGroqMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/ollama.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatOllamaTranslator",
    ()=>ChatOllamaTranslator,
    "convertToV1FromOllamaMessage",
    ()=>convertToV1FromOllamaMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/ollama.ts
/**
* Converts an Ollama AI message to an array of v1 standard content blocks.
*
* This function processes an AI message from Ollama's API format
* and converts it to the standardized v1 content block format. It handles
* the reasoning_content in additional_kwargs (populated when think mode is enabled).
*
* @param message - The AI message containing Ollama-formatted content
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const message = new AIMessage({
*   content: "The answer is 42",
*   additional_kwargs: { reasoning_content: "Let me think about this..." }
* });
* const standardBlocks = convertToV1FromOllamaMessage(message);
* // Returns:
* // [
* //   { type: "reasoning", reasoning: "Let me think about this..." },
* //   { type: "text", text: "The answer is 42" }
* // ]
* ```
*/ function convertToV1FromOllamaMessage(message) {
    const blocks = [];
    const reasoningContent = message.additional_kwargs?.reasoning_content;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(reasoningContent) && reasoningContent.length > 0) blocks.push({
        type: "reasoning",
        reasoning: reasoningContent
    });
    if (typeof message.content === "string") {
        if (message.content.length > 0) blocks.push({
            type: "text",
            text: message.content
        });
    } else for (const block of message.content)if (typeof block === "object" && "type" in block && block.type === "text" && "text" in block && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) blocks.push({
        type: "text",
        text: block.text
    });
    for (const toolCall of message.tool_calls ?? [])blocks.push({
        type: "tool_call",
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args
    });
    return blocks;
}
const ChatOllamaTranslator = {
    translateContent: convertToV1FromOllamaMessage,
    translateContentChunk: convertToV1FromOllamaMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/openrouter.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatOpenRouterTranslator",
    ()=>ChatOpenRouterTranslator,
    "convertToV1FromOpenRouterMessage",
    ()=>convertToV1FromOpenRouterMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/openrouter.ts
/**
* Converts an OpenRouter AI message to an array of v1 standard content blocks.
*
* OpenRouter returns reasoning output through two places on the Chat
* Completions response:
*
* 1. `message.reasoning` / `delta.reasoning` — a flat string that summarizes
*    the model's chain of thought. The `@langchain/openrouter` converter
*    normalizes this into `additional_kwargs.reasoning_content` so it matches
*    the DeepSeek convention already used elsewhere in LangChain.
* 2. `message.reasoning_details` / `delta.reasoning_details` — a structured
*    array of provider-specific reasoning artifacts (see the
*    `reasoning.summary` / `reasoning.encrypted` / `reasoning.text` union in
*    the OpenRouter API types). The converter preserves these verbatim under
*    `additional_kwargs.reasoning_details` for round-tripping back to the
*    provider on subsequent turns (e.g. Anthropic extended thinking requires
*    the original `signature` to be echoed back).
*
* When `reasoning_details` is present, visible blocks are emitted from
* `reasoning.summary` / `reasoning.text` entries. If the array contains only
* opaque artifacts (e.g. `reasoning.encrypted`), the flat `reasoning_content`
* string is used as a fallback when available.
*
* @param message - The AI message containing OpenRouter-formatted content
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* const message = new AIMessage({
*   content: "The answer is 42",
*   additional_kwargs: { reasoning_content: "Let me think about this..." },
*   response_metadata: { model_provider: "openrouter" },
* });
* message.contentBlocks;
* // [
* //   { type: "reasoning", reasoning: "Let me think about this..." },
* //   { type: "text", text: "The answer is 42" }
* // ]
* ```
*/ function convertToV1FromOpenRouterMessage(message) {
    const blocks = [];
    const reasoningDetails = message.additional_kwargs?.reasoning_details;
    let hasVisibleReasoningFromDetails = false;
    if (Array.isArray(reasoningDetails) && reasoningDetails.length > 0) for (const detail of reasoningDetails){
        if (detail == null || typeof detail !== "object") continue;
        const type = detail.type;
        if (type === "reasoning.summary") {
            const summary = detail.summary;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(summary) && summary.length > 0) {
                blocks.push({
                    type: "reasoning",
                    reasoning: summary
                });
                hasVisibleReasoningFromDetails = true;
            }
        } else if (type === "reasoning.text") {
            const text = detail.text;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(text) && text.length > 0) {
                blocks.push({
                    type: "reasoning",
                    reasoning: text
                });
                hasVisibleReasoningFromDetails = true;
            }
        }
    }
    if (!hasVisibleReasoningFromDetails) {
        const reasoningContent = message.additional_kwargs?.reasoning_content;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(reasoningContent) && reasoningContent.length > 0) blocks.push({
            type: "reasoning",
            reasoning: reasoningContent
        });
    }
    if (typeof message.content === "string") {
        if (message.content.length > 0) blocks.push({
            type: "text",
            text: message.content
        });
    } else for (const block of message.content)if (typeof block === "object" && "type" in block && block.type === "text" && "text" in block && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) blocks.push({
        type: "text",
        text: block.text
    });
    for (const toolCall of message.tool_calls ?? [])blocks.push({
        type: "tool_call",
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args
    });
    return blocks;
}
const ChatOpenRouterTranslator = {
    translateContent: convertToV1FromOpenRouterMessage,
    translateContentChunk: convertToV1FromOpenRouterMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/xai.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatXAITranslator",
    ()=>ChatXAITranslator,
    "convertToV1FromXAIMessage",
    ()=>convertToV1FromXAIMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/xai.ts
/**
* Converts an xAI AI message to an array of v1 standard content blocks.
*
* This function processes an AI message from xAI's API format
* and converts it to the standardized v1 content block format. It handles
* both the responses API (reasoning object with summary) and completions API
* (reasoning_content string) formats.
*
* @param message - The AI message containing xAI-formatted content
* @returns Array of content blocks in v1 standard format
*
* @example
* ```typescript
* // Responses API format
* const message = new AIMessage({
*   content: "The answer is 42",
*   additional_kwargs: {
*     reasoning: {
*       id: "reasoning_123",
*       type: "reasoning",
*       summary: [{ type: "summary_text", text: "Let me think..." }]
*     }
*   }
* });
* const standardBlocks = convertToV1FromXAIMessage(message);
* // Returns:
* // [
* //   { type: "reasoning", reasoning: "Let me think..." },
* //   { type: "text", text: "The answer is 42" }
* // ]
* ```
*
* @example
* ```typescript
* // Completions API format
* const message = new AIMessage({
*   content: "The answer is 42",
*   additional_kwargs: { reasoning_content: "Let me think about this..." }
* });
* const standardBlocks = convertToV1FromXAIMessage(message);
* // Returns:
* // [
* //   { type: "reasoning", reasoning: "Let me think about this..." },
* //   { type: "text", text: "The answer is 42" }
* // ]
* ```
*/ function convertToV1FromXAIMessage(message) {
    const blocks = [];
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(message.additional_kwargs?.reasoning)) {
        const reasoning = message.additional_kwargs.reasoning;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isArray"])(reasoning.summary)) {
            const summaryText = reasoning.summary.reduce((acc, item)=>{
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(item) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(item.text)) return `${acc}${item.text}`;
                return acc;
            }, "");
            if (summaryText.length > 0) blocks.push({
                type: "reasoning",
                reasoning: summaryText
            });
        }
    }
    const reasoningContent = message.additional_kwargs?.reasoning_content;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(reasoningContent) && reasoningContent.length > 0) blocks.push({
        type: "reasoning",
        reasoning: reasoningContent
    });
    if (typeof message.content === "string") {
        if (message.content.length > 0) blocks.push({
            type: "text",
            text: message.content
        });
    } else for (const block of message.content)if (typeof block === "object" && "type" in block && block.type === "text" && "text" in block && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) blocks.push({
        type: "text",
        text: block.text
    });
    for (const toolCall of message.tool_calls ?? [])blocks.push({
        type: "tool_call",
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args
    });
    return blocks;
}
const ChatXAITranslator = {
    translateContent: convertToV1FromXAIMessage,
    translateContentChunk: convertToV1FromXAIMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/google.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatGoogleTranslator",
    ()=>ChatGoogleTranslator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/utils.js [instrumentation] (ecmascript)");
;
//#region src/messages/block_translators/google.ts
function convertToV1FromChatGoogleMessage(message) {
    function* iterateContent() {
        const content = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"])(()=>{
            if (typeof message.content === "string") {
                if (message.additional_kwargs.originalTextContentBlock) return [
                    {
                        ...message.additional_kwargs.originalTextContentBlock,
                        type: "text"
                    }
                ];
                else return [
                    {
                        type: "text",
                        text: message.content
                    }
                ];
            } else {
                const originalBlock = message.additional_kwargs?.originalTextContentBlock;
                if (originalBlock?.thoughtSignature) {
                    if (!message.content.some((b)=>"thoughtSignature" in b)) {
                        const result = [
                            ...message.content
                        ];
                        for(let i = result.length - 1; i >= 0; i--){
                            const block = result[i];
                            if (block.type === "text" && !block.thought) {
                                block.thoughtSignature = originalBlock.thoughtSignature;
                                return result;
                            }
                        }
                    }
                }
                return message.content;
            }
        });
        for (const block of content){
            const contentBlockBase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"])(()=>{
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "text") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.text)) return {
                    type: "text",
                    text: block.text
                };
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "inlineData") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.inlineData) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.inlineData.mimeType) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.inlineData.data)) return {
                    type: "file",
                    mimeType: block.inlineData.mimeType,
                    data: block.inlineData.data
                };
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "functionCall") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.functionCall) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.functionCall.name) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.functionCall.args)) return {
                    type: "tool_call",
                    id: message.id,
                    name: block.functionCall.name,
                    args: block.functionCall.args
                };
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "functionResponse")) return {
                    type: "non_standard",
                    value: block
                };
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "fileData") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isObject"])(block.fileData) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.fileData.mimeType) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isString"])(block.fileData.fileUri)) return {
                    type: "file",
                    mimeType: block.fileData.mimeType,
                    fileId: block.fileData.fileUri
                };
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "executableCode")) return {
                    type: "non_standard",
                    value: block
                };
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isContentBlock"])(block, "codeExecutionResult")) return {
                    type: "non_standard",
                    value: block
                };
                return {
                    type: "non_standard",
                    value: block
                };
            });
            const contentBlock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"])(()=>{
                if ("thought" in block && block.thought) return {
                    type: "reasoning",
                    reasoning: contentBlockBase.type === "text" ? contentBlockBase.text : "",
                    reasoningContentBlock: contentBlockBase
                };
                else return contentBlockBase;
            });
            const ret = {
                thought: block.thought,
                thoughtSignature: block.thoughtSignature,
                partMetadata: block.partMetadata,
                ...contentBlock
            };
            for(const attribute in ret)if (ret[attribute] === void 0) delete ret[attribute];
            yield ret;
        }
    }
    return Array.from(iterateContent());
}
const ChatGoogleTranslator = {
    translateContent: convertToV1FromChatGoogleMessage,
    translateContentChunk: convertToV1FromChatGoogleMessage
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getTranslator",
    ()=>getTranslator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$anthropic$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/anthropic.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$openai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/openai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$bedrock_converse$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/bedrock_converse.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$deepseek$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/deepseek.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$google_genai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/google_genai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$google_vertexai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/google_vertexai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$groq$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/groq.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$ollama$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/ollama.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$openrouter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/openrouter.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$xai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/xai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$google$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/google.js [instrumentation] (ecmascript)");
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
//#region src/messages/block_translators/index.ts
globalThis.lc_block_translators_registry ??= /* @__PURE__ */ new Map([
    [
        "anthropic",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$anthropic$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatAnthropicTranslator"]
    ],
    [
        "bedrock-converse",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$bedrock_converse$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatBedrockConverseTranslator"]
    ],
    [
        "deepseek",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$deepseek$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatDeepSeekTranslator"]
    ],
    [
        "google",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$google$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatGoogleTranslator"]
    ],
    [
        "google-genai",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$google_genai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatGoogleGenAITranslator"]
    ],
    [
        "google-vertexai",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$google_vertexai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatVertexTranslator"]
    ],
    [
        "groq",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$groq$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatGroqTranslator"]
    ],
    [
        "ollama",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$ollama$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatOllamaTranslator"]
    ],
    [
        "openai",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$openai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatOpenAITranslator"]
    ],
    [
        "openrouter",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$openrouter$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatOpenRouterTranslator"]
    ],
    [
        "xai",
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$xai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatXAITranslator"]
    ]
]);
function getTranslator(modelProvider) {
    return globalThis.lc_block_translators_registry.get(modelProvider);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/metadata.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mergeResponseMetadata",
    ()=>mergeResponseMetadata,
    "mergeUsageMetadata",
    ()=>mergeUsageMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
;
//#region src/messages/metadata.ts
function mergeResponseMetadata(a, b) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(a, b) ?? {};
}
function mergeModalitiesTokenDetails(a, b) {
    const output = {};
    if (a?.audio !== void 0 || b?.audio !== void 0) output.audio = (a?.audio ?? 0) + (b?.audio ?? 0);
    if (a?.image !== void 0 || b?.image !== void 0) output.image = (a?.image ?? 0) + (b?.image ?? 0);
    if (a?.video !== void 0 || b?.video !== void 0) output.video = (a?.video ?? 0) + (b?.video ?? 0);
    if (a?.document !== void 0 || b?.document !== void 0) output.document = (a?.document ?? 0) + (b?.document ?? 0);
    if (a?.text !== void 0 || b?.text !== void 0) output.text = (a?.text ?? 0) + (b?.text ?? 0);
    return output;
}
function mergeInputTokenDetails(a, b) {
    const output = {
        ...mergeModalitiesTokenDetails(a, b)
    };
    if (a?.cache_read !== void 0 || b?.cache_read !== void 0) output.cache_read = (a?.cache_read ?? 0) + (b?.cache_read ?? 0);
    if (a?.cache_creation !== void 0 || b?.cache_creation !== void 0) output.cache_creation = (a?.cache_creation ?? 0) + (b?.cache_creation ?? 0);
    return output;
}
function mergeOutputTokenDetails(a, b) {
    const output = {
        ...mergeModalitiesTokenDetails(a, b)
    };
    if (a?.reasoning !== void 0 || b?.reasoning !== void 0) output.reasoning = (a?.reasoning ?? 0) + (b?.reasoning ?? 0);
    return output;
}
function mergeUsageMetadata(a, b) {
    return {
        input_tokens: (a?.input_tokens ?? 0) + (b?.input_tokens ?? 0),
        output_tokens: (a?.output_tokens ?? 0) + (b?.output_tokens ?? 0),
        total_tokens: (a?.total_tokens ?? 0) + (b?.total_tokens ?? 0),
        input_token_details: mergeInputTokenDetails(a?.input_token_details, b?.input_token_details),
        output_token_details: mergeOutputTokenDetails(a?.output_token_details, b?.output_token_details)
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AIMessage",
    ()=>AIMessage,
    "AIMessageChunk",
    ()=>AIMessageChunk,
    "isAIMessage",
    ()=>isAIMessage,
    "isAIMessageChunk",
    ()=>isAIMessageChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/block_translators/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$metadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/metadata.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/tool.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [instrumentation] (ecmascript)");
;
;
;
;
;
//#region src/messages/ai.ts
function coerceToContentBlocks(value) {
    if (typeof value === "string") return value.length > 0 ? [
        {
            type: "text",
            text: value
        }
    ] : [];
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    return [
        value
    ];
}
var AIMessage = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessage"] {
    type = "ai";
    tool_calls = [];
    invalid_tool_calls = [];
    usage_metadata;
    get lc_aliases() {
        return {
            ...super.lc_aliases,
            tool_calls: "tool_calls",
            invalid_tool_calls: "invalid_tool_calls",
            usage_metadata: "usage_metadata"
        };
    }
    constructor(fields){
        let initParams;
        if (typeof fields === "string" || Array.isArray(fields)) initParams = {
            content: fields,
            tool_calls: [],
            invalid_tool_calls: [],
            additional_kwargs: {}
        };
        else {
            initParams = fields;
            const rawToolCalls = initParams.additional_kwargs?.tool_calls;
            const toolCalls = initParams.tool_calls;
            if (!(rawToolCalls == null) && rawToolCalls.length > 0 && (toolCalls === void 0 || toolCalls.length === 0)) console.warn([
                "New LangChain packages are available that more efficiently handle",
                "tool calling.\n\nPlease upgrade your packages to versions that set",
                "message tool calls. e.g., `pnpm install @langchain/anthropic`,",
                "pnpm install @langchain/openai`, etc."
            ].join(" "));
            try {
                if (!(rawToolCalls == null) && toolCalls === void 0) {
                    const [parsedToolCalls, invalidToolCalls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultToolCallParser"])(rawToolCalls);
                    initParams.tool_calls = parsedToolCalls ?? [];
                    initParams.invalid_tool_calls = invalidToolCalls ?? [];
                } else {
                    initParams.tool_calls = initParams.tool_calls ?? [];
                    initParams.invalid_tool_calls = initParams.invalid_tool_calls ?? [];
                }
            } catch  {
                initParams.tool_calls = [];
                initParams.invalid_tool_calls = [];
            }
            if (initParams.response_metadata !== void 0 && "output_version" in initParams.response_metadata && initParams.response_metadata.output_version === "v1" && initParams.content !== void 0) {
                initParams.contentBlocks = coerceToContentBlocks(initParams.content);
                initParams.content = void 0;
            }
            if (initParams.contentBlocks !== void 0) {
                if (!Array.isArray(initParams.contentBlocks)) initParams.contentBlocks = coerceToContentBlocks(initParams.contentBlocks);
                if (initParams.tool_calls) {
                    const missingContentBlockToolCalls = initParams.tool_calls.filter((toolCall)=>!initParams.contentBlocks?.some((block)=>block.type === "tool_call" && block.id === toolCall.id && block.name === toolCall.name));
                    initParams.contentBlocks.push(...missingContentBlockToolCalls.map((toolCall)=>({
                            type: "tool_call",
                            id: toolCall.id,
                            name: toolCall.name,
                            args: toolCall.args
                        })));
                }
                const missingToolCalls = initParams.contentBlocks.filter((block)=>block.type === "tool_call").filter((block)=>!initParams.tool_calls?.some((toolCall)=>toolCall.id === block.id && toolCall.name === block.name));
                if (missingToolCalls.length > 0) initParams.tool_calls = [
                    ...initParams.tool_calls ?? [],
                    ...missingToolCalls.map((block)=>({
                            type: "tool_call",
                            id: block.id,
                            name: block.name,
                            args: block.args
                        }))
                ];
            }
        }
        super(initParams);
        if (typeof initParams !== "string") {
            this.tool_calls = initParams.tool_calls ?? this.tool_calls;
            this.invalid_tool_calls = initParams.invalid_tool_calls ?? this.invalid_tool_calls;
        }
        this.usage_metadata = initParams.usage_metadata;
    }
    static lc_name() {
        return "AIMessage";
    }
    get contentBlocks() {
        if (this.response_metadata && "output_version" in this.response_metadata && this.response_metadata.output_version === "v1") return this.content;
        if (this.response_metadata && "model_provider" in this.response_metadata && typeof this.response_metadata.model_provider === "string") {
            const translator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTranslator"])(this.response_metadata.model_provider);
            if (translator) return translator.translateContent(this);
        }
        const blocks = super.contentBlocks;
        if (this.tool_calls) {
            const missingToolCalls = this.tool_calls.filter((block)=>!blocks.some((b)=>b.id === block.id && b.name === block.name));
            blocks.push(...missingToolCalls.map((block)=>({
                    type: "tool_call",
                    id: block.id,
                    name: block.name,
                    args: block.args
                })));
        }
        return blocks;
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            tool_calls: this.tool_calls,
            invalid_tool_calls: this.invalid_tool_calls,
            usage_metadata: this.usage_metadata
        };
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "ai";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
/**
* @deprecated Use {@link AIMessage.isInstance} instead
*/ function isAIMessage(x) {
    return x._getType() === "ai";
}
/**
* @deprecated Use {@link AIMessageChunk.isInstance} instead
*/ function isAIMessageChunk(x) {
    return x._getType() === "ai";
}
/**
* Represents a chunk of an AI message, which can be concatenated with
* other AI message chunks.
*/ var AIMessageChunk = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessageChunk"] {
    type = "ai";
    tool_calls = [];
    invalid_tool_calls = [];
    tool_call_chunks = [];
    usage_metadata;
    constructor(fields){
        let initParams;
        if (typeof fields === "string" || Array.isArray(fields)) initParams = {
            content: fields,
            tool_calls: [],
            invalid_tool_calls: [],
            tool_call_chunks: []
        };
        else if (fields.tool_call_chunks === void 0 || fields.tool_call_chunks.length === 0) initParams = {
            ...fields,
            tool_calls: fields.tool_calls ?? [],
            invalid_tool_calls: [],
            tool_call_chunks: [],
            usage_metadata: fields.usage_metadata !== void 0 ? fields.usage_metadata : void 0
        };
        else {
            const collapsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseToolCallChunks"])(fields.tool_call_chunks ?? []);
            initParams = {
                ...fields,
                tool_call_chunks: collapsed.tool_call_chunks,
                tool_calls: collapsed.tool_calls,
                invalid_tool_calls: collapsed.invalid_tool_calls,
                usage_metadata: fields.usage_metadata !== void 0 ? fields.usage_metadata : void 0
            };
        }
        super(initParams);
        this.tool_call_chunks = initParams.tool_call_chunks ?? this.tool_call_chunks;
        this.tool_calls = initParams.tool_calls ?? this.tool_calls;
        this.invalid_tool_calls = initParams.invalid_tool_calls ?? this.invalid_tool_calls;
        this.usage_metadata = initParams.usage_metadata;
    }
    get lc_aliases() {
        return {
            ...super.lc_aliases,
            tool_calls: "tool_calls",
            invalid_tool_calls: "invalid_tool_calls",
            tool_call_chunks: "tool_call_chunks",
            usage_metadata: "usage_metadata"
        };
    }
    static lc_name() {
        return "AIMessageChunk";
    }
    get contentBlocks() {
        if (this.response_metadata && "output_version" in this.response_metadata && this.response_metadata.output_version === "v1") return this.content;
        if (this.response_metadata && "model_provider" in this.response_metadata && typeof this.response_metadata.model_provider === "string") {
            const translator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$block_translators$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTranslator"])(this.response_metadata.model_provider);
            if (translator) return translator.translateContent(this);
        }
        const blocks = super.contentBlocks;
        if (this.tool_calls) {
            if (typeof this.content !== "string") {
                const contentToolCalls = this.content.filter((block)=>block.type === "tool_call").map((block)=>block.id);
                for (const toolCall of this.tool_calls)if (toolCall.id && !contentToolCalls.includes(toolCall.id)) blocks.push({
                    ...toolCall,
                    type: "tool_call",
                    id: toolCall.id,
                    name: toolCall.name,
                    args: toolCall.args
                });
            }
        }
        return blocks;
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            tool_calls: this.tool_calls,
            tool_call_chunks: this.tool_call_chunks,
            invalid_tool_calls: this.invalid_tool_calls,
            usage_metadata: this.usage_metadata
        };
    }
    concat(chunk) {
        const combinedFields = {
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"])(this.content, chunk.content),
            additional_kwargs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$metadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeResponseMetadata"])(this.response_metadata, chunk.response_metadata),
            tool_call_chunks: [],
            tool_calls: [],
            id: this.id ?? chunk.id
        };
        if (this.tool_call_chunks !== void 0 || chunk.tool_call_chunks !== void 0) {
            const rawToolCalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeLists"])(this.tool_call_chunks, chunk.tool_call_chunks);
            if (rawToolCalls !== void 0 && rawToolCalls.length > 0) combinedFields.tool_call_chunks = rawToolCalls;
        }
        if (this.tool_calls !== void 0 || chunk.tool_calls !== void 0) {
            const rawToolCalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeLists"])(this.tool_calls, chunk.tool_calls);
            if (rawToolCalls !== void 0 && rawToolCalls.length > 0) combinedFields.tool_calls = rawToolCalls;
        }
        if (this.usage_metadata !== void 0 || chunk.usage_metadata !== void 0) combinedFields.usage_metadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$metadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeUsageMetadata"])(this.usage_metadata, chunk.usage_metadata);
        const Cls = this.constructor;
        return new Cls(combinedFields);
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "ai";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/chat.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatMessage",
    ()=>ChatMessage,
    "ChatMessageChunk",
    ()=>ChatMessageChunk,
    "isChatMessage",
    ()=>isChatMessage,
    "isChatMessageChunk",
    ()=>isChatMessageChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
;
//#region src/messages/chat.ts
/**
* Represents a chat message in a conversation.
*/ var ChatMessage = class ChatMessage extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessage"] {
    static lc_name() {
        return "ChatMessage";
    }
    type = "generic";
    role;
    static _chatMessageClass() {
        return ChatMessage;
    }
    constructor(fields, role){
        if (typeof fields === "string" || Array.isArray(fields)) fields = {
            content: fields,
            role
        };
        super(fields);
        this.role = fields.role;
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "generic";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            role: this.role
        };
    }
};
/**
* Represents a chunk of a chat message, which can be concatenated with
* other chat message chunks.
*/ var ChatMessageChunk = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessageChunk"] {
    static lc_name() {
        return "ChatMessageChunk";
    }
    type = "generic";
    role;
    constructor(fields, role){
        if (typeof fields === "string" || Array.isArray(fields)) fields = {
            content: fields,
            role
        };
        super(fields);
        this.role = fields.role;
    }
    concat(chunk) {
        const Cls = this.constructor;
        return new Cls({
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"])(this.content, chunk.content),
            additional_kwargs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.response_metadata, chunk.response_metadata),
            role: this.role,
            id: this.id ?? chunk.id
        });
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "generic";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            role: this.role
        };
    }
};
/**
* @deprecated Use {@link ChatMessage.isInstance} instead
*/ function isChatMessage(x) {
    return x._getType() === "generic";
}
/**
* @deprecated Use {@link ChatMessageChunk.isInstance} instead
*/ function isChatMessageChunk(x) {
    return x._getType() === "generic";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/function.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FunctionMessage",
    ()=>FunctionMessage,
    "FunctionMessageChunk",
    ()=>FunctionMessageChunk,
    "isFunctionMessage",
    ()=>isFunctionMessage,
    "isFunctionMessageChunk",
    ()=>isFunctionMessageChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
;
//#region src/messages/function.ts
/**
* Represents a function message in a conversation.
*/ var FunctionMessage = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessage"] {
    static lc_name() {
        return "FunctionMessage";
    }
    type = "function";
    name;
    constructor(fields){
        super(fields);
        this.name = fields.name;
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "function";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
/**
* Represents a chunk of a function message, which can be concatenated
* with other function message chunks.
*/ var FunctionMessageChunk = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessageChunk"] {
    static lc_name() {
        return "FunctionMessageChunk";
    }
    type = "function";
    concat(chunk) {
        const Cls = this.constructor;
        return new Cls({
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"])(this.content, chunk.content),
            additional_kwargs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.response_metadata, chunk.response_metadata),
            name: this.name ?? "",
            id: this.id ?? chunk.id
        });
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "function";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
function isFunctionMessage(x) {
    return x._getType() === "function";
}
function isFunctionMessageChunk(x) {
    return x._getType() === "function";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HumanMessage",
    ()=>HumanMessage,
    "HumanMessageChunk",
    ()=>HumanMessageChunk,
    "isHumanMessage",
    ()=>isHumanMessage,
    "isHumanMessageChunk",
    ()=>isHumanMessageChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
;
//#region src/messages/human.ts
/**
* Represents a human message in a conversation.
*/ var HumanMessage = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessage"] {
    static lc_name() {
        return "HumanMessage";
    }
    type = "human";
    constructor(fields){
        super(fields);
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "human";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
/**
* Represents a chunk of a human message, which can be concatenated with
* other human message chunks.
*/ var HumanMessageChunk = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessageChunk"] {
    static lc_name() {
        return "HumanMessageChunk";
    }
    type = "human";
    constructor(fields){
        super(fields);
    }
    concat(chunk) {
        const Cls = this.constructor;
        return new Cls({
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"])(this.content, chunk.content),
            additional_kwargs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.response_metadata, chunk.response_metadata),
            id: this.id ?? chunk.id
        });
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "human";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
/**
* @deprecated Use {@link HumanMessage.isInstance} instead
*/ function isHumanMessage(x) {
    return x.getType() === "human";
}
/**
* @deprecated Use {@link HumanMessageChunk.isInstance} instead
*/ function isHumanMessageChunk(x) {
    return x.getType() === "human";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/modifier.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RemoveMessage",
    ()=>RemoveMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
;
//#region src/messages/modifier.ts
/**
* Message responsible for deleting other messages.
*
* `RemoveMessage` is intentionally not generic over `MessageStructure`.
* Its content is always `[]` (empty), so carrying a structure type parameter
* would only cause unnecessary type incompatibilities when mixing messages
* from different structure configurations (e.g. passing a `RemoveMessage`
* into an API that expects `Message<CustomToolCall>`).
*/ var RemoveMessage = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessage"] {
    type = "remove";
    /**
	* The ID of the message to remove.
	*/ id;
    constructor(fields){
        super({
            ...fields,
            content: []
        });
        this.id = fields.id;
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            id: this.id
        };
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "remove";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/system.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SystemMessage",
    ()=>SystemMessage,
    "SystemMessageChunk",
    ()=>SystemMessageChunk,
    "isSystemMessage",
    ()=>isSystemMessage,
    "isSystemMessageChunk",
    ()=>isSystemMessageChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
;
//#region src/messages/system.ts
/**
* Represents a system message in a conversation.
*/ var SystemMessage = class SystemMessage extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessage"] {
    static lc_name() {
        return "SystemMessage";
    }
    type = "system";
    constructor(fields){
        super(fields);
    }
    /**
	* Concatenates a string or another system message with the current system message.
	* @param chunk - The chunk to concatenate with the system message.
	* @returns A new system message with the concatenated content.
	*/ concat(chunk) {
        if (typeof chunk === "string") return new SystemMessage({
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"])(this.content, chunk),
            additional_kwargs: this.additional_kwargs,
            response_metadata: this.response_metadata,
            id: this.id,
            name: this.name
        });
        if (SystemMessage.isInstance(chunk)) return new SystemMessage({
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"])(this.content, chunk.content),
            additional_kwargs: {
                ...this.additional_kwargs,
                ...chunk.additional_kwargs
            },
            response_metadata: {
                ...this.response_metadata,
                ...chunk.response_metadata
            },
            id: this.id ?? chunk.id,
            name: this.name ?? chunk.name
        });
        throw new Error("Unexpected chunk type for system message");
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "system";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
/**
* Represents a chunk of a system message, which can be concatenated with
* other system message chunks.
*/ var SystemMessageChunk = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessageChunk"] {
    static lc_name() {
        return "SystemMessageChunk";
    }
    type = "system";
    constructor(fields){
        super(fields);
    }
    concat(chunk) {
        const Cls = this.constructor;
        return new Cls({
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"])(this.content, chunk.content),
            additional_kwargs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"])(this.response_metadata, chunk.response_metadata),
            id: this.id ?? chunk.id
        });
    }
    static isInstance(obj) {
        return super.isInstance(obj) && obj.type === "system";
    }
    static [Symbol.hasInstance](obj) {
        return this.isInstance(obj);
    }
};
/**
* @deprecated Use {@link SystemMessage.isInstance} instead
*/ function isSystemMessage(x) {
    return x._getType() === "system";
}
/**
* @deprecated Use {@link SystemMessageChunk.isInstance} instead
*/ function isSystemMessageChunk(x) {
    return x._getType() === "system";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "coerceMessageLikeToMessage",
    ()=>coerceMessageLikeToMessage,
    "collapseToolCallChunks",
    ()=>collapseToolCallChunks,
    "convertToChunk",
    ()=>convertToChunk,
    "getBufferString",
    ()=>getBufferString,
    "iife",
    ()=>iife,
    "mapChatMessagesToStoredMessages",
    ()=>mapChatMessagesToStoredMessages,
    "mapStoredMessageToChatMessage",
    ()=>mapStoredMessageToChatMessage,
    "mapStoredMessagesToChatMessages",
    ()=>mapStoredMessagesToChatMessages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/errors/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/utils.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/tool.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/chat.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/function.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$modifier$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/modifier.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/system.js [instrumentation] (ecmascript)");
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
//#region src/messages/utils.ts
function chunkUsesRawInputArgs(chunk) {
    return chunk.isCustomTool === true;
}
/**
* Immediately-invoked function expression.
*
* @param fn - The function to execute
* @returns The result of the function
*/ const iife = (fn)=>fn();
function _coerceToolCall(toolCall) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isToolCall"])(toolCall)) return toolCall;
    else if (typeof toolCall.id === "string" && toolCall.type === "function" && typeof toolCall.function === "object" && toolCall.function !== null && "arguments" in toolCall.function && typeof toolCall.function.arguments === "string" && "name" in toolCall.function && typeof toolCall.function.name === "string") return {
        id: toolCall.id,
        args: JSON.parse(toolCall.function.arguments),
        name: toolCall.function.name,
        type: "tool_call"
    };
    else return toolCall;
}
function isSerializedConstructor(x) {
    return typeof x === "object" && x != null && x.lc === 1 && Array.isArray(x.id) && x.kwargs != null && typeof x.kwargs === "object";
}
function _constructMessageFromParams(params) {
    let type;
    let rest;
    if (isSerializedConstructor(params)) {
        const className = params.id.at(-1);
        if (className === "HumanMessage" || className === "HumanMessageChunk") type = "user";
        else if (className === "AIMessage" || className === "AIMessageChunk") type = "assistant";
        else if (className === "SystemMessage" || className === "SystemMessageChunk") type = "system";
        else if (className === "FunctionMessage" || className === "FunctionMessageChunk") type = "function";
        else if (className === "ToolMessage" || className === "ToolMessageChunk") type = "tool";
        else type = "unknown";
        rest = params.kwargs;
    } else {
        const { type: extractedType, ...otherParams } = params;
        type = extractedType;
        rest = otherParams;
    }
    if (type === "human" || type === "user") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessage"](rest);
    else if (type === "ai" || type === "assistant") {
        const { tool_calls: rawToolCalls, ...other } = rest;
        if (!Array.isArray(rawToolCalls)) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessage"](rest);
        const tool_calls = rawToolCalls.map(_coerceToolCall);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessage"]({
            ...other,
            tool_calls
        });
    } else if (type === "system") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessage"](rest);
    else if (type === "developer") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessage"]({
        ...rest,
        additional_kwargs: {
            ...rest.additional_kwargs,
            __openai_role__: "developer"
        }
    });
    else if (type === "tool" && "tool_call_id" in rest) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolMessage"]({
        ...rest,
        content: rest.content,
        tool_call_id: rest.tool_call_id,
        name: rest.name
    });
    else if (type === "remove" && "id" in rest && typeof rest.id === "string") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$modifier$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RemoveMessage"]({
        ...rest,
        id: rest.id
    });
    else throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["addLangChainErrorFields"])(/* @__PURE__ */ new Error(`Unable to coerce message from array: only human, AI, system, developer, or tool message coercion is currently supported.\n\nReceived: ${JSON.stringify(params, null, 2)}`), "MESSAGE_COERCION_FAILURE");
}
function coerceMessageLikeToMessage(messageLike) {
    if (typeof messageLike === "string") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessage"](messageLike);
    else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBaseMessage"])(messageLike)) return messageLike;
    if (Array.isArray(messageLike)) {
        const [type, content] = messageLike;
        return _constructMessageFromParams({
            type,
            content
        });
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isMessageFieldWithRole"])(messageLike)) {
        const { role: type, ...rest } = messageLike;
        return _constructMessageFromParams({
            ...rest,
            type
        });
    } else return _constructMessageFromParams(messageLike);
}
/**
* Renders a single content block to a compact string representation.
* Text blocks are returned as-is; multimodal blocks (image, audio, video, file)
* become short placeholders like `[image]` so their existence is preserved
* without inflating token counts with base64 data or metadata.
*/ function _contentBlockToString(block) {
    if (typeof block === "string") return block;
    switch(block.type){
        case "text":
            return block.text ?? "";
        case "text-plain":
            return block.text ?? "[text-plain file]";
        case "image":
        case "image_url":
            return "[image]";
        case "audio":
        case "input_audio":
            return "[audio]";
        case "video":
            return "[video]";
        case "file":
            return "[file]";
        case "reasoning":
        case "tool_call":
        case "tool_call_chunk":
        case "invalid_tool_call":
        case "server_tool_call":
        case "server_tool_call_chunk":
        case "server_tool_call_result":
        case "non_standard":
            return "";
        default:
            return block.type ? `[${block.type}]` : "";
    }
}
const TOOL_CALL_ID_DISPLAY_LIMIT = 64;
/**
* This function is used by memory classes to get a string representation
* of the chat message history, based on the message content and role.
*
* Produces compact output like:
* ```
* Human: What's the weather?
* AI: Let me check...[tool_calls]
* Tool: 72°F and sunny
* ```
*
* This avoids token inflation from metadata when stringifying message objects directly.
* Tool-call IDs longer than 64 characters are shortened only in the rendered string.
*/ function getBufferString(messages, humanPrefix = "Human", aiPrefix = "AI") {
    const string_messages = [];
    for (const m of messages){
        let role;
        if (m.type === "human") role = humanPrefix;
        else if (m.type === "ai") role = aiPrefix;
        else if (m.type === "system") role = "System";
        else if (m.type === "tool") role = "Tool";
        else if (m.type === "generic") role = m.role;
        else throw new Error(`Got unsupported message type: ${m.type}`);
        const nameStr = m.name ? `${m.name}, ` : "";
        const readableContent = typeof m.content === "string" ? m.content : Array.isArray(m.content) ? m.content.map(_contentBlockToString).filter(Boolean).join("") : "";
        let message = `${role}: ${nameStr}${readableContent}`;
        if (m.type === "ai") {
            const aiMessage = m;
            if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
                const toolCalls = aiMessage.tool_calls;
                message += JSON.stringify(toolCalls.some((call)=>(call.id?.length ?? 0) > TOOL_CALL_ID_DISPLAY_LIMIT) ? toolCalls.map((call)=>call.id && call.id.length > TOOL_CALL_ID_DISPLAY_LIMIT ? {
                        ...call,
                        id: `${call.id.slice(0, TOOL_CALL_ID_DISPLAY_LIMIT)}...`
                    } : call) : toolCalls);
            } else if (aiMessage.additional_kwargs && "function_call" in aiMessage.additional_kwargs) message += JSON.stringify(aiMessage.additional_kwargs.function_call);
        }
        string_messages.push(message);
    }
    return string_messages.join("\n");
}
/**
* Maps messages from an older format (V1) to the current `StoredMessage`
* format. If the message is already in the `StoredMessage` format, it is
* returned as is. Otherwise, it transforms the V1 message into a
* `StoredMessage`. This function is important for maintaining
* compatibility with older message formats.
*/ function mapV1MessageToStoredMessage(message) {
    if (message.data !== void 0) return message;
    else {
        const v1Message = message;
        return {
            type: v1Message.type,
            data: {
                content: v1Message.text,
                role: v1Message.role,
                name: void 0,
                tool_call_id: void 0
            }
        };
    }
}
function mapStoredMessageToChatMessage(message) {
    const storedMessage = mapV1MessageToStoredMessage(message);
    switch(storedMessage.type){
        case "human":
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessage"](storedMessage.data);
        case "ai":
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessage"](storedMessage.data);
        case "system":
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessage"](storedMessage.data);
        case "function":
            if (storedMessage.data.name === void 0) throw new Error("Name must be defined for function messages");
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["FunctionMessage"](storedMessage.data);
        case "tool":
            if (storedMessage.data.tool_call_id === void 0) throw new Error("Tool call ID must be defined for tool messages");
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolMessage"](storedMessage.data);
        case "generic":
            if (storedMessage.data.role === void 0) throw new Error("Role must be defined for chat messages");
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessage"](storedMessage.data);
        default:
            throw new Error(`Got unexpected type: ${storedMessage.type}`);
    }
}
/**
* Transforms an array of `StoredMessage` instances into an array of
* `BaseMessage` instances. It uses the `mapV1MessageToStoredMessage`
* function to ensure all messages are in the `StoredMessage` format, then
* creates new instances of the appropriate `BaseMessage` subclass based
* on the type of each message. This function is used to prepare stored
* messages for use in a chat context.
*/ function mapStoredMessagesToChatMessages(messages) {
    return messages.map(mapStoredMessageToChatMessage);
}
/**
* Transforms an array of `BaseMessage` instances into an array of
* `StoredMessage` instances. It does this by calling the `toDict` method
* on each `BaseMessage`, which returns a `StoredMessage`. This function
* is used to prepare chat messages for storage.
*/ function mapChatMessagesToStoredMessages(messages) {
    return messages.map((message)=>message.toDict());
}
function convertToChunk(message) {
    const type = message._getType();
    if (type === "human") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessageChunk"]({
        ...message
    });
    else if (type === "ai") {
        let aiChunkFields = {
            ...message
        };
        if ("tool_calls" in aiChunkFields) aiChunkFields = {
            ...aiChunkFields,
            tool_call_chunks: aiChunkFields.tool_calls?.map((tc)=>({
                    ...tc,
                    type: "tool_call_chunk",
                    index: void 0,
                    args: JSON.stringify(tc.args)
                }))
        };
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessageChunk"]({
            ...aiChunkFields
        });
    } else if (type === "system") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessageChunk"]({
        ...message
    });
    else if (type === "function") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["FunctionMessageChunk"]({
        ...message
    });
    else if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessage"].isInstance(message)) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessageChunk"]({
        ...message
    });
    else throw new Error("Unknown message type.");
}
/**
* Collapses an array of tool call chunks into complete tool calls.
*
* This function groups tool call chunks by their id and/or index, then attempts to
* parse and validate the accumulated arguments for each group. Successfully parsed
* tool calls are returned as valid `ToolCall` objects, while malformed ones are
* returned as `InvalidToolCall` objects.
*
* @param chunks - An array of `ToolCallChunk` objects to collapse
* @returns An object containing:
*   - `tool_call_chunks`: The original input chunks
*   - `tool_calls`: An array of successfully parsed and validated tool calls
*   - `invalid_tool_calls`: An array of tool calls that failed parsing or validation
*
* @remarks
* Chunks are grouped using the following matching logic:
* - If a chunk has both an id and index, it matches chunks with the same id and index
* - If a chunk has only an id, it matches chunks with the same id
* - If a chunk has only an index, it matches chunks with the same index
*
* For each group, the function:
* 1. Concatenates all `args` strings from the chunks
* 2. Attempts to parse the concatenated string as JSON
* 3. Validates that the result is a non-null object with a valid id
* 4. Creates either a `ToolCall` (if valid) or `InvalidToolCall` (if invalid)
*/ function collapseToolCallChunks(chunks) {
    const groupedToolCallChunks = chunks.reduce((acc, chunk)=>{
        const matchedChunkIndex = acc.findIndex(([match])=>{
            if ("id" in chunk && chunk.id && "index" in chunk && chunk.index !== void 0) return chunk.id === match.id && chunk.index === match.index;
            if ("id" in chunk && chunk.id) return chunk.id === match.id;
            if ("index" in chunk && chunk.index !== void 0) return chunk.index === match.index;
            return false;
        });
        if (matchedChunkIndex !== -1) acc[matchedChunkIndex].push(chunk);
        else acc.push([
            chunk
        ]);
        return acc;
    }, []);
    const toolCalls = [];
    const invalidToolCalls = [];
    for (const chunks of groupedToolCallChunks){
        let parsedArgs = null;
        const usesRawInputArgs = chunks.some(chunkUsesRawInputArgs);
        const name = chunks[0]?.name ?? "";
        const joinedArgsRaw = chunks.map((c)=>c.args || "").join("");
        const joinedArgs = usesRawInputArgs ? joinedArgsRaw : joinedArgsRaw.trim();
        const argsStr = joinedArgs.length ? joinedArgs : "{}";
        const id = chunks.find((c)=>c.id)?.id ?? chunks[0]?.id;
        if (usesRawInputArgs && id) {
            toolCalls.push({
                name,
                args: {
                    input: joinedArgs
                },
                id,
                type: "tool_call"
            });
            continue;
        }
        try {
            parsedArgs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parsePartialJson"])(argsStr);
            if (!id || parsedArgs === null || typeof parsedArgs !== "object" || Array.isArray(parsedArgs)) throw new Error("Malformed tool call chunk args.");
            toolCalls.push({
                name,
                args: parsedArgs,
                id,
                type: "tool_call"
            });
        } catch  {
            invalidToolCalls.push({
                name,
                args: argsStr,
                id,
                error: "Malformed args.",
                type: "invalid_tool_call"
            });
        }
    }
    return {
        tool_call_chunks: chunks,
        tool_calls: toolCalls,
        invalid_tool_calls: invalidToolCalls
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/transformers.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultTextSplitter",
    ()=>defaultTextSplitter,
    "filterMessages",
    ()=>filterMessages,
    "mergeMessageRuns",
    ()=>mergeMessageRuns,
    "trimMessages",
    ()=>trimMessages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/tool.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/chat.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/function.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$modifier$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/modifier.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/system.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [instrumentation] (ecmascript)");
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
//#region src/messages/transformers.ts
const _isMessageType = (msg, types)=>{
    const typesAsStrings = [
        ...new Set(types?.map((t)=>{
            if (typeof t === "string") return t;
            const instantiatedMsgClass = new t({});
            if (!("getType" in instantiatedMsgClass) || typeof instantiatedMsgClass.getType !== "function") throw new Error("Invalid type provided.");
            return instantiatedMsgClass.getType();
        }))
    ];
    const msgType = msg.getType();
    return typesAsStrings.some((t)=>t === msgType);
};
function filterMessages(messagesOrOptions, options) {
    if (Array.isArray(messagesOrOptions)) return _filterMessages(messagesOrOptions, options);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableLambda"].from((input)=>{
        return _filterMessages(input, messagesOrOptions);
    });
}
function _filterMessages(messages, options = {}) {
    const { includeNames, excludeNames, includeTypes, excludeTypes, includeIds, excludeIds } = options;
    const filtered = [];
    for (const msg of messages){
        if (excludeNames && msg.name && excludeNames.includes(msg.name)) continue;
        else if (excludeTypes && _isMessageType(msg, excludeTypes)) continue;
        else if (excludeIds && msg.id && excludeIds.includes(msg.id)) continue;
        if (!(includeTypes || includeIds || includeNames)) filtered.push(msg);
        else if (includeNames && msg.name && includeNames.some((iName)=>iName === msg.name)) filtered.push(msg);
        else if (includeTypes && _isMessageType(msg, includeTypes)) filtered.push(msg);
        else if (includeIds && msg.id && includeIds.some((id)=>id === msg.id)) filtered.push(msg);
    }
    return filtered;
}
function mergeMessageRuns(messages) {
    if (Array.isArray(messages)) return _mergeMessageRuns(messages);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableLambda"].from(_mergeMessageRuns);
}
function _mergeMessageRuns(messages) {
    if (!messages.length) return [];
    const merged = [];
    for (const msg of messages){
        const curr = msg;
        const last = merged.pop();
        if (!last) merged.push(curr);
        else if (curr.getType() === "tool" || !(curr.getType() === last.getType())) merged.push(last, curr);
        else {
            const lastChunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToChunk"])(last);
            const currChunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToChunk"])(curr);
            const mergedChunks = lastChunk.concat(currChunk);
            if (typeof lastChunk.content === "string" && typeof currChunk.content === "string") mergedChunks.content = `${lastChunk.content}\n${currChunk.content}`;
            merged.push(_chunkToMsg(mergedChunks));
        }
    }
    return merged;
}
function trimMessages(messagesOrOptions, options) {
    if (Array.isArray(messagesOrOptions)) {
        const messages = messagesOrOptions;
        if (!options) throw new Error("Options parameter is required when providing messages.");
        return _trimMessagesHelper(messages, options);
    } else {
        const trimmerOptions = messagesOrOptions;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RunnableLambda"].from((input)=>_trimMessagesHelper(input, trimmerOptions)).withConfig({
            runName: "trim_messages"
        });
    }
}
async function _trimMessagesHelper(messages, options) {
    const { maxTokens, tokenCounter, strategy = "last", allowPartial = false, endOn, startOn, includeSystem = false, textSplitter } = options;
    if (startOn && strategy === "first") throw new Error("`startOn` should only be specified if `strategy` is 'last'.");
    if (includeSystem && strategy === "first") throw new Error("`includeSystem` should only be specified if `strategy` is 'last'.");
    let listTokenCounter;
    if ("getNumTokens" in tokenCounter) listTokenCounter = async (msgs)=>{
        return (await Promise.all(msgs.map((msg)=>tokenCounter.getNumTokens(msg.content)))).reduce((sum, count)=>sum + count, 0);
    };
    else listTokenCounter = async (msgs)=>tokenCounter(msgs);
    let textSplitterFunc = defaultTextSplitter;
    if (textSplitter) {
        if ("splitText" in textSplitter) textSplitterFunc = textSplitter.splitText.bind(textSplitter);
        else textSplitterFunc = async (text)=>textSplitter(text);
    }
    if (strategy === "first") return _firstMaxTokens(messages, {
        maxTokens,
        tokenCounter: listTokenCounter,
        textSplitter: textSplitterFunc,
        partialStrategy: allowPartial ? "first" : void 0,
        endOn
    });
    else if (strategy === "last") return _lastMaxTokens(messages, {
        maxTokens,
        tokenCounter: listTokenCounter,
        textSplitter: textSplitterFunc,
        allowPartial,
        includeSystem,
        startOn,
        endOn
    });
    else throw new Error(`Unrecognized strategy: '${strategy}'. Must be one of 'first' or 'last'.`);
}
async function _firstMaxTokens(messages, options) {
    const { maxTokens, tokenCounter, textSplitter, partialStrategy, endOn } = options;
    let messagesCopy = [
        ...messages
    ];
    let idx = 0;
    for(let i = 0; i < messagesCopy.length; i += 1)if (await tokenCounter(i > 0 ? messagesCopy.slice(0, -i) : messagesCopy) <= maxTokens) {
        idx = messagesCopy.length - i;
        break;
    }
    if (idx < messagesCopy.length && partialStrategy) {
        let includedPartial = false;
        if (Array.isArray(messagesCopy[idx].content)) {
            const excluded = messagesCopy[idx];
            if (typeof excluded.content === "string") throw new Error("Expected content to be an array.");
            const numBlock = excluded.content.length;
            const reversedContent = partialStrategy === "last" ? [
                ...excluded.content
            ].reverse() : excluded.content;
            for(let i = 1; i <= numBlock; i += 1){
                const partialContent = partialStrategy === "first" ? reversedContent.slice(0, i) : reversedContent.slice(-i);
                const fields = Object.fromEntries(Object.entries(excluded).filter(([k])=>k !== "type" && !k.startsWith("lc_")));
                const updatedMessage = _switchTypeToMessage(excluded.getType(), {
                    ...fields,
                    content: partialContent
                });
                const slicedMessages = [
                    ...messagesCopy.slice(0, idx),
                    updatedMessage
                ];
                if (await tokenCounter(slicedMessages) <= maxTokens) {
                    messagesCopy = slicedMessages;
                    idx += 1;
                    includedPartial = true;
                } else break;
            }
            if (includedPartial && partialStrategy === "last") excluded.content = [
                ...reversedContent
            ].reverse();
        }
        if (!includedPartial) {
            const excluded = messagesCopy[idx];
            let text;
            if (Array.isArray(excluded.content) && excluded.content.some((block)=>typeof block === "string" || block.type === "text")) text = excluded.content.find((block)=>block.type === "text" && block.text)?.text;
            else if (typeof excluded.content === "string") text = excluded.content;
            if (text) {
                const splitTexts = await textSplitter(text);
                const numSplits = splitTexts.length;
                if (partialStrategy === "last") splitTexts.reverse();
                for(let _ = 0; _ < numSplits - 1; _ += 1){
                    splitTexts.pop();
                    excluded.content = splitTexts.join("");
                    if (await tokenCounter([
                        ...messagesCopy.slice(0, idx),
                        excluded
                    ]) <= maxTokens) {
                        if (partialStrategy === "last") excluded.content = [
                            ...splitTexts
                        ].reverse().join("");
                        messagesCopy = [
                            ...messagesCopy.slice(0, idx),
                            excluded
                        ];
                        idx += 1;
                        break;
                    }
                }
            }
        }
    }
    if (endOn) {
        const endOnArr = Array.isArray(endOn) ? endOn : [
            endOn
        ];
        while(idx > 0 && !_isMessageType(messagesCopy[idx - 1], endOnArr))idx -= 1;
    }
    return messagesCopy.slice(0, idx);
}
async function _lastMaxTokens(messages, options) {
    const { allowPartial = false, includeSystem = false, endOn, startOn, ...rest } = options;
    let messagesCopy = messages.map((message)=>{
        const fields = Object.fromEntries(Object.entries(message).filter(([k])=>k !== "type" && !k.startsWith("lc_")));
        return _switchTypeToMessage(message.getType(), fields, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBaseMessageChunk"])(message));
    });
    if (endOn) {
        const endOnArr = Array.isArray(endOn) ? endOn : [
            endOn
        ];
        while(messagesCopy.length > 0 && !_isMessageType(messagesCopy[messagesCopy.length - 1], endOnArr))messagesCopy = messagesCopy.slice(0, -1);
    }
    const swappedSystem = includeSystem && messagesCopy[0]?.getType() === "system";
    let reversed_ = swappedSystem ? messagesCopy.slice(0, 1).concat(messagesCopy.slice(1).reverse()) : messagesCopy.reverse();
    reversed_ = await _firstMaxTokens(reversed_, {
        ...rest,
        partialStrategy: allowPartial ? "last" : void 0,
        endOn: startOn
    });
    if (swappedSystem) return [
        reversed_[0],
        ...reversed_.slice(1).reverse()
    ];
    else return reversed_.reverse();
}
const _MSG_CHUNK_MAP = {
    human: {
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessage"],
        messageChunk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessageChunk"]
    },
    ai: {
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessage"],
        messageChunk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessageChunk"]
    },
    system: {
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessage"],
        messageChunk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessageChunk"]
    },
    developer: {
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessage"],
        messageChunk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessageChunk"]
    },
    tool: {
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolMessage"],
        messageChunk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolMessageChunk"]
    },
    function: {
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["FunctionMessage"],
        messageChunk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["FunctionMessageChunk"]
    },
    generic: {
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessage"],
        messageChunk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessageChunk"]
    },
    remove: {
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$modifier$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RemoveMessage"],
        messageChunk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$modifier$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RemoveMessage"]
    }
};
function _switchTypeToMessage(messageType, fields, returnChunk) {
    let chunk;
    let msg;
    switch(messageType){
        case "human":
            if (returnChunk) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessageChunk"](fields);
            else msg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessage"](fields);
            break;
        case "ai":
            if (returnChunk) {
                let aiChunkFields = {
                    ...fields
                };
                if ("tool_calls" in aiChunkFields) aiChunkFields = {
                    ...aiChunkFields,
                    tool_call_chunks: aiChunkFields.tool_calls?.map((tc)=>({
                            ...tc,
                            type: "tool_call_chunk",
                            index: void 0,
                            args: JSON.stringify(tc.args)
                        }))
                };
                chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessageChunk"](aiChunkFields);
            } else msg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessage"](fields);
            break;
        case "system":
            if (returnChunk) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessageChunk"](fields);
            else msg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessage"](fields);
            break;
        case "developer":
            if (returnChunk) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessageChunk"]({
                ...fields,
                additional_kwargs: {
                    ...fields.additional_kwargs,
                    __openai_role__: "developer"
                }
            });
            else msg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessage"]({
                ...fields,
                additional_kwargs: {
                    ...fields.additional_kwargs,
                    __openai_role__: "developer"
                }
            });
            break;
        case "tool":
            if ("tool_call_id" in fields) {
                if (returnChunk) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolMessageChunk"](fields);
                else msg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolMessage"](fields);
            } else throw new Error("Can not convert ToolMessage to ToolMessageChunk if 'tool_call_id' field is not defined.");
            break;
        case "function":
            if (returnChunk) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["FunctionMessageChunk"](fields);
            else {
                if (!fields.name) throw new Error("FunctionMessage must have a 'name' field");
                msg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["FunctionMessage"](fields);
            }
            break;
        case "generic":
            if ("role" in fields) {
                if (returnChunk) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessageChunk"](fields);
                else msg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessage"](fields);
            } else throw new Error("Can not convert ChatMessage to ChatMessageChunk if 'role' field is not defined.");
            break;
        default:
            throw new Error(`Unrecognized message type ${messageType}`);
    }
    if (returnChunk && chunk) return chunk;
    if (msg) return msg;
    throw new Error(`Unrecognized message type ${messageType}`);
}
function _chunkToMsg(chunk) {
    const chunkType = chunk.getType();
    let msg;
    const fields = Object.fromEntries(Object.entries(chunk).filter(([k])=>![
            "type",
            "tool_call_chunks"
        ].includes(k) && !k.startsWith("lc_")));
    if (chunkType in _MSG_CHUNK_MAP) msg = _switchTypeToMessage(chunkType, fields);
    if (!msg) throw new Error(`Unrecognized message chunk class ${chunkType}. Supported classes are ${Object.keys(_MSG_CHUNK_MAP)}`);
    return msg;
}
/**
* The default text splitter function that splits text by newlines.
*
* @param {string} text
* @returns A promise that resolves to an array of strings split by newlines.
*/ function defaultTextSplitter(text) {
    const splits = text.split("\n");
    return Promise.resolve([
        ...splits.slice(0, -1).map((s)=>`${s}\n`),
        splits[splits.length - 1]
    ]);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/tools.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KNOWN_BLOCK_TYPES",
    ()=>KNOWN_BLOCK_TYPES
]);
//#region src/messages/content/tools.ts
const KNOWN_BLOCK_TYPES = [
    "tool_call",
    "tool_call_chunk",
    "invalid_tool_call",
    "server_tool_call",
    "server_tool_call_chunk",
    "server_tool_call_result"
];
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/multimodal.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KNOWN_BLOCK_TYPES",
    ()=>KNOWN_BLOCK_TYPES
]);
//#region src/messages/content/multimodal.ts
const KNOWN_BLOCK_TYPES = [
    "image",
    "video",
    "audio",
    "text-plain",
    "file"
];
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KNOWN_BLOCK_TYPES",
    ()=>KNOWN_BLOCK_TYPES
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$tools$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/tools.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$multimodal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/multimodal.js [instrumentation] (ecmascript)");
;
;
//#region src/messages/content/index.ts
const KNOWN_BLOCK_TYPES = [
    "text",
    "reasoning",
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$tools$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["KNOWN_BLOCK_TYPES"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$multimodal$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["KNOWN_BLOCK_TYPES"]
];
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "messages_exports",
    ()=>messages_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/data.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$message$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/message.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$metadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/metadata.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/tool.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/chat.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/function.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$modifier$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/modifier.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/system.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$transformers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/transformers.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/content/index.js [instrumentation] (ecmascript)");
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
//#region src/messages/index.ts
var messages_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["__exportAll"])({
    AIMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessage"],
    AIMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["AIMessageChunk"],
    BaseMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessage"],
    BaseMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseMessageChunk"],
    ChatMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessage"],
    ChatMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatMessageChunk"],
    DEFAULT_MERGE_IGNORE_KEYS: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_MERGE_IGNORE_KEYS"],
    FunctionMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["FunctionMessage"],
    FunctionMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["FunctionMessageChunk"],
    HumanMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessage"],
    HumanMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HumanMessageChunk"],
    KNOWN_BLOCK_TYPES: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["KNOWN_BLOCK_TYPES"],
    RemoveMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$modifier$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RemoveMessage"],
    SystemMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessage"],
    SystemMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SystemMessageChunk"],
    ToolMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolMessage"],
    ToolMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ToolMessageChunk"],
    _isMessageFieldWithRole: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_isMessageFieldWithRole"],
    _mergeDicts: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeDicts"],
    _mergeLists: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeLists"],
    _mergeObj: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeObj"],
    _mergeStatus: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["_mergeStatus"],
    coerceMessageLikeToMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"],
    collapseToolCallChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseToolCallChunks"],
    convertToChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToChunk"],
    convertToOpenAIImageBlock: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToOpenAIImageBlock"],
    convertToProviderContentBlock: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertToProviderContentBlock"],
    defaultTextSplitter: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$transformers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultTextSplitter"],
    defaultToolCallParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultToolCallParser"],
    filterMessages: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$transformers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["filterMessages"],
    getBufferString: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getBufferString"],
    iife: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["iife"],
    isAIMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAIMessage"],
    isAIMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAIMessageChunk"],
    isBase64ContentBlock: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBase64ContentBlock"],
    isBaseMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBaseMessage"],
    isBaseMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBaseMessageChunk"],
    isChatMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isChatMessage"],
    isChatMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isChatMessageChunk"],
    isDataContentBlock: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isDataContentBlock"],
    isDirectToolOutput: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isDirectToolOutput"],
    isFunctionMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFunctionMessage"],
    isFunctionMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$function$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFunctionMessageChunk"],
    isHumanMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isHumanMessage"],
    isHumanMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isHumanMessageChunk"],
    isIDContentBlock: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isIDContentBlock"],
    isMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$message$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isMessage"],
    isOpenAIToolCallArray: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isOpenAIToolCallArray"],
    isPlainTextContentBlock: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isPlainTextContentBlock"],
    isSystemMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSystemMessage"],
    isSystemMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSystemMessageChunk"],
    isToolMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isToolMessage"],
    isToolMessageChunk: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isToolMessageChunk"],
    isURLContentBlock: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isURLContentBlock"],
    mapChatMessagesToStoredMessages: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapChatMessagesToStoredMessages"],
    mapStoredMessageToChatMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapStoredMessageToChatMessage"],
    mapStoredMessagesToChatMessages: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapStoredMessagesToChatMessages"],
    mergeContent: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeContent"],
    mergeMessageRuns: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$transformers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeMessageRuns"],
    mergeResponseMetadata: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$metadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeResponseMetadata"],
    mergeUsageMetadata: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$metadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeUsageMetadata"],
    parseBase64DataUrl: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseBase64DataUrl"],
    parseMimeType: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseMimeType"],
    trimMessages: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$transformers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["trimMessages"]
});
;
}),
];

//# sourceMappingURL=09_2_%40langchain_core_dist_messages_0-ku6_6._.js.map