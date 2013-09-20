var fs = require("fs");
var path = require("path");
var esprima = require("esprima");
var sets = require("simplesets");
var walkdir = require("walkdir");

if (typeof String.prototype.startsWith !== "function") {
  String.prototype.startsWith = function (str) {
    return this.slice(0, str.length) === str;
  };
}

function traverse(object, visitor) {
  var key, child;

  if (visitor.call(null, object) === false) {
    return;
  }

  for (key in object) {
    if (object.hasOwnProperty(key)) {
      child = object[key];
      if (typeof child === "object" && child !== null) {
        traverse(child, visitor);
      }
    }
  }
}

function isRequire(node) {
  return node.callee.name === "require" ||
  (node.callee.property && node.callee.property.name === "loadNpmTasks");
}

function parse(filename) {
  var content = fs.readFileSync(filename, "utf-8");
  var lines;
  try {
    lines = content.split("\n");
    if (lines[0][0] === "#") {
      lines.shift();
      content = lines.join("\n");
    }

    return esprima.parse(content, {tolerant: true});
  } catch (e) {
    return null;
  }
}

function checkFile(filename) {
  var used = new sets.Set();
  var syntax = parse(filename);
  
  if (!syntax) {
    return new sets.Set();
  }

  traverse(syntax, function (node) {
    var arg;

    if (node.type !== "CallExpression") {
      return;
    }
    if (node.arguments.length !== 1) {
      return;
    }
    if (!isRequire(node)) {
      return;
    }

    arg = node.arguments[0];

    if (arg.type === "Literal" && arg.value[0] !== ".") {
      used.add(arg.value);
    }
  });

  return used;
}

function hasBin(root, dependency) {
  try { 
    var depPkg = require(path.join(root, 'node_modules', dependency, 'package.json'));
    return depPkg.bin !== undefined;
  } catch (e) {
    return false;
  }
}

function check(root, directories, files, cb) {
  var pkg = require(path.join(root, "/package.json"));
  var deps = Object.keys(pkg.dependencies).concat(Object.keys(pkg.devDependencies || {}));
  var usedDependencies = new sets.Set();
  var unused;

  files.forEach(function (file) {
    usedDependencies = usedDependencies.union(checkFile(file));
  });

  deps = new sets.Set(deps);

  var found = new sets.Set();

  usedDependencies.array().forEach(function (ud) {
    deps.array().forEach(function (dep) {
      if (ud === dep || ud.startsWith(dep + "/") || hasBin(root, dep)) {
        found.add(dep);
      }
    });
  });

  unused = deps.difference(found).array();

  cb(unused);
}

function collectSubdirectories(root, directories, files, cb) {
  var n = 0;
  directories.forEach(function (dir) {
    var finder = walkdir(dir);

    n++;

    finder.on("file", function (file, stat) {
      files.push(file);
    });

    finder.on("end", function () {
      n--;
      if (n <= 0) {
        check(root, directories, files, cb);
      }
    });
  });
}

module.exports = function checkDirectory(dir, cb) {
  var usedDeps = [];
  var files = [];
  var directories = [];
  var finder = walkdir(dir, { "no_recurse": true });

  finder.on("directory", function (dir, stat) {
    if (path.basename(dir) === "node_modules") {
      return;
    }
    directories.push(dir);
  });

  finder.on("file", function (file, stat) {
    if (path.extname(file) !== ".js") {
      return;
    }
    files.push(file);
  });

  finder.on("end", function () {
    if(directories.length == 0) {
      check(dir, directories, files, cb);
    } else {
      collectSubdirectories(dir, directories, files, cb);
    }
  });
};
