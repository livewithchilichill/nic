/* PNIC 公告单一数据源构建：data/notices.json → 索引 / 详情页 / 全量与分类 RSS / OPML
   用法：node tools/build-notices.mjs */
import { readFileSync, writeFileSync } from 'node:fs';

const DATA = JSON.parse(readFileSync(new URL('../data/notices.json', import.meta.url), 'utf8'));
const donor = readFileSync(new URL('../notices/index.html', import.meta.url), 'utf8');
const chrome = (title, main) => {
  let t = donor.replace(/<title>[\s\S]*?<\/title>/, '<title>' + title + '</title>');
  t = t.replace(/<main class="main">[\s\S]*?<\/main>/, '<main class="main">\n' + main + '\n  </main>');
  return t;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sorted = [...DATA].sort((a, b) => b.date.localeCompare(a.date));

/* 索引 */
const list = sorted.map((n) => {
  const badge = n.badge ? '<span class="' + (n.badge === 'NEW!' ? 'badge-new' : 'badge-upd') + '">' + n.badge + '</span>' : '';
  return '  <li><span class="nd">[' + n.date + ']</span>' + badge + '<a href="' + n.slug + '.html">' + esc(n.title) + '</a></li>';
}).join('\n');
const indexMain = '<h2 class="bar-h">公告与政策</h2>\n<ul class="newsbox">\n' + list + '\n</ul>\n<p style="font-size:12px">公告亦经 <a href="../feed.xml">RSS</a> 分发；政策类公告异议期三十日。更新方式见 <a href="../rss.html">统一 RSS 服务</a>。</p>';
writeFileSync(new URL('../notices/index.html', import.meta.url), chrome('公告与政策 | PNIC', indexMain));

/* 详情页 */
for (const n of sorted) {
  const main = '<h2 class="bar-h">' + esc(n.title) + '</h2>\n<p style="font-size:11px;color:#666">[' + n.date + '] · 发布：PNIC-REG · ' + (n.badge || '公告') + '</p>\n' + n.body + '\n<hr>\n<p style="font-size:12px"><a href="index.html">« 返回公告索引</a> · <a href="../index.html">返回门户首页</a></p>';
  writeFileSync(new URL('../notices/' + n.slug + '.html', import.meta.url), chrome(n.title + ' | PNIC', main));
}

/* RSS */
const feed = (items, title, desc) => '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n<title>' + esc(title) + '</title>\n<link>https://nic.livewith.cc/</link>\n<description>' + esc(desc) + '</description>\n<language>zh-CN</language>\n<lastBuildDate>' + sorted[0].pub + '</lastBuildDate>\n' + items.map((n) => '<item>\n<title>' + esc(n.title) + '</title>\n<link>https://nic.livewith.cc/notices/' + n.slug + '.html</link>\n<guid>https://nic.livewith.cc/notices/' + n.slug + '.html</guid>\n<pubDate>' + n.pub + '</pubDate>\n<category>' + n.cat + '</category>\n<description>' + esc(n.desc) + '</description>\n</item>').join('\n') + '\n</channel>\n</rss>\n';
writeFileSync(new URL('../feed.xml', import.meta.url), feed(sorted, 'PNIC 公告 · 厚嘴唇星网络信息中心', 'Live with ChiliChill 网群注册局公告与政策'));
const CATS = { policy: 'PNIC 政策', maintenance: 'PNIC 维护', projects: 'PNIC 项目' };
for (const [c, t] of Object.entries(CATS)) {
  writeFileSync(new URL('../feeds/' + c + '.xml', import.meta.url), feed(sorted.filter((n) => n.cat === c), t, t + '类公告'));
}
writeFileSync(new URL('../opml.xml', import.meta.url), '<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n<head><title>PNIC 订阅包</title></head>\n<body>\n<outline text="PNIC 全量公告" type="rss" xmlUrl="https://nic.livewith.cc/feed.xml"/>\n' + Object.keys(CATS).map((c) => '<outline text="' + CATS[c] + '" type="rss" xmlUrl="https://nic.livewith.cc/feeds/' + c + '.xml"/>').join('\n') + '\n</body>\n</opml>\n');
console.log('built: index + ' + sorted.length + ' details + feed.xml + 3 category feeds + opml.xml');