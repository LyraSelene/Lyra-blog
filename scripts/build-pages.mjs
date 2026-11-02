import { cp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = path.join(root, 'XHBlogs');
const stage = path.join(root, '.local', 'pages-build');
const base = process.env.PAGES_BASE_PATH || '/Lyra-blog';
if (stage !== path.join(root, '.local', 'pages-build')) throw new Error('Invalid build directory');
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const name of ['app', 'components', 'data', 'posts', 'chatters', 'moments', 'public', 'siteConfig.ts', 'tsconfig.json', 'postcss.config.mjs', 'package.json', 'package-lock.json']) {
  await cp(path.join(source, name), path.join(stage, name), { recursive: true, filter: p => p !== path.join(source, 'app', 'api') });
}
// Keep the normal local/Node build intact. Only this staging build is static.
await cp(path.join(source, 'node_modules'), path.join(stage, 'node_modules'), { recursive: true, verbatimSymlinks: true });
await writeFile(path.join(stage, 'next.config.ts'), `import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', trailingSlash: true, basePath: ${JSON.stringify(base)}, images: { unoptimized: true }, typescript: { ignoreBuildErrors: false } };
export default config;\n`);

async function transform(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) { if (!['node_modules', '.next', 'out'].includes(entry.name)) await transform(target); continue; }
    if (!/\.(tsx?|md|css)$/.test(entry.name)) continue;
    let content = await readFile(target, 'utf8');
    content = content.replace(/(["'`(])\/(?!\/)([^\s"'`)]+\.(?:webp|png|jpe?g|gif|svg|bin|glb|gltf|mp3|ogg|wav))(\??[^\s"'`)]*)/g, (_, open, asset, query) => `${open}${base}/${asset}${query}`);
    if (entry.name === 'MusicProvider.tsx') content = content.replace('`/api/music?ids=${siteConfig.cloudMusicIds.join(\',\')}`', JSON.stringify(base + '/music-data.json'));
    if (entry.name === 'layout.tsx') content = content.replace('<CyberCat />', '{/* AI requires a server; the Pages edition keeps local-only AI out. */}');
    await writeFile(target, content);
  }
}
await transform(stage);
await writeFile(path.join(stage, 'public', 'music-data.json'), '[]\n');
for (const route of ['posts/[slug]', 'chatter/[slug]']) {
  const contentFolder = route.startsWith('posts') ? 'posts' : 'chatters';
  if (!(await readdir(path.join(stage, contentFolder))).some(name => name.endsWith('.md'))) {
    await rm(path.join(stage, 'app', route), { recursive: true, force: true });
    continue;
  }
  const file = path.join(stage, 'app', route, 'page.tsx');
  await writeFile(file, (await readFile(file, 'utf8')) + '\nexport const dynamicParams = false;\n');
}
const result = spawnSync(process.execPath, [path.join(stage, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], { cwd: stage, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
if (result.status !== 0) process.exit(result.status || 1);
await writeFile(path.join(stage, 'out', '.nojekyll'), '');
console.log(`GitHub Pages output: ${path.join(stage, 'out')}`);
