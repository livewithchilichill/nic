/* PNIC 公告交叉校验：数据源 ↔ 索引 ↔ 详情页 ↔ 全量/分类 RSS ↔ OPML
   用法：node tools/verify-notices.mjs（不一致即非零退出） */
import { readFileSync, existsSync } from 'node:fs';
const U = (p) => new URL('../' + p, import.meta.url);
const DATA = JSON.parse(readFileSync(U('data/notices.json'), 'utf8'));
const errs = [];
const ok = (cond, msg) => { if (!cond) errs.push(msg); };

const idx = readFileSync(U('notices/index.html'), 'utf8');
const idxLinks = [...idx.matchAll(/<a href="([a-z0-9-]+)\.html">/g)].map((m) => m[1]);
ok(idxLinks.length === DATA.length, 'index count ' + idxLinks.length + ' != data ' + DATA.length);
for (const n of DATA) {
  ok(idxLinks.includes(n.slug), 'index missing ' + n.slug);
  ok(existsSync(U('notices/' + n.slug + '.html')), 'detail missing ' + n.slug);
  const d = readFileSync(U('notices/' + n.slug + '.html'), 'utf8');
  ok(d.includes('<h2 class="bar-h">' + n.title.replace(/&/g, '&amp;') + '</h2>'), 'detail title mismatch ' + n.slug);
  ok(d.includes('[' + n.date + ']'), 'detail date mismatch ' + n.slug);
}
const dates = DATA.map((n) => n.date);
ok([...dates].sort().reverse().join() === dates.join(), 'data not date-desc');

const parse = (p) => {
  const t = readFileSync(U(p), 'utf8');
  return [...t.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => ({
    title: (m[1].match(/<title>([\s\S]*?)<\/title>/) || [])[1],
    guid: (m[1].match(/<guid>([\s\S]*?)<\/guid>/) || [])[1],
    pub: (m[1].match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1],
    cat: (m[1].match(/<category>([\s\S]*?)<\/category>/) || [])[1]
  }));
};
const all = parse('feed.xml');
ok(all.length === DATA.length, 'feed count ' + all.length + ' != ' + DATA.length);
for (const n of DATA) {
  const it = all.find((x) => x.guid.endsWith('/' + n.slug + '.html'));
  ok(!!it, 'feed missing ' + n.slug);
  if (it) {
    ok(it.title === n.title.replace(/&/g, '&amp;'), 'feed title mismatch ' + n.slug);
    ok(it.pub === n.pub, 'feed pubDate mismatch ' + n.slug);
    ok(it.cat === n.cat, 'feed category mismatch ' + n.slug);
  }
}
const pubs = all.map((x) => Date.parse(x.pub));
ok(pubs.every((v, i) => i === 0 || pubs[i - 1] >= v), 'feed not date-desc');
let catTotal = 0;
for (const c of ['policy', 'maintenance', 'projects']) {
  const items = parse('feeds/' + c + '.xml');
  catTotal += items.length;
  ok(items.every((x) => x.cat === c), 'category leak in ' + c);
  ok(items.length === DATA.filter((n) => n.cat === c).length, 'category count ' + c);
}
ok(catTotal === DATA.length, 'category partition ' + catTotal + ' != ' + DATA.length);
const opml = readFileSync(U('opml.xml'), 'utf8');
const outlines = [...opml.matchAll(/xmlUrl="([^"]+)"/g)].map((m) => m[1]);
ok(outlines.length === 4, 'opml outlines ' + outlines.length);
ok(outlines[0] === 'https://nic.livewith.cc/feed.xml', 'opml root feed');
for (const c of ['policy', 'maintenance', 'projects']) ok(outlines.includes('https://nic.livewith.cc/feeds/' + c + '.xml'), 'opml missing ' + c);

if (errs.length) { console.error('VERIFY FAIL:\n' + errs.join('\n')); process.exit(1); }
console.log('VERIFY OK: ' + DATA.length + ' notices consistent across index / details / feed / 3 category feeds / opml');