const path = require("path");
const WebpackObfuscator = require("webpack-obfuscator");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./backend.js", // Replace with the path to your entry JavaScript file
  output: {
    path: path.resolve(__dirname, "./"),
    filename: "webterm.js", // Output filename
  },
  mode: "none",
  target: "node",
  externals: [nodeExternals({ modulesFromFile: true })],
  plugins: [
    new WebpackObfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      identifierNamesGenerator: "hexadecimal",
      renameGlobals: true,
      splitStrings: true,
      splitStringsChunkLength: 2,
      stringArray: true,
      stringArrayThreshold: 0.9,
      target: "node",
      transformObjectKeys: true,
      ignoreImports: true,
      disableConsoleOutput: false,
      numbersToExpressions: true,
      stringArrayCallsTransform: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 5,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 5,
      stringArrayWrappersType: "function",
      unicodeEscapeSequence: true,
    }),
  ],
  resolve: {
    extensions: [".js", ".cjs"],
  },
};
