# PNIC · 厚嘴唇星网络信息中心

**Live with ChiliChill 网群官方首页** · 预定域名 `nic.livewith.cc`

> Addressing the challenge of responsible Internet resource distribution for Poutlings on Earth.

一件以 1998–2002 年各洲公共 NIC 主页为视觉语言的注册局门户：纯静态、零依赖、双击即开。视觉取证自 APNIC'99 / ARIN'00 / RIPE'98 / InterNIC'98 / CNNIC'00 / JPNIC'99 / LACNIC'02 / DENIC'99 八家公共 NIC 主页的 Wayback 存档。

## 页面

| 页面 | 内容 |
|---|---|
| `index.html` | 门户：banner 轮播 + 跑马灯同块、What's New、基础设施 / Infrastructure 与 关于 PNIC / About PNIC 双 H1 目录、服务推介 / More Services 六个待上线推介位（侧栏不在首页显示） |
| `team.html` | 什么是 PNIC？职责、角色邮箱、治理与准则 |
| `chili.html` | ChiliChill 是谁？旗舰品牌与地图功能、版本节奏 |
| `network.html` | 什么是 Live with ChiliChill 网群？成员域表、沿革、代码仓库（github.com/livewithchilichill ↗）、治理 |
| `domains.html` | 二级域名委派申请：校验/保留字/占用 → 工单 + zone 模板 + 我的申请/撤回 |
| `mail.html` | 邮件别名与转发申请：fans/vols/devs/@ 与个人别名 → aliases(5) 模板工单 |
| `shorturl.html` | 短链重定向服务：生成/复制/解析(命中+1)/删除 |
| `auth.html` | 统一认证：票据流程 SVG、scopes、接入步骤、状态 |
| `rss.html` | 统一 RSS 服务：四源 + OPML 下载 + feed.xml 实时解析预览 |
| `status.html` | 状态监测：九服务状态/延迟/九十日可用率 strips、立即检查、事件历史 |
| `whois.html` | 伪 WHOIS：domain/handle/alias/ns/help、ERROR:101、查询历史、复制输出 |
| `notices/` | 公告与政策索引 + 全文；单一数据源 `data/notices.json` → `tools/build-notices.mjs` 生成索引/详情/`feed.xml`/三个分类源/`opml.xml`，`tools/verify-notices.mjs` 交叉校验 |
| `support.html` | 支持 PNIC：捐助（层级/通道/鸣谢/透明）、参与（入册四步/开放任务认领）、联系（邮箱矩阵/PGP/起草）三合一 |
| `links.html` / `404.html` | 友链与赞助鸣谢、Web 环、计数器 / 错误页 |

## 视觉与交互约定

- 淡黄底 / 760 定宽 / 钢蓝导航块 / 红竖线（尾部渐隐）/ 琥珀查询横幅 / 红三角+琥珀圆点目录 / 灰斑马条 / Times 字标 / Win2k 斜面与滚动条
- 页眉：PNIC 字标与 W1 社徽为隐形首页链接；左 padding 与社徽绘制右缘的事实留白对齐（6/5/4px 三档）
- 响应式：单行页眉保持到 360px，≤350px 才右对齐堆叠；侧栏仅首页外显示；固定顶栏 + 锚点偏移
- banner 轮播：6s 自动、悬停暂停、圆点导航、无调整入口；标题粗 Serif、简介与按钮非衬线；按钮 hover 提亮、active 才内凹
- 未上线置灰：八张功能页的表单与操作按钮统一 disabled / .off 置灰（Win2k 灰字白 emboss），动作链接点击被拦截，页首一条琥珀提示说明逐步上线；导航、轮播圆点、网群下拉与只读展示保持可用
- 顶栏仅一枚「Live with ChiliChill 网群 ▾」下拉；页脚仅留 Last modified 与 © 两行加收尾红线与 slogan
- 工单与演示短址存于 localStorage；注册库地址采用 RFC5737 文档段

- **待上线总开关**：js/portal.js 末段 PNIC_PENDING = true 时，除 404 外各页 <main> 按 H2 切分的功能/信息模块统一换成「待上线 · COMING SOON」占位（原 DOM 仅 hidden + inert，不删除），跑马灯与首页轮播同步标注待上线；目录、导航、页眉页脚保持可用。上线时改为 alse，或在单页 <body data-launch="live"> 放行。

## 声明

本站为网群门户的**可交互演示**：WHOIS/申请/短址/状态不产生真实 delegation、邮件路由或跳转。视觉语言致敬公共 NIC 时代，未复制任何存档站点的代码与素材；地球社徽 W1 为委托草稿之工程制图方案，飞碟图像 `assets/ufo.png` 为用户提供的频道头像，按实测内容边界裁切内嵌。