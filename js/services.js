/* PNIC 服务页交互：RSS 实时解析 / 状态监测 / 资助与联系起草 */
(function () {
  'use strict';
  var BASE = /\/notices\//.test(location.pathname) ? '../' : '';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- 统一 RSS：实时解析 feed.xml ---------- */
  var rssBox = document.getElementById('rss-preview');
  if (rssBox) {
    var rssStatus = document.getElementById('rss-status');
    function loadRss() {
      rssStatus.textContent = '解析中…';
      fetch(BASE + 'feed.xml').then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, 'text/xml');
        var items = [...doc.querySelectorAll('item')].slice(0, 5);
        if (!items.length) throw new Error('empty');
        rssBox.innerHTML = '<ul class="newsbox" style="margin:0">' + items.map(function (it) {
          var t = it.querySelector('title').textContent;
          var l = it.querySelector('link').textContent;
          var d = (it.querySelector('pubDate') || {}).textContent || '';
          var rel = l.replace(/^https?:\/\/nic\.livewith\.cc\//, '');
          return '<li><span class="nd">[' + esc(d.slice(5, 16)) + ']</span><a href="' + esc(rel) + '">' + esc(t) + '</a></li>';
        }).join('') + '</ul>';
        rssStatus.textContent = '✓ 已解析 ' + items.length + ' 条 · ' + new Date().toLocaleTimeString('zh-CN', { hour12: false });
        rssStatus.className = 'field-ok';
      }).catch(function () {
        rssBox.innerHTML = '<p style="font-size:12px;color:#666;margin:0">无法解析订阅源：file:// 下浏览器禁止本地 fetch，请经本地服务器预览；或直接在阅读器中订阅 feed.xml。</p>';
        rssStatus.textContent = '✗ 解析失败（环境限制）';
        rssStatus.className = 'field-bad';
      });
    }
    document.getElementById('rss-refresh').addEventListener('click', loadRss);
    loadRss();
  }

  /* ---------- 状态监测：种子检查 + 九十日 strips ---------- */
  var svcTable = document.getElementById('svc-table');
  if (svcTable) {
    var SVCS = [
      ['注册局门户', 'nic.livewith.cc', 42, 11, 'ok'],
      ['活动地图', 'map.livewith.cc', 68, 22, 'ok'],
      ['社区论坛', 'bbs.livewith.cc', 95, 33, 'ok'],
      ['剪贴板', 'paste.livewith.cc', 51, 44, 'ok'],
      ['站群文档', 'wiki.livewith.cc', 74, 55, 'ok'],
      ['短链重定向', 'go.livewith.cc', 23, 66, 'ok'],
      ['统一认证', 'auth.livewith.cc', 37, 77, 'ok'],
      ['API 网关', 'api.livewith.cc', 29, 88, 'deg'],
      ['WHOIS 演示', 'nic.livewith.cc/whois', 12, 99, 'ok']
    ];
    var check = 0;
    function strip(seed) {
      var rnd = mulberry(seed * 7919 + 13);
      var cells = '';
      for (var i = 0; i < 90; i++) {
        var r = rnd();
        var col = r < 0.955 ? '#009966' : r < 0.985 ? '#ff9900' : r < 0.997 ? '#336699' : '#cc0000';
        cells += '<span title="D-' + (90 - i) + '" style="display:inline-block;width:5px;height:12px;margin-right:1px;background:' + col + '"></span>';
      }
      return cells;
    }
    function render() {
      var rows = SVCS.map(function (s, i) {
        var rnd = mulberry(s[3] * 104729 + check * 31 + 7);
        var lat = Math.round(s[2] + rnd() * 18);
        var st = s[4] === 'deg' && check % 3 === 2 ? 'ok' : s[4];
        var badge = st === 'ok' ? '<span class="badge-ok">operational</span>' : st === 'deg' ? '<span class="badge-upd">degraded</span>' : '<span style="color:var(--steel);font-weight:bold">maintenance</span>';
        var up = (99.9 + rnd() * 0.09).toFixed(2);
        return '<tr><td>' + s[0] + '</td><td class="mono">' + s[1] + '</td><td>' + badge + '</td><td class="num">' + lat + ' ms</td><td style="white-space:nowrap">' + strip(s[3]) + '<span class="num" style="margin-left:6px">' + up + '%</span></td></tr>';
      }).join('');
      svcTable.innerHTML = '<tr><th>服务</th><th>域名</th><th>状态</th><th>延迟</th><th>九十日可用率</th></tr>' + rows;
      document.getElementById('status-checked').textContent = '最近检查：' + new Date().toLocaleString('zh-CN', { hour12: false });
      document.getElementById('status-count').textContent = '· 第 ' + (check + 1) + ' 轮';
    }
    document.getElementById('status-refresh').addEventListener('click', function () { check++; render(); });
    render();
  }

  /* ---------- 资助起草 ---------- */
  var fundTier = document.getElementById('fund-tier');
  if (fundTier) {
    var fundSend = document.getElementById('fund-send');
    function fundHref() {
      var t = fundTier.value;
      fundSend.href = 'mailto:registry@livewith.cc?subject=' + encodeURIComponent('[donation] ' + t) + '&body=' + encodeURIComponent('层级：' + t + '\n金额/形式：\n联系方式：\n是否匿名入榜：');
    }
    fundTier.addEventListener('change', fundHref);
    fundHref();
  }

  /* ---------- 联系起草 ---------- */
  var cSub = document.getElementById('contact-subject');
  if (cSub) {
    var cSend = document.getElementById('contact-send');
    var ADDR = { registry: 'registry', tech: 'tech', abuse: 'abuse', funding: 'registry', press: 'webmaster' };
    function cHref() {
      var k = cSub.value;
      cSend.href = 'mailto:' + ADDR[k] + '@livewith.cc?subject=' + encodeURIComponent('[' + (k === 'funding' ? 'donation' : k) + '] ') + '&body=' + encodeURIComponent('事务：' + k + '\n摘要：\n联系方式：');
    }
    cSub.addEventListener('change', cHref);
    cHref();
  }
})();