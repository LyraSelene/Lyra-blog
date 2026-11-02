import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const api = 'http://127.0.0.1:5317';
const checks = [];
async function get(route) {
  const response = await fetch(api + route, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  return response.json();
}
async function post(route, body) {
  const response = await fetch(api + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  return response.json();
}
assert.equal((await get('/api/status')).status, 'online');
checks.push('CMS API 在线');
const config = await get('/api/config/get');
assert.equal(config.success, true);
assert.equal(config.data.authorName, 'Lyra Selene');
assert.deepEqual(config.data.bgImages, ['/images/theatre-background.webp']);
assert.equal(config.data.cloudMusicIds.length, 3);
checks.push('CMS 完整读取个人资料、背景数组、音乐数组');
assert.equal((await post('/api/config/update', { updates: { bio: config.data.bio } })).success, true);
checks.push('CMS 配置保存成功，内容不变');
const blogPath = path.join(root, 'XHBlogs');
assert.equal((await post('/api/sync/check', { blogPath })).success, true);
assert.equal((await post('/api/sync/check', { blogPath: path.join(root, 'my-blog-manager') })).success, false);
checks.push('同步仅接受本博客目录');
assert.equal((await post('/api/sync/execute', { blogPath })).success, true);
const original = await readFile(path.join(root, 'my-blog-manager/posts/welcome.md'), 'utf8');
assert.equal(await readFile(path.join(root, 'XHBlogs/posts/welcome.md'), 'utf8'), original);
checks.push('CMS 内容同步成功，前台文章与管理台一致');
for (const [port, routes] of [[3100, ['/', '/posts/welcome', '/about', '/timeline', '/projects', '/photowall', '/chatter', '/moments', '/music', '/friends']], [3101, ['/settings', '/editor?type=post', '/drafts']]]) {
  for (const route of routes) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`, { signal: AbortSignal.timeout(40000) });
    assert.equal(response.status, 200, `${port}${route}`);
    const html = await response.text();
    assert.ok(!html.includes('Internal Server Error'), `${port}${route}`);
    if (route === '/posts/welcome') assert.ok(html.includes('你好，这里是 Lyra 的博客'));
    checks.push(`HTTP 200: ${port}${route}`);
  }
}
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts/verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2));
console.log(checks.join('\n'));
