// Usa o CMake 3.31.6 (ninja 1.12, que aceita caminhos > 260 caracteres no Windows).
// Sem isso o build nativo falha com "Filename longer than 260 characters".
const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withCmakeVersion(config, version = '3.31.6') {
  return withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('// cmake-version-fix')) {
      cfg.modResults.contents += `
// cmake-version-fix
android {
    externalNativeBuild {
        cmake {
            version "${version}"
        }
    }
}
`;
    }
    return cfg;
  });
};
