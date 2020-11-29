import vm from "vm-browserify";

// const isBuffer = Buffer.isBuffer;

function merge(a, b) {
  if (!a || !b) return a;
  const keys = Object.keys(b);
  for (let k, i = 0, n = keys.length; i < n; i++) {
    k = keys[i];
    a[k] = b[k];
  }
  return a;
}

// Return the exports/module.exports constiable set in the content
// content (String|VmScript): required
export function _eval(content, filename, scope, includeGlobals, resolve?: (value?: (PromiseLike<any> | any)) => void, reject?: (reason?: any) => void) {

  if (typeof filename !== 'string') {
    if (typeof filename === 'object') {
      includeGlobals = scope;
      scope = filename;
      filename = '';
    } else if (typeof filename === 'boolean') {
      includeGlobals = filename;
      scope = {};
      filename = '';
    }
  }

  // Expose standard Node globals
  const sandbox: {
    console?,
    process?,
    require?,
    exports?,
    module?,
    global?,
    export?,
    returnValue?,
    setTimeoutNew?,
    fetch?
    [key:string]: any // libs
  } = {};
  const exports = {};
  // const _filename = filename || module.parent.filename;
  const _filename = filename;

  // if (includeGlobals) {
  //   merge(sandbox, global);
  //   // console is non-enumerable in node v10 and above
  //   sandbox.console = global.console;
  //   // process is non-enumerable in node v12 and above
  //   sandbox.process = global.process;
  //   // sandbox.require = requireLike(_filename);
  // }

  if (typeof scope === 'object') {
    merge(sandbox, scope);
  }

  const exportFn = (value) => {
    sandbox.exports.default = value;
    // Promise.resolve().then(() => value).then(v => resolve(v));
  };

  // define libs
  sandbox.fetch = fetch;
  sandbox.Promise = Promise;

  sandbox.exports = exports;
  // sandbox.export = exportFn;
  sandbox.returnValue = exportFn;

  sandbox.module = {
    exports: exports,
    filename: _filename,
    id: _filename,
    // parent: module.parent,
    // require: sandbox.require || requireLike(_filename)
    // export: (value) => sandbox.exports.default = value
    // returnValue: (value) => sandbox.exports.default = value
  };
  sandbox.global = sandbox;

  const options = {
    filename: filename,
    displayErrors: false
  };

  // if (isBuffer(content)) {
  //   content = content.toString();
  // }

  // Evaluate the content with the given scope
  if (typeof content === 'string') {
    const stringScript = content.replace(/^#!.*/, '');
    const script = new vm.Script(stringScript, options);
    script.runInNewContext(sandbox, options);
  } else {
    content.runInNewContext(sandbox, options);
  }

  return sandbox.module.exports;
}
