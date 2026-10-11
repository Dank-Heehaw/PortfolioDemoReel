/**
 * Preload for Next on exFAT / some Windows non-C: volumes.
 *
 * Node's fs.readlink* on a normal file there throws EISDIR instead of EINVAL.
 * Webpack/watchpack only treat EINVAL/ENOENT/UNKNOWN as "not a symlink", so
 * builds fail. Remap EISDIR → EINVAL for readlink only.
 *
 * Usage: node --require ./scripts/exfat-fs-preload.cjs node_modules/next/dist/bin/next …
 */
"use strict";

const fs = require("node:fs");

function remapEisdir(err) {
  if (err && err.code === "EISDIR") {
    err.code = "EINVAL";
    err.message = String(err.message).replace(/\bEISDIR\b/g, "EINVAL");
  }
  return err;
}

function wrapSync(fn) {
  return function patchedReadlinkSync(...args) {
    try {
      return fn.apply(this, args);
    } catch (err) {
      throw remapEisdir(err);
    }
  };
}

function wrapCallback(fn) {
  return function patchedReadlink(...args) {
    const cb = typeof args[args.length - 1] === "function" ? args.pop() : null;
    if (!cb) {
      // Promise / promisified path via util.promisify uses the callback form.
      return fn.apply(this, args);
    }
    return fn.call(this, ...args, (err, result) => {
      cb(err ? remapEisdir(err) : err, result);
    });
  };
}

function wrapPromise(fn) {
  return async function patchedReadlinkPromise(...args) {
    try {
      return await fn.apply(this, args);
    } catch (err) {
      throw remapEisdir(err);
    }
  };
}

fs.readlinkSync = wrapSync(fs.readlinkSync.bind(fs));
fs.readlink = wrapCallback(fs.readlink.bind(fs));

if (fs.promises?.readlink) {
  fs.promises.readlink = wrapPromise(fs.promises.readlink.bind(fs.promises));
}
