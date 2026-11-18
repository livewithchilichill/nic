/* PNIC portal — 搜索 / 未上线置灰 / 导航当前态 / 网群下拉 / 轮播 */
(function () {
  'use strict';
  var INDEX = [
    { t: '首页 · 注册局门户', k: '页面', u: 'index.html' },
    { t: '什么是 PNIC？', k: '页面', u: 'team.html' },
    { t: 'ChiliChill 是谁？', k: '页面', u: 'chili.html' },
    { t: '什么是 Live with ChiliChill 网群？', k: '页面', u: 'network.html' },
    { t: '二级域名委派申请', k: '基础设施', u: 'domains.html' },
    { t: '邮件别名与转发申请', k: '基础设施', u: 'mail.html' },
    { t: '短链重定向服务 · go.livewith.cc', k: '基础设施', u: 'shorturl.html' },
    { t: '统一认证平台 · auth.livewith.cc', k: '基础设施', u: 'auth.html' },
    { t: '统一 RSS 服务与 OPML', k: '基础设施', u: 'rss.html' },
    { t: '状态监测服务 · 九十日可用率', k: '基础设施', u: 'status.html' },
    { t: 'WHOIS 查询（演示）', k: '基础设施', u: 'whois.html' },
    { t: '公告与政策索引', k: '页面', u: 'notices/index.html' },
    { t: '公告：门户 v3 上线与 WHOIS 演示开放', k: '公告', u: 'notices/2026-11-17-portal-v3.html' },
    { t: '公告：短网址与 API 网关维护完成', k: '公告', u: 'notices/2026-11-02-maintenance.html' },
    { t: '公告：delegation 政策 v2', k: '公告', u: 'notices/2026-10-12-policy-v2.html' },
    { t: '公告：ChiliChill Map 秋季版本', k: '公告', u: 'notices/2026-09-30-map-release.html' },
  ]
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var BASE = /\/notices\//.test(location.pathname) ? '../' : '';
  var box = document.querySelector('.search-box');
  if (box) {
    var input = box.querySelector('input');
    var res = box.querySelector('.search-results');
    function close() { res.className = 'search-results'; }
    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) { close(); return; }
      var hits = INDEX.filter(function (x) { return x.t.toLowerCase().indexOf(q) >= 0; });
      res.innerHTML = hits.length
        ? hits.map(function (x) {
            var i = x.t.toLowerCase().indexOf(q);
            return '<a href="' + BASE + x.u + '"><span class="sr-kind">[' + x.k + ']</span>' + esc(x.t.slice(0, i)) + '<mark>' + esc(x.t.slice(i, i + q.length)) + '</mark>' + esc(x.t.slice(i + q.length)) + '</a>';
          }).join('')
        : '<div class="sr-empty">未找到匹配条目。</div>';
      res.className = 'search-results open';
    }
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var a = res.querySelector('a'); if (a) location.href = a.getAttribute('href'); }
      if (e.key === 'Escape') close();
    });
    document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.search-box')) close(); });
  }
  /* 未上线：置灰功能控件并拦截动作链接 */
  document.addEventListener('click', function (e) {
    var off = e.target.closest ? e.target.closest('a.off') : null;
    if (off) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-launch-off]').forEach(function (box) {
      box.querySelectorAll('input, select, textarea, button').forEach(function (el) {
        el.disabled = true; el.title = '等待正式上线';
      });
      box.querySelectorAll('a').forEach(function (a) {
        a.classList.add('off'); a.setAttribute('aria-disabled', 'true'); a.title = '等待正式上线';
      });
    });
  });
  /* 顶栏网群下拉 */
  var tnBtn = document.querySelector('.tn-btn');
  var tnMenu = document.querySelector('.tn-menu');
  if (tnBtn && tnMenu) {
    function tnClose() { tnMenu.hidden = true; tnBtn.setAttribute('aria-expanded', 'false'); }
    tnBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = tnMenu.hidden;
      tnMenu.hidden = !open;
      tnBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.tn-drop')) tnClose(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') tnClose(); });
  }
  /* 封面块：banner 轮播（自动轮换、悬停暂停、圆点导航；无调整入口） */
  var car = document.getElementById('cover-carousel');
  if (car) {
    var track = car.querySelector('.cb-track');
    var n = track.children.length;
    var dots = car.querySelectorAll('.cb-dots button');
    var idx = 0, timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(i) {
      idx = (i + n) % n;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      for (var d = 0; d < dots.length; d++) {
        dots[d].className = d === idx ? 'cur' : '';
        if (d === idx) dots[d].setAttribute('aria-current', 'true');
        else dots[d].removeAttribute('aria-current');
      }
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { stop(); if (!reduce) timer = setInterval(function () { go(idx + 1); }, 6000); }
    for (var d = 0; d < dots.length; d++) (function (k) {
      dots[k].addEventListener('click', function () { go(k); start(); });
    })(d);
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    go(0); start();
  }
  function norm(p) { return p.replace(/\/index\.html$/, '/'); }
  var here = norm(location.pathname);
  document.querySelectorAll('.sidenav a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (/^(mailto:|#)/.test(href)) return;
    var np = norm(new URL(a.href).pathname);
    /* 精确匹配；仅“公告”目录项允许前缀匹配（覆盖公告子页），避免首页在子路径部署时常亮 */
    var on = np === here || (/\/notices\/$/.test(np) && here.indexOf(np) === 0);
    a.classList.toggle('cur', on);
  });
})();

