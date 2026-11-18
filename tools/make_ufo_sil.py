"""生成飞碟白色剪影层：线条包围的封闭透明区置白，并按半径外扩白描边。
输出 assets/ufo-sil-r{0,3,6}.png（纯白，带 8px 边距，4× 采样；与 ufo-*.png 线稿同比例叠放）。
用法：python tools/make_ufo_sil.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, '..', 'assets')
PAD, K = 8, 4  # 原生像素边距 / 采样倍数
RADII = [0, 3, 6]  # 原生像素下的描边半径

src = Image.open(os.path.join(A, 'ufo-red.png')).convert('RGBA')
w, h = src.size
alpha = src.split()[3]
big = Image.new('L', ((w + 2 * PAD), (h + 2 * PAD)), 0)
big.paste(alpha, (PAD, PAD))
big = big.resize((big.width * K, big.height * K), Image.BICUBIC)
M = np.array(big) > 40

# 闭合微小缺口，再从画布外圈洪泛，剩余即“线条包围的封闭区”
closed = ndi.binary_closing(M, structure=np.ones((3, 3)), iterations=2)
lab, n = ndi.label(~closed)
outside = lab == lab[0, 0]
S = (~outside) | M
print('components of non-line area:', n, '| silhouette px:', int(S.sum()), '| line px:', int(M.sum()))

dist = ndi.distance_transform_edt(~S) / K  # 到剪影的距离（原生像素）
S_soft = ndi.gaussian_filter(S.astype(float), K * 0.5)
for r in RADII:
    a = np.clip(r + 0.5 - dist, 0, 1) if r else np.zeros_like(S_soft)
    a = np.maximum(a, S_soft)
    out = np.zeros(a.shape + (4,), np.uint8)
    out[..., :3] = 255
    out[..., 3] = (a * 255).astype(np.uint8)
    path = os.path.join(A, 'ufo-sil-r%d.png' % r)
    Image.fromarray(out, 'RGBA').save(path)
    print('wrote', os.path.basename(path), out.shape[1], 'x', out.shape[0])
