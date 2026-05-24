/**
 * electron-dev.cjs
 * Bootstrap CJS para desenvolvimento com tsx.
 * Por ser .cjs, o Node carrega via CJS loader independente do "type" do package.json.
 * tsx/cjs registra o hook ANTES de qualquer import de .ts.
 */
require('tsx/cjs')
require('./src/main')   // tsx resolve .ts automaticamente