/* ============================================================
   待上线总开关：PNIC_PENDING = true 时，所有功能与信息模块统一显示“待上线”占位。
   上线时改为 false（或在页面 <body data-launch="live"> 单页放行）。
   原 DOM 不删除，仅 hidden + inert，恢复无损。404 与导航/页眉/页脚/目录不受影响。
   ============================================================ */
(function () {
  'use strict';
  var PNIC_PENDING = true;
  if (!PNIC_PENDING || document.body.getAttribute('data-launch') === 'live') return;
  var main = document.querySelector('.main');
  var NOTE = '▸ 本站各功能与信息模块均处于「待上线」状态，页面框架与导航先行开放，将逐步推进上线。';
  var KEEP = '.dir, .launch-note, [data-keep]';
  function isHead(el) { return el.matches && el.matches('h2.sec-h, h2.bar-h'); }
  function stamp(el) { el.hidden = true; el.setAttribute('inert', ''); el.setAttribute('data-pending-hidden', ''); }
  function box(title, anchor) {
    var d = document.createElement('div');
    d.className = 'pending-box'; d.setAttribute('role', 'status');
    var back = /\/notices\/(?!index\.html$)[^/]+\.html$/.test(location.pathname) && !/\/notices\/index\.html$/.test(location.pathname)
      ? '<a href="index.html">« 返回公告索引</a>' : '';
    d.innerHTML = '<b>待上线 · COMING SOON</b><span>「' + title + '」尚未开放，将于正式上线后启用。</span>' + back;
    anchor.parentNode.insertBefore(d, anchor);
  }
  if (main && !document.querySelector('.err')) {
    var kids = Array.prototype.slice.call(main.children);
    var groups = [], cur = { head: null, nodes: [] };
    kids.forEach(function (el) {
      if (el.matches('.launch-note')) return;
      if (isHead(el)) { groups.push(cur); cur = { head: el, nodes: [] }; } else cur.nodes.push(el);
    });
    groups.push(cur);
    groups.forEach(function (g) {
      var body = g.nodes.filter(function (n) { return !n.matches(KEEP); });
      if (!body.length) return;
      var title = g.head ? g.head.textContent.trim() : (body[0].querySelector('.wb-label') ? body[0].querySelector('.wb-label').textContent.replace(/[：:]\s*$/, '') : '本模块');
      box(title, body[0]);
      body.forEach(stamp);
      if (g.head && !g.head.querySelector('.pending-tag')) g.head.insertAdjacentHTML('beforeend', ' <span class="pending-tag">待上线</span>');
    });
    var note = main.querySelector('.launch-note');
    if (!note) { note = document.createElement('p'); note.className = 'launch-note'; main.insertBefore(note, main.firstChild); }
    note.textContent = NOTE;
  }
  /* 跑马灯：公告内容待上线 */
  var tk = document.querySelector('.ticktrack');
  if (tk) tk.textContent = '▸ 各服务与信息模块待上线，敬请期待　▸ 上线后将在此滚动发布公告与政策动态';
  /* 首页轮播：每张推介加“待上线”戳，链接不跳转 */
  document.querySelectorAll('.cb-slide').forEach(function (s) {
    s.classList.add('pending');
    s.setAttribute('aria-disabled', 'true'); s.removeAttribute('href'); s.tabIndex = -1;
    s.insertAdjacentHTML('beforeend', '<span class="cb-stamp" aria-hidden="true">待上线</span>');
  });
})();