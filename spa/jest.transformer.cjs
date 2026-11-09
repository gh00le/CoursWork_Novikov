const ts = require("typescript");
module.exports = {
  process(sourceText, sourcePath) {
    const compiled = ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    });
    return { code: compiled.outputText };
  },
};
