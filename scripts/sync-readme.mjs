/**
 * 把根目录 README 同步到各个子包。
 *
 * npm / pnpm 打包时都不会跟随软链接，所以子包里必须是真实文件，
 * npm 页面才能显示文档。子包的 README 由本脚本生成，已加入 .gitignore,
 * 唯一数据源始终是根目录的 README.md / README.en.md。
 */
import { copyFileSync, existsSync, lstatSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const packages = ['core', 'uni']
const files = ['README.md', 'README.en.md']

for (const pkg of packages) {
  for (const file of files) {
    const target = join(root, 'packages', pkg, file)
    // 旧的软链接要先删掉，否则 copyFile 会写穿到根目录源文件
    if (existsSync(target) && lstatSync(target).isSymbolicLink()) {
      rmSync(target)
    }
    copyFileSync(join(root, file), target)
  }
  console.log(`[sync-readme] packages/${pkg} <- ${files.join(', ')}`)
}
