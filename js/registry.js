/* PNIC registry — 种子注册库 + 伪 WHOIS / API 演示 / 申请 / 短网址
   演示注册库：数据种子化于客户端，地址采用 RFC5737 文档段 */
(function () {
  'use strict';

  var ZONE = 'livewith.cc';
  var NS = [
    { host: 'ns1.livewith.cc', v4: '192.0.2.53', v6: '2001:db8::53' },
    { host: 'ns2.livewith.cc', v4: '198.51.100.53', v6: '2001:db8::153' }
  ];
  var DOMAINS = [
    { name: 'livewith.cc', org: 'Live with ChiliChill', purpose: '站群主域', admin: 'CHILI-ADMIN', tech: 'PNIC-TECH', status: 'ACTIVE', created: '2019-04-01', changed: '2026-10-12', remarks: 'Zone apex; delegation governed by PNIC policy v2.' },
    { name: 'nic.livewith.cc', org: 'PNIC Registry Operations', purpose: '注册局门户（本站）', admin: 'PNIC-REG', tech: 'PNIC-TECH', status: 'ACTIVE', created: '2019-04-01', changed: '2026-11-17', remarks: 'This portal.' },
    { name: 'map.livewith.cc', org: 'ChiliChill Map Team', purpose: '活动地图与导览', admin: 'CHILI-ADMIN', tech: 'LW-VOLS', status: 'ACTIVE', created: '2021-06-18', changed: '2026-09-30', remarks: 'Flagship community project.' },
    { name: 'bbs.livewith.cc', org: 'Live with ChiliChill', purpose: '社区论坛', admin: 'CHILI-ADMIN', tech: 'LW-VOLS', status: 'ACTIVE', created: '2020-02-29', changed: '2026-08-14', remarks: '' },
    { name: 'paste.livewith.cc', org: 'Live with ChiliChill', purpose: '剪贴板服务', admin: 'PNIC-REG', tech: 'PNIC-TECH', status: 'ACTIVE', created: '2022-03-05', changed: '2026-07-01', remarks: '' },
    { name: 'wiki.livewith.cc', org: 'Live with ChiliChill', purpose: '站群文档', admin: 'LW-VOLS', tech: 'LW-VOLS', status: 'ACTIVE', created: '2021-11-02', changed: '2026-10-03', remarks: '' },
    { name: 'go.livewith.cc', org: 'PNIC Registry Operations', purpose: '短网址服务', admin: 'PNIC-REG', tech: 'PNIC-TECH', status: 'ACTIVE', created: '2023-01-15', changed: '2026-11-02', remarks: '302 redirector; see /shorturl.html' },
    { name: 'auth.livewith.cc', org: 'PNIC Registry Operations', purpose: '统一认证平台', admin: 'PNIC-REG', tech: 'PNIC-TECH', status: 'ACTIVE', created: '2023-08-20', changed: '2026-10-28', remarks: 'OAuth2-style ticket issuer.' },
    { name: 'api.livewith.cc', org: 'PNIC Registry Operations', purpose: '注册局 API 网关', admin: 'PNIC-REG', tech: 'PNIC-TECH', status: 'ACTIVE', created: '2024-04-11', changed: '2026-11-02', remarks: 'Read-only public; write ops require ticket.' },
    { name: 'status.livewith.cc', org: 'PNIC Registry Operations', purpose: '服务状态页', admin: 'PNIC-REG', tech: 'PNIC-TECH', status: 'ACTIVE', created: '2024-09-01', changed: '2026-11-10', remarks: '' }
  ];
  var HANDLES = [
    { nic: 'PNIC-REG', person: 'Registry Operations', org: 'PNIC', email: 'registry@livewith.cc', phone: '+86 10 0000 0001', changed: '2026-01-05' },
    { nic: 'CHILI-ADMIN', person: 'ChiliChill Admin', org: 'Live with ChiliChill', email: 'admin@livewith.cc', phone: '+86 10 0000 0002', changed: '2025-12-01' },
    { nic: 'PNIC-TECH', person: 'Technical Contact', org: 'PNIC', email: 'tech@livewith.cc', phone: '+86 10 0000 0003', changed: '2026-03-18' },
    { nic: 'LW-VOLS', person: 'Volunteers Coordination', org: 'Live with ChiliChill', email: 'vols@livewith.cc', phone: '+86 10 0000 0004', changed: '2026-05-06' },
    { nic: 'LW-FANS', person: 'Fans Relations', org: 'Live with ChiliChill', email: 'fans@livewith.cc', phone: '+86 10 0000 0005', changed: '2026-05-06' }
  ];
  var ALIASES = [
    { addr: 'fans@livewith.cc', role: 'fans', target: 'fans-list@livewith.cc', policy: '粉丝事务通告与活动通知', created: '2020-02-29' },
    { addr: 'vols@livewith.cc', role: 'vols', target: 'vols-list@livewith.cc', policy: '志愿者排班与协作', created: '2020-02-29' },
    { addr: 'devs@livewith.cc', role: 'devs', target: 'devs-list@livewith.cc', policy: '开发维护与 incident 通报', created: '2021-06-18' },
    { addr: '@livewith.cc', role: 'catch-all', target: 'postmaster@livewith.cc', policy: '未匹配地址兜底，人工分拣', created: '2019-04-01' },
    { addr: 'postmaster@livewith.cc', role: 'RFC2142', target: 'PNIC-REG mailbox', policy: '邮件系统事务', created: '2019-04-01' },
    { addr: 'abuse@livewith.cc', role: 'RFC2142', target: 'PNIC-REG mailbox', policy: '滥用投诉', created: '2019-04-01' },
    { addr: 'webmaster@livewith.cc', role: 'RFC2142', target: 'PNIC-TECH mailbox', policy: '站点事务', created: '2019-04-01' }
  ];
  var RESERVED = ['www', 'nic', 'ns', 'ns1', 'ns2', 'ns3', 'mail', 'smtp', 'imap', 'pop', 'mx', 'auth', 'api', 'go', 's', 'admin', 'root', 'postmaster', 'hostmaster', 'webmaster', 'abuse', 'ftp', 'whois', 'registry', 'status', 'git', 'bbs', 'map', 'paste', 'wiki', 'test', 'localhost'];
  var SHORT_SEED = [
    { code: 'map', url: 'https://map.livewith.cc/', created: '2023-01-15', hits: 4182 },
    { code: 'join', url: 'https://nic.livewith.cc/team.html', created: '2023-02-01', hits: 1267 },
    { code: 'whois', url: 'https://nic.livewith.cc/whois.html', created: '2024-05-06', hits: 893 }
  ];

  function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------------- WHOIS ---------------- */
  function whois(qraw) {
    var q = (qraw || '').trim();
    var L = [];
    L.push('% PNIC WHOIS demonstration server v1.4 (seeded client-side registry)');
    L.push('% Zone: ' + ZONE + '  Source: PNIC-REG  Terms: nic.livewith.cc/terms');
    L.push('');
    if (!q || q.toLowerCase() === 'help') {
      L.push('% Usage:');
      L.push('%   whois <name>.livewith.cc   delegation object');
      L.push('%   whois <HANDLE>             contact / role object');
      L.push('%   whois <addr@livewith.cc>   mail alias object');
      L.push('%   whois ns1.livewith.cc      nameserver object');
      L.push('%   whois help                 this text');
      return { type: 'help', lines: L };
    }
    var obj = null, type = null;
    if (q.indexOf('@') >= 0 || q === '@' + ZONE) {
      var a = q === '@' + ZONE ? q : q.toLowerCase();
      obj = ALIASES.filter(function (x) { return x.addr === a; })[0];
      type = 'alias';
      if (obj) {
        L.push(pad('address:', 13) + obj.addr);
        L.push(pad('role:', 13) + obj.role);
        L.push(pad('forward-to:', 13) + obj.target);
        L.push(pad('policy:', 13) + obj.policy);
        L.push(pad('created:', 13) + obj.created);
        L.push(pad('source:', 13) + 'PNIC-REG');
      }
    } else if (/^ns\d\./.test(q.toLowerCase())) {
      var n = NS.filter(function (x) { return x.host === q.toLowerCase(); })[0];
      obj = n; type = 'nameserver';
      if (n) {
        L.push(pad('nserver:', 13) + n.host);
        L.push(pad('addr:', 13) + n.v4);
        L.push(pad('ipv6:', 13) + n.v6);
        L.push(pad('changed:', 13) + '2026-01-05');
        L.push(pad('source:', 13) + 'PNIC-REG');
      }
    } else if (HANDLES.some(function (h) { return h.nic === q.toUpperCase(); })) {
      var h = HANDLES.filter(function (x) { return x.nic === q.toUpperCase(); })[0];
      obj = h; type = 'handle';
      L.push(pad('nic-hdl:', 13) + h.nic);
      L.push(pad('person:', 13) + h.person);
      L.push(pad('org:', 13) + h.org);
      L.push(pad('e-mail:', 13) + h.email);
      L.push(pad('phone:', 13) + h.phone);
      L.push(pad('changed:', 13) + h.changed);
      L.push(pad('source:', 13) + 'PNIC-REG');
    } else {
      var name = q.toLowerCase();
      if (name.indexOf('.') < 0) name += '.' + ZONE;
      var d = DOMAINS.filter(function (x) { return x.name === name; })[0];
      obj = d; type = 'domain';
      if (d) {
        L.push(pad('domain:', 13) + d.name);
        L.push(pad('org:', 13) + d.org);
        L.push(pad('purpose:', 13) + d.purpose);
        L.push(pad('admin-c:', 13) + d.admin);
        L.push(pad('tech-c:', 13) + d.tech);
        NS.forEach(function (n) { L.push(pad('nserver:', 13) + n.host + ' ' + n.v4); });
        L.push(pad('status:', 13) + d.status);
        L.push(pad('created:', 13) + d.created);
        L.push(pad('changed:', 13) + d.changed);
        if (d.remarks) L.push(pad('remarks:', 13) + d.remarks);
        L.push(pad('source:', 13) + 'PNIC-REG');
      }
    }
    if (!obj) {
      L.push('%ERROR:101: no entries found for "' + q + '"');
      L.push('% Nothing in the PNIC demonstration registry matches this query.');
      L.push('% Type "help" for usage.');
      return { type: 'error', lines: L };
    }
    return { type: type, lines: L, object: obj };
  }

  /* ---------------- API mock ---------------- */
  function apiCall(method, path, body) {
    var m = path.match(/^\/v1\/whois\/(.+)$/);
    if (method === 'GET' && m) {
      var r = whois(decodeURIComponent(m[1]));
      return r.type === 'error'
        ? { status: 404, json: { error: 'ERROR:101', query: m[1] } }
        : { status: 200, json: { query: m[1], type: r.type, object: r.object || null, raw: r.lines.join('\n') } };
    }
    if (method === 'GET' && path === '/v1/domains')
      return { status: 200, json: { zone: ZONE, count: DOMAINS.length, domains: DOMAINS.map(function (d) { return { name: d.name, status: d.status, purpose: d.purpose }; }) } };
    if (method === 'GET' && path === '/v1/aliases')
      return { status: 200, json: { count: ALIASES.length, aliases: ALIASES } };
    if (method === 'GET' && path === '/v1/handles')
      return { status: 200, json: { count: HANDLES.length, handles: HANDLES } };
    if (method === 'GET' && path === '/v1/status')
      return { status: 200, json: { registry: 'PNIC-REG', zone: ZONE, delegations: DOMAINS.length, aliases: ALIASES.length, nameservers: NS.map(function (n) { return n.host; }), version: '1.4-demo', mode: 'client-side seeded' } };
    var s = path.match(/^\/v1\/short\/([a-z0-9-]+)$/);
    if (method === 'GET' && s) {
      var all = SHORT_SEED.concat(lsGet('pnic-short', []));
      var hit = all.filter(function (x) { return x.code === s[1]; })[0];
      return hit ? { status: 200, json: hit } : { status: 404, json: { error: 'no such code', code: s[1] } };
    }
    if (method === 'POST' && path === '/v1/short') {
      var url = (body || {}).url || '';
      if (!/^https?:\/\/.+/.test(url)) return { status: 400, json: { error: 'url must be http(s)' } };
      var code = (body || {}).code || randCode();
      var all2 = SHORT_SEED.concat(lsGet('pnic-short', []));
      if (all2.some(function (x) { return x.code === code; })) return { status: 409, json: { error: 'code taken', code: code } };
      var rec = { code: code, url: url, created: today(), hits: 0, mine: true };
      var mine = lsGet('pnic-short', []); mine.push(rec); lsSet('pnic-short', mine);
      return { status: 201, json: rec };
    }
    return { status: 404, json: { error: 'unknown endpoint', path: path } };
  }
  function randCode() {
    var c = '';
    do { c = Math.random().toString(36).slice(2, 6); } while (c.length < 4);
    return c;
  }

  /* ---------------- 申请工单 ---------------- */
  function reqs() { return lsGet('pnic-reqs', []); }
  function addReq(r) {
    var list = reqs();
    var seq = list.reduce(function (m, x) { var n = parseInt(String(x.id).split('-').pop(), 10); return n > m ? n : m; }, 0) + 1;
    r.id = 'PNIC-' + today().replace(/-/g, '') + '-' + String(seq).padStart(3, '0');
    r.ts = today();
    r.status = '待审核';
    list.push(r); lsSet('pnic-reqs', list);
    return r;
  }
  function dropReq(id) { lsSet('pnic-reqs', reqs().filter(function (r) { return r.id !== id; })); }

  function validLabel(v) {
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(v)) return '标签须为 1–63 位小写字母/数字/连字符，且不以连字符开头或结尾';
    if (DOMAINS.some(function (d) { return d.name === v + '.' + ZONE; })) return '已被现有 delegation 占用';
    if (RESERVED.indexOf(v) >= 0) return '保留字，不可注册';
    return null;
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : '邮箱格式不合法'; }

  /* ---------------- 页面装配 ---------------- */
  function copyText(t, btn) {
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? '已复制 ✓' : '复制失败'; setTimeout(function () { btn.textContent = o; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(false); });
    else {
      var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done(ok);
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (!b) return;
    var sel = b.getAttribute('data-copy');
    var el = sel.charAt(0) === '#' ? document.querySelector(sel) : null;
    copyText(el ? el.textContent : sel, b);
  });

  function renderReqs(box, filter) {
    var list = reqs().filter(function (r) { return !filter || r.type === filter; });
    if (!list.length) { box.innerHTML = '<p style="font-size:12px;color:#666">（暂无申请记录；提交后工单存于本机浏览器，可复制模板致信 registry@livewith.cc 进入人工审核。）</p>'; return; }
    box.innerHTML = '<ul class="req-list">' + list.map(function (r) {
      return '<li><span class="rid">' + r.id + '</span><span>' + esc(r.summary) + '</span><span class="rst">' + r.status + '</span>' +
        '<button type="button" class="btn" data-copy="#tpl-' + r.id + '">复制模板</button>' +
        '<button type="button" class="btn" data-drop="' + r.id + '">撤回</button>' +
        '<pre class="code" id="tpl-' + r.id + '" style="flex-basis:100%;margin:4px 0 0">' + esc(r.template) + '</pre></li>';
    }).join('') + '</ul>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-drop]') : null;
    if (!b) return;
    if (confirm('撤回工单 ' + b.getAttribute('data-drop') + '？此操作仅清除本机记录。')) {
      dropReq(b.getAttribute('data-drop'));
      document.querySelectorAll('[data-reqbox]').forEach(function (box) { renderReqs(box, box.getAttribute('data-reqbox') || null); });
    }
  });

  function initWhois() {
    var form = document.getElementById('whois-form');
    if (!form) return;
    var input = form.querySelector('input');
    var out = document.getElementById('whois-out');
    var log = document.getElementById('whois-log');
    var hist = [];
    function run(q) {
      var r = whois(q);
      out.textContent = r.lines.join('\n');
      hist.unshift(q || 'help'); hist = hist.slice(0, 8);
      if (log) log.innerHTML = hist.map(function (h) { return '<a href="#" data-q="' + esc(h) + '">' + esc(h) + '</a>'; }).join(' · ');
      var st = document.getElementById('whois-status');
      if (st) st.textContent = r.type === 'error' ? 'ERROR:101 — 无匹配对象' : '200 OK — object: ' + r.type;
      if (st) st.className = r.type === 'error' ? 'field-bad' : 'field-ok';
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); });
    if (log) log.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-q]') : null;
      if (a) { e.preventDefault(); input.value = a.getAttribute('data-q'); run(input.value); }
    });
    var q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; run(q); }
    else run('livewith.cc');
  }

  function initDomain() {
    var f = document.getElementById('domain-form');
    if (!f) return;
    var label = f.querySelector('[name=label]');
    var msg = document.getElementById('domain-msg');
    function check() {
      var v = label.value.trim().toLowerCase();
      if (!v) { msg.textContent = ''; msg.className = ''; return null; }
      var err = validLabel(v);
      msg.textContent = err ? '✗ ' + err : '✓ ' + v + '.livewith.cc 可申请';
      msg.className = err ? 'field-bad' : 'field-ok';
      return err ? null : v;
    }
    label.addEventListener('input', check);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = check();
      if (!v) { if (!label.value.trim()) { msg.textContent = '✗ 请先填写二级域名标签'; msg.className = 'field-bad'; } return; }
      var purpose = f.querySelector('[name=purpose]').value;
      var contact = f.querySelector('[name=contact]').value.trim();
      var ce = validEmail(contact);
      var cm = document.getElementById('domain-contact-msg');
      cm.textContent = ce ? '✗ ' + ce : ''; cm.className = ce ? 'field-bad' : '';
      if (ce) return;
      var ns1 = f.querySelector('[name=ns1]').value.trim() || 'ns1.livewith.cc';
      var ns2 = f.querySelector('[name=ns2]').value.trim() || 'ns2.livewith.cc';
      var tpl = '; PNIC delegation request\n; ticket: (assigned below)\n' + v + '.' + ZONE + '.  3600  IN  NS  ' + ns1 + '.\n' + v + '.' + ZONE + '.  3600  IN  NS  ' + ns2 + '.\n; purpose: ' + purpose + '\n; contact: ' + contact + '\n';
      var r = addReq({ type: 'domain', summary: '二级域名委派 ' + v + '.' + ZONE + '（' + purpose + '）', template: tpl });
      tpl = tpl.replace('(assigned below)', r.id);
      r.template = tpl; lsSet('pnic-reqs', reqs());
      var ok = document.getElementById('domain-ok');
      ok.innerHTML = '✓ 工单 <b class="rid">' + r.id + '</b> 已生成（本机留存）。复制模板致信 <a href="mailto:registry@livewith.cc?subject=' + encodeURIComponent('[delegation] ' + v + '.' + ZONE + ' ' + r.id) + '">registry@livewith.cc</a> 进入人工审核。';
      ok.style.display = '';
      renderReqs(document.getElementById('domain-reqs'), 'domain');
      f.reset(); check();
    });
    renderReqs(document.getElementById('domain-reqs'), 'domain');
  }

  function initMail() {
    var f = document.getElementById('mail-form');
    if (!f) return;
    var kind = f.querySelector('[name=kind]');
    var localRow = document.getElementById('mail-local-row');
    var local = f.querySelector('[name=local]');
    var target = f.querySelector('[name=target]');
    var msg = document.getElementById('mail-msg');
    function sync() {
      var k = kind.value;
      localRow.style.display = k === 'personal' ? '' : 'none';
      var hint = document.getElementById('mail-hint');
      hint.textContent = k === 'catchall' ? 'catch-all（@livewith.cc）仅注册局管理；提交即申请 postmaster 人工复核兜底策略。'
        : k === 'personal' ? '个人别名 <local>@livewith.cc 将跳转至您填写的目标邮箱。'
        : '角色邮箱 ' + k + '@livewith.cc 申请增加/变更跳转目标，需附角色身份说明。';
    }
    kind.addEventListener('change', sync); sync();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var k = kind.value;
      var errs = [];
      var lp = local.value.trim().toLowerCase();
      if (k === 'personal') {
        if (!/^[a-z0-9]([a-z0-9.-]{0,30}[a-z0-9])?$/.test(lp)) errs.push('别名须为小写字母/数字/点/连字符');
        if (RESERVED.indexOf(lp) >= 0 || ALIASES.some(function (a) { return a.addr === lp + '@' + ZONE; })) errs.push('该别名已存在或为保留字');
      }
      var tv = target.value.trim();
      var te = validEmail(tv);
      if (te) errs.push('目标邮箱：' + te);
      if (errs.length) { msg.textContent = '✗ ' + errs.join('；'); msg.className = 'field-bad'; return; }
      msg.textContent = ''; msg.className = '';
      var addr = k === 'personal' ? lp + '@' + ZONE : k === 'catchall' ? '@' + ZONE : k + '@' + ZONE;
      var tpl = '# PNIC mail alias request\n# sendmail aliases(5) format\n' + (k === 'personal' ? lp : k === 'catchall' ? '# catch-all review' : k) + ':  ' + tv + '\n# addr: ' + addr + '\n# justification: ' + (f.querySelector('[name=why]').value.trim() || '(none)') + '\n';
      var r = addReq({ type: 'mail', summary: '邮件别名转发 ' + addr + ' → ' + tv, template: tpl });
      var ok = document.getElementById('mail-ok');
      ok.innerHTML = '✓ 工单 <b class="rid">' + r.id + '</b> 已生成。复制 aliases 模板致信 <a href="mailto:registry@livewith.cc?subject=' + encodeURIComponent('[alias] ' + addr + ' ' + r.id) + '">registry@livewith.cc</a>。';
      ok.style.display = '';
      renderReqs(document.getElementById('mail-reqs'), 'mail');
      f.reset(); sync();
    });
    renderReqs(document.getElementById('mail-reqs'), 'mail');
  }

  function initShort() {
    var f = document.getElementById('short-form');
    if (!f) return;
    var url = f.querySelector('[name=url]');
    var code = f.querySelector('[name=code]');
    var msg = document.getElementById('short-msg');
    var listBox = document.getElementById('short-list');
    function all() { return SHORT_SEED.concat(lsGet('pnic-short', [])); }
    function render() {
      var rows = all().map(function (s) {
        return '<tr><td class="mono">go.livewith.cc/' + s.code + '</td><td class="wrap-mono" style="white-space:normal;word-break:break-all">' + esc(s.url) + '</td><td class="num">' + s.hits + '</td><td class="num">' + s.created + '</td><td style="white-space:nowrap">' +
          '<button type="button" class="btn" data-copy="https://go.livewith.cc/' + s.code + '">复制</button> ' +
          '<button type="button" class="btn" data-resolve="' + s.code + '">解析</button>' +
          (s.mine ? ' <button type="button" class="btn" data-delshort="' + s.code + '">删除</button>' : '') + '</td></tr>';
      }).join('');
      listBox.innerHTML = '<div class="table-wrap"><table class="reg"><tr><th>短址</th><th>目标</th><th>命中</th><th>创建</th><th>操作</th></tr>' + rows + '</table></div>';
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var u = url.value.trim();
      if (!/^https?:\/\/.+/.test(u)) { msg.textContent = '✗ 目标须为 http(s) URL'; msg.className = 'field-bad'; return; }
      var c = code.value.trim().toLowerCase();
      if (c && !/^[a-z0-9-]{3,16}$/.test(c)) { msg.textContent = '✗ 自定义码须为 3–16 位小写字母/数字/连字符'; msg.className = 'field-bad'; return; }
      if (c && all().some(function (s) { return s.code === c; })) { msg.textContent = '✗ 该码已被占用'; msg.className = 'field-bad'; return; }
      var r = apiCall('POST', '/v1/short', { url: u, code: c || undefined });
      if (r.status !== 201) { msg.textContent = '✗ ' + r.json.error; msg.className = 'field-bad'; return; }
      msg.textContent = '✓ 已生成 go.livewith.cc/' + r.json.code + '（演示存于本机）'; msg.className = 'field-ok';
      f.reset(); render();
    });
    document.addEventListener('click', function (e) {
      var rs = e.target.closest ? e.target.closest('[data-resolve]') : null;
      if (rs) {
        var c2 = rs.getAttribute('data-resolve');
        var rec = all().filter(function (s) { return s.code === c2; })[0];
        var mine = lsGet('pnic-short', []);
        var m = mine.filter(function (s) { return s.code === c2; })[0];
        if (m) { m.hits++; lsSet('pnic-short', mine); }
        var box = document.getElementById('short-resolve');
        box.style.display = '';
        box.innerHTML = '302 → <a href="' + esc(rec.url) + '" rel="noopener">' + esc(rec.url) + '</a>　<span class="hint">（演示解析，不真实跳转；命中 +1）</span>';
        render();
        return;
      }
      var dl = e.target.closest ? e.target.closest('[data-delshort]') : null;
      if (dl && confirm('删除短址 ' + dl.getAttribute('data-delshort') + '？')) {
        lsSet('pnic-short', lsGet('pnic-short', []).filter(function (s) { return s.code !== dl.getAttribute('data-delshort'); }));
        render();
      }
    });
    render();
  }

  window.PNIC = { whois: whois, api: apiCall, data: { DOMAINS: DOMAINS, ALIASES: ALIASES, HANDLES: HANDLES, NS: NS, ZONE: ZONE } };
  document.addEventListener('DOMContentLoaded', function () {
    initWhois(); initDomain(); initMail(); initShort();
  });
})();