const os = require('os');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

require('dotenv').config();

const projPath = './unity-proj-tmp';
const unityPath = process.env.UNITY_PATH;

const il2CppOutput = path.join(projPath, 'il2cpp-out');

fs.stat(projPath, (error, stat) => {
  if (!error && !stat.isDirectory()) {
    throw new Error(`Unity temp path '${projPath}' is not directory`)
  }
});

function write(src) {
  if (!fs.statSync(projPath, { throwIfNoEntry: false })) {
    execSync([
      path.join(unityPath, 'Contents/MacOS/Unity'),
      '-quit',
      '-batchMode',
      '-createProject',
      projPath,
    ].join(' '));
  }

  fs.writeFileSync(path.join(projPath, 'Assets', 'a.cs'), src);

  try {
    execSync([
      path.join(unityPath, 'Contents/MacOS/Unity'),
      '-quit',
      '-batchMode',
      '-projectPath',
      projPath,
    ].join(' '));
  }
  catch (e) {
    console.log(e.stdout.toString());
    console.log(e.stderr.toString());
    throw e;
  }
}

exports.check = async src => {
  write(src);
};

exports.compile = async src => {
  write(src);

  execSync([
    path.join(unityPath, 'Contents/il2cpp/build/deploy/netcoreapp3.1/il2cpp'),
    '--convert-to-cpp',
    path.join(projPath, 'Library/ScriptAssemblies/Assembly-CSharp.dll'),
    path.join(unityPath, 'Contents/MonoBleedingEdge/lib/mono/unityaot/mscorlib.dll'),
    ...[
      'System.dll',
      'System.Core.dll',
     ].map(x => path.join(
       unityPath,
       'Contents/MonoBleedingEdge/lib/mono/2.0-api',
       x
      )),
     `--extra-types-file="${path.join(unityPath, 'Contents/il2cpp/il2cpp_default_extra_types.txt')}"`,
     path.join(unityPath, 'Contents/MonoBleedingEdge/lib/mono/unityaot/Facades/netstandard.dll'),
     path.join(unityPath, 'Contents/Managed/UnityEngine/UnityEngine.dll'),
     `--generatedcppdir=${il2CppOutput}`,
  ].join(' '));

  return fs.readFileSync(path.join(il2CppOutput, 'Assembly-CSharp.cpp'));
};

/**
 * @param word {string | undefined}
 */
exports.search = async word => {
  if (word?.trim()) {
    const regexp = new RegExp(word, 'm');

    const dir = fs.opendirSync(il2CppOutput);

    try {
      while (true) {
        const ent = dir.readSync();
        if (!ent) {
          break;
        }

        if (ent.name.endsWith('.cpp') && ent.name !== 'Il2CppGenericMethodPointerTable.cpp') {
          var content = fs.readFileSync(path.join(dir.path, ent.name));
          if (regexp.test(content)) {
            return content;
          }
        }
      }
    }
    finally {
      dir.closeSync();
    }
  }
  return fs.readFileSync(path.join(il2CppOutput, 'Assembly-CSharp.cpp'));
};
