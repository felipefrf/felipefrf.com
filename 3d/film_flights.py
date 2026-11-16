"""Flight Price Finder: a scroll-scrubbed clay film of one real search.

One live search from the app (2026-11-15): Salvador → São Paulo on 2026-12-10.
The cheapest normal ticket that ends anywhere in São Paulo was R$ 792 (direct to
Campinas, VCP). A ticket to Brasília (BSB) that changes planes at Congonhas (CGH)
cost R$ 534: you get off at CGH and pay R$ 258 less than any normal São Paulo
ticket. Airport coordinates come from public/flights/data.js.

Beats, over 150 frames (the page scrubs them with the scroll):
  1  the map is there; the Salvador and Congonhas pins rise
  2  the cheapest normal ticket (to Campinas) draws, and its fare stands up as a bar
  3  the search fans out: tickets through São Paulo to 8 cities beyond
  4  the arcs fold away except the winner; the leg you fly turns orange and a
     small plane flies it, stopping at CGH (the onward leg stays a thin line)
  5  the cheaper fare stands next to the direct one, and the gap between them,
     the saving, drops in as an orange block

Render: Cycles, transparent film plus a shadow catcher, composited over the
page colour (#fbfbf9) so the frames sit seamlessly on the site. Label anchors are
projected through the camera into film.json for HTML overlays (EN and PT).

Run:  blender -b -P 3d/film_flights.py -- [--frames 1-150] [--samples 48] [--test]
Then: python 3d/film_flights.py --pack   (outside Blender: PNG → WebP + poster)
"""
import json
import math
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'film', 'flights')
RAW = os.environ.get('FILM_RAW', os.path.join(ROOT, '.work', 'film-flights'))
W, H = 1280, 800
N = 150
BG = (0xFC, 0xFC, 0xFA)  # the page colour; also round-trips exactly through lossy WebP


def load_js(name):
    txt = open(os.path.join(ROOT, 'public', 'flights', name), encoding='utf-8').read()
    body = txt[txt.index('=') + 1:].strip().rstrip(';')
    return json.loads(body)


# ---------------------------------------------------------------- pack (no bpy)
def pack():
    """Flatten each RGBA frame over the page colour (ffmpeg), then WebP (cwebp)."""
    os.makedirs(os.path.join(OUT, '1280'), exist_ok=True)
    files = sorted(f for f in os.listdir(RAW) if f.endswith('.png') and not f.endswith('.flat.png'))
    bg = 'color=c=0x%02x%02x%02x:s=%dx%d' % (BG + (W, H))
    for f in files:
        src = os.path.join(RAW, f)
        flat = os.path.join(RAW, f[:-4] + '.flat.png')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-filter_complex',
                        # an RGB background: a YUV one shifts the page colour by a level or two
                        bg + ',format=rgba[b];[0:v]format=rgba[f];[b][f]overlay=format=auto:shortest=1,format=rgb24',
                        '-frames:v', '1', flat], check=True)
        subprocess.run(['cwebp', '-quiet', '-q', '72', '-m', '6', '-sharp_yuv', flat, '-o',
                        os.path.join(OUT, '1280', f[:-4] + '.webp')], check=True)
    last = os.path.join(RAW, files[-1][:-4] + '.flat.png')
    subprocess.run(['cwebp', '-quiet', '-q', '80', '-m', '6', '-sharp_yuv', last, '-o', os.path.join(OUT, 'poster.webp')], check=True)
    total = sum(os.path.getsize(os.path.join(OUT, '1280', x)) for x in os.listdir(os.path.join(OUT, '1280')))
    print('packed', len(files), 'frames,', round(total / 1024), 'KB')


if '--pack' in sys.argv:
    pack()
    sys.exit(0)

# ---------------------------------------------------------------- scene (bpy)
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
opt = {'frames': f'1-{N}', 'samples': '48'}
for i, a in enumerate(argv):
    if a.startswith('--') and i + 1 < len(argv) and not argv[i + 1].startswith('--'):
        opt[a[2:]] = argv[i + 1]
TEST = '--test' in argv
f0, f1 = (int(x) for x in opt['frames'].split('-'))

data = load_js('data.js')
basemap = load_js('basemap.js')
# Coordinates for every airport the demo knows
AIR = {}
for r in data['routes']:
    AIR.update(r['airports'])

# The search: a live one from the app, 2026-11-15 (flight-tickets data/app.db,
# search 745654864e10; HANDOVER.md). Salvador to São Paulo on 2026-12-10.
# The honest yardstick is the cheapest *normal* ticket that ends anywhere in São
# Paulo (R$ 792, direct to Campinas), not the direct fare to the same airport.
ORIGIN = 'SSA'
DEST = 'CGH'          # where you get off
BEYOND = 'BSB'        # the city the ticket is really to
NORMAL = 'VCP'        # the cheapest normal São Paulo ticket lands here
DIRECT = 792          # cheapest normal ticket to São Paulo (SSA→VCP)
FOUND = 534           # SSA→CGH→BSB, getting off at CGH
SAVING = DIRECT - FOUND
CANDS = ['GIG', 'BSB', 'CNF', 'POA', 'CWB', 'FOR', 'BEL', 'CGB']
route = {'currency': 'BRL'}
win = {'legs': [{'departure': '2026-12-10T05:55:00'}], 'book_route': 'SSA→CGH→BSB'}

# ---- projection: the same equirectangular view as the demo's basemap
P = basemap['projection']
SC = 0.0155  # blender units per basemap unit


def proj(lon, lat):
    x = (lon - P['lonMin']) * math.cos(math.radians(P['lat0'])) * P['scale']
    y = (P['latMax'] - lat) * P['scale']
    return x, y


def parse_path(d):
    rings, cur = [], []
    for cmd, xs, ys in re.findall(r'([MLZ])\s*(-?[\d.]+)?\s*(-?[\d.]+)?', d):
        if cmd == 'M':
            if cur:
                rings.append(cur)
            cur = [(float(xs), float(ys))]
        elif cmd == 'L':
            cur.append((float(xs), float(ys)))
        elif cmd == 'Z' and cur:
            rings.append(cur)
            cur = []
    if cur:
        rings.append(cur)
    return rings


def area(r):
    return 0.5 * abs(sum(r[i][0] * r[(i + 1) % len(r)][1] - r[(i + 1) % len(r)][0] * r[i][1] for i in range(len(r))))


rings = [r for r in parse_path(basemap['brazil']) if area(r) > 25]
main = max(rings, key=area)
cx = sum(p[0] for p in main) / len(main)
cy = sum(p[1] for p in main) / len(main)


def to3(x, y, z=0.0):
    return Vector(((x - cx) * SC, -(y - cy) * SC, z))


def city(code, z=0.0):
    a = AIR[code]
    return to3(*proj(a['lon'], a['lat']), z)


# ---------------------------------------------------------------- reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.frame_start, scene.frame_end = 1, N
scene.render.engine = 'CYCLES'
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.view_settings.exposure = 0.0
scene.cycles.samples = int(opt['samples'])
scene.cycles.use_denoising = True
scene.cycles.use_adaptive_sampling = True
scene.cycles.max_bounces = 6
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = 'GPU'
except Exception as e:  # CPU is fine, just slower
    print('GPU unavailable:', e)

world = bpy.data.worlds.new('w')
scene.world = world
world.use_nodes = True
bgn = world.node_tree.nodes['Background']
bgn.inputs[0].default_value = (1, 1, 1, 1)
bgn.inputs[1].default_value = 0.42


# ---------------------------------------------------------------- materials
def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c) + (1,)


def mat(name, hexc, rough=0.62, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = srgb(hexc)
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = srgb(hexc)
        b.inputs['Emission Strength'].default_value = emit
    return m


CLAY = mat('clay', '#f2f2ef')
CLAY2 = mat('clay2', '#e9e9e5')
INK = mat('ink', '#0e0f11', 0.5)
ORANGE = mat('orange', '#ff4f00', 0.45, emit=0.25)


def assign(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)


def anim(o, path, pairs, index=-1):
    """pairs: [(frame, value)], smooth between them."""
    for fr, v in pairs:
        if index >= 0:
            getattr(o, path)[index] = v
            o.keyframe_insert(data_path=path, frame=fr, index=index)
        else:
            setattr(o, path, v)
            o.keyframe_insert(data_path=path, frame=fr)


def anim_data(idblock, path, pairs):
    for fr, v in pairs:
        setattr(idblock, path, v)
        idblock.keyframe_insert(data_path=path, frame=fr)


# ---------------------------------------------------------------- floor (shadow catcher)
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
floor = bpy.context.object
floor.is_shadow_catcher = True
assign(floor, CLAY)

# ---------------------------------------------------------------- the map
SLAB = 0.11
for i, r in enumerate(rings):
    cu = bpy.data.curves.new(f'br{i}', 'CURVE')
    cu.dimensions = '2D'
    cu.fill_mode = 'BOTH'
    cu.extrude = SLAB / 2
    cu.bevel_depth = 0.012
    cu.bevel_resolution = 3
    sp = cu.splines.new('POLY')
    pts = r[:-1] if r[0] == r[-1] else r
    sp.points.add(len(pts) - 1)
    for p, (x, y) in zip(sp.points, pts):
        v = to3(x, y)
        p.co = (v.x, v.y, 0, 1)
    sp.use_cyclic_u = True
    o = bpy.data.objects.new(f'brazil{i}', cu)
    o.location.z = SLAB / 2 + 0.012
    scene.collection.objects.link(o)
    assign(o, CLAY)

TOP = SLAB + 0.024  # top surface of the slab

# state borders, very faint, as thin raised lines
if basemap.get('states'):
    for j, r in enumerate(parse_path(basemap['states'])):
        if len(r) < 2:
            continue
        cu = bpy.data.curves.new(f'st{j}', 'CURVE')
        cu.dimensions = '3D'
        cu.bevel_depth = 0.0028
        cu.bevel_resolution = 1
        sp = cu.splines.new('POLY')
        sp.points.add(len(r) - 1)
        for p, (x, y) in zip(sp.points, r):
            v = to3(x, y, TOP + 0.001)
            p.co = (v.x, v.y, v.z, 1)
        o = bpy.data.objects.new(f'state{j}', cu)
        scene.collection.objects.link(o)
        assign(o, CLAY2)


# ---------------------------------------------------------------- pins and dots
def pin(code, head_mat, stem_h=0.30, r=0.05, start=1, end=18):
    base = city(code, TOP)
    g = bpy.data.objects.new(f'pin_{code}', None)
    g.location = base
    scene.collection.objects.link(g)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0065, depth=stem_h, location=(0, 0, stem_h / 2))
    stem = bpy.context.object
    stem.parent = g
    assign(stem, INK)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(0, 0, stem_h + r * 0.8), segments=48, ring_count=24)
    head = bpy.context.object
    bpy.ops.object.shade_smooth()
    head.parent = g
    assign(head, head_mat)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.008, location=(0, 0, 0.004), vertices=48)
    foot = bpy.context.object
    foot.parent = g
    assign(foot, INK)
    anchor = bpy.data.objects.new(f'a_{code}', None)
    anchor.parent = g
    anchor.location = (0, 0, stem_h + r * 2.2)
    scene.collection.objects.link(anchor)
    anim(g, 'scale', [(1, (1, 1, 0.001)), (start, (1, 1, 0.001)), (end, (1, 1, 1))])
    return g, anchor, head


pin_o, a_origin, _ = pin(ORIGIN, CLAY, start=2, end=16)
pin_d, a_dest, head_d = pin(DEST, CLAY, start=6, end=20)


def dot(code, start):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.034, depth=0.03, location=city(code, TOP + 0.015), vertices=40)
    o = bpy.context.object
    bpy.ops.object.modifier_add(type='BEVEL')
    o.modifiers[-1].width = 0.008
    o.modifiers[-1].segments = 3
    bpy.ops.object.shade_smooth()
    assign(o, CLAY)
    anim(o, 'scale', [(1, (0.001, 0.001, 0.001)), (start, (0.001, 0.001, 0.001)), (start + 6, (1, 1, 1))])
    ring = bpy.ops.mesh.primitive_torus_add(major_radius=0.034, minor_radius=0.0045, location=city(code, TOP + 0.031))
    t = bpy.context.object
    assign(t, INK)
    anim(t, 'scale', [(1, (0.001, 0.001, 0.001)), (start, (0.001, 0.001, 0.001)), (start + 6, (1, 1, 1))])
    return o


# ---------------------------------------------------------------- arcs
def arc_points(a, b, lift, n=64):
    d = (b - a).length
    pts = []
    for i in range(n + 1):
        t = i / n
        p = a.lerp(b, t)
        p.z += math.sin(math.pi * t) * lift * d
        pts.append(p)
    return pts


def arc(name, a, b, m, radius=0.0055, lift=0.28):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    cu.bevel_factor_mapping_start = 'SPLINE'
    cu.bevel_factor_mapping_end = 'SPLINE'
    sp = cu.splines.new('POLY')
    pts = arc_points(a, b, lift)
    sp.points.add(len(pts) - 1)
    for p, v in zip(sp.points, pts):
        p.co = (v.x, v.y, v.z, 1)
    o = bpy.data.objects.new(name, cu)
    scene.collection.objects.link(o)
    assign(o, m)
    return o, cu


def draw(cu, a, b, out_a=None, out_b=None):
    """grow bevel_factor_end 0→1 over frames a..b; optionally retract start 0→1 over out_a..out_b"""
    anim_data(cu, 'bevel_factor_end', [(1, 0.0), (a, 0.0), (b, 1.0)])
    if out_a is not None:
        anim_data(cu, 'bevel_factor_start', [(1, 0.0), (out_a, 0.0), (out_b, 1.0)])


A = city(ORIGIN, TOP + 0.02)
B = city(DEST, TOP + 0.02)
C = city(BEYOND, TOP + 0.02)

# beat 2: the obvious direct flight
V = city(NORMAL, TOP + 0.02)
dot(NORMAL, 12)
_, cu_direct = arc('direct', A, V, INK, radius=0.0055, lift=0.22)
draw(cu_direct, 14, 34)

# beat 3: the fan-out of tickets through VCP to the cities beyond
fan = []
seen = []
CANDS_DRAWN = []
for c in sorted(CANDS, key=lambda c: c != BEYOND):
    v = city(c)
    if all((v - w).length > 0.08 for w in seen):
        seen.append(v)
        CANDS_DRAWN.append(c)
order = sorted(CANDS_DRAWN, key=lambda c: math.atan2(city(c).y - B.y, city(c).x - B.x))
for k, c in enumerate(order):
    s = 44 + k * 2
    dot(c, s - 2)
    o, cu = arc(f'fan_{c}', B, city(c, TOP + 0.02), INK, radius=0.0038, lift=0.32)
    if c == BEYOND:
        draw(cu, s, s + 14)          # the winner's onward leg stays
        beyond_dot = o
    else:
        draw(cu, s, s + 14, 82 + (k % 5) * 2, 96 + (k % 5) * 2)
    fan.append(o)

a_beyond = bpy.data.objects.new('a_beyond', None)
a_beyond.location = city(BEYOND, TOP + 0.09)
scene.collection.objects.link(a_beyond)

# beat 4: the leg you actually fly, in orange, and the plane
_, cu_win = arc('win', A, B, ORANGE, radius=0.0105, lift=0.22)
draw(cu_win, 86, 104)
# the direct arc folds away as the orange one takes its place
anim_data(cu_direct, 'bevel_factor_start', [(1, 0.0), (86, 0.0), (104, 1.0)])

path_cu = bpy.data.curves.new('path', 'CURVE')
path_cu.dimensions = '3D'
psp = path_cu.splines.new('POLY')
ppts = arc_points(A + Vector((0, 0, 0.05)), B + Vector((0, 0, 0.05)), 0.22, 96)
psp.points.add(len(ppts) - 1)
for p, v in zip(psp.points, ppts):
    p.co = (v.x, v.y, v.z, 1)
path = bpy.data.objects.new('path', path_cu)
scene.collection.objects.link(path)
path_cu.use_path = True
path_cu.path_duration = 100

plane = bpy.data.objects.new('plane', None)
scene.collection.objects.link(plane)


def part(prim, loc, scale, rot=(0, 0, 0), m=CLAY, **kw):
    getattr(bpy.ops.mesh, prim)(location=loc, rotation=rot, **kw)
    o = bpy.context.object
    o.scale = scale
    if prim != 'primitive_cube_add':
        bpy.ops.object.shade_smooth()
    else:
        bpy.ops.object.modifier_add(type='BEVEL')
        o.modifiers[-1].width = 0.004
        o.modifiers[-1].segments = 3
    o.parent = plane
    assign(o, m)
    return o


# a small clay airliner, nose along +Y (the follow-path forward axis)
part('primitive_uv_sphere_add', (0, 0, 0), (0.026, 0.13, 0.026), segments=48, ring_count=24)
part('primitive_cube_add', (0, 0.006, -0.004), (0.16, 0.026, 0.0035))
part('primitive_cube_add', (0, -0.105, 0.0), (0.06, 0.016, 0.003))
part('primitive_cube_add', (0, -0.11, 0.03), (0.003, 0.02, 0.03))
part('primitive_uv_sphere_add', (0.07, 0.015, -0.016), (0.011, 0.03, 0.011), segments=24, ring_count=12, m=CLAY2)
part('primitive_uv_sphere_add', (-0.07, 0.015, -0.016), (0.011, 0.03, 0.011), segments=24, ring_count=12, m=CLAY2)
plane.scale = (1, 1, 1)
fp = plane.constraints.new('FOLLOW_PATH')
fp.target = path
fp.use_curve_follow = True
fp.use_fixed_location = True
fp.forward_axis = 'FORWARD_Y'
fp.up_axis = 'UP_Z'
anim(fp, 'offset_factor', [(1, 0.0), (96, 0.0), (124, 1.0)])
anim(plane, 'scale', [(1, (0.001,) * 3), (93, (0.001,) * 3), (99, (1.25,) * 3), (124, (1.25,) * 3), (130, (0.001,) * 3)])

# landing pulse at VCP: an orange ring that settles around the pin
bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.006, location=city(DEST, TOP + 0.006), major_segments=64)
pulse = bpy.context.object
assign(pulse, ORANGE)
anim(pulse, 'scale', [(1, (0.001,) * 3), (122, (0.001,) * 3), (130, (1.6, 1.6, 1)), (138, (1, 1, 1))])
# the VCP head turns orange once you're there
head_d.data.materials.clear()
mixm = mat('vcp', '#f2f2ef')
head_d.data.materials.append(mixm)
bsdf = mixm.node_tree.nodes['Principled BSDF']
for fr, col in ((1, '#f2f2ef'), (124, '#f2f2ef'), (130, '#ff4f00')):
    bsdf.inputs['Base Color'].default_value = srgb(col)
    bsdf.inputs['Base Color'].keyframe_insert('default_value', frame=fr)

# ---------------------------------------------------------------- fare bars
HMAX = 1.45
U = HMAX / DIRECT  # height per real


def bar(name, x, y, w=0.34, d=0.34, m=CLAY):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))
    o = bpy.context.object
    bpy.ops.object.transform_apply(location=True)
    o.location = (x, y, 0)
    o.scale = (w, d, 1)
    bpy.ops.object.modifier_add(type='BEVEL')
    o.modifiers[-1].width = 0.018
    o.modifiers[-1].segments = 4
    o.modifiers[-1].affect = 'EDGES'
    o.name = name
    assign(o, m)
    return o


BX, BY = 3.55, -1.25
bar_direct = bar('bar_direct', BX, BY)
bar_found = bar('bar_found', BX + 0.46, BY)
bar_save = bar('bar_save', BX + 0.46, BY, m=ORANGE)
# a plinth under the bars, so they read as an object on the table, not floating
plinth = bar('plinth', BX + 0.23, BY, w=0.98, d=0.56, m=CLAY)
plinth.scale.z = 0.05
plinth.modifiers[-1].width = 0.012

Z0 = 0.05
bar_direct.location.z = bar_found.location.z = Z0
anim(bar_direct, 'scale', [(1, (0.34, 0.34, 0.001)), (16, (0.34, 0.34, 0.001)), (38, (0.34, 0.34, DIRECT * U))], index=-1)
anim(bar_found, 'scale', [(1, (0.34, 0.34, 0.001)), (106, (0.34, 0.34, 0.001)), (126, (0.34, 0.34, FOUND * U))])
GAP = 0.03
anim(bar_save, 'scale', [(1, (0.001, 0.001, 0.001)), (122, (0.001, 0.001, 0.001)), (124, (0.34, 0.34, SAVING * U - GAP))])
anim(bar_save, 'location', [(1, (BX + 0.46, BY, Z0 + FOUND * U + GAP + 0.9)), (124, (BX + 0.46, BY, Z0 + FOUND * U + GAP + 0.9)),
                            (140, (BX + 0.46, BY, Z0 + FOUND * U + GAP))])


def top_anchor(name, o):
    e = bpy.data.objects.new(name, None)
    e.parent = o
    e.location = (0, 0, 1.0)
    scene.collection.objects.link(e)
    return e


a_direct = top_anchor('a_direct', bar_direct)
a_found = top_anchor('a_found', bar_found)
a_save = bpy.data.objects.new('a_save', None)
a_save.parent = bar_save
a_save.location = (0, 0, 0.5)
scene.collection.objects.link(a_save)

# ---------------------------------------------------------------- light and camera
bpy.ops.object.light_add(type='AREA', location=(-5.5, -4.5, 9.0))
key_l = bpy.context.object
key_l.data.size = 9
key_l.data.energy = 650
key_l.rotation_euler = (math.radians(38), 0, math.radians(-50))
tgt = bpy.data.objects.new('tgt', None)
scene.collection.objects.link(tgt)
tr = key_l.constraints.new('TRACK_TO')
tr.target = tgt
bpy.ops.object.light_add(type='AREA', location=(6, 5, 5))
fill = bpy.context.object
fill.data.size = 10
fill.data.energy = 120
tr2 = fill.constraints.new('TRACK_TO')
tr2.target = tgt

cam_d = bpy.data.cameras.new('cam')
cam_d.lens = 50
cam_d.sensor_width = 36
cam = bpy.data.objects.new('cam', cam_d)
scene.collection.objects.link(cam)
scene.camera = cam
look = bpy.data.objects.new('look', None)
scene.collection.objects.link(look)
tc = cam.constraints.new('TRACK_TO')
tc.target = look
tc.track_axis = 'TRACK_NEGATIVE_Z'
tc.up_axis = 'UP_Y'


def cam_at(fr, az, el, dist, lx, ly, lz):
    a, e = math.radians(az), math.radians(el)
    cam.location = (lx + dist * math.cos(e) * math.sin(a), ly - dist * math.cos(e) * math.cos(a), lz + dist * math.sin(e))
    cam.keyframe_insert('location', frame=fr)
    look.location = (lx, ly, lz)
    look.keyframe_insert('location', frame=fr)


# slow orbit: starts closer on the route, opens up to include the bars, ends framed on both
cam_at(1, -20, 52, 10.4, 1.45, -0.55, 0.2)
cam_at(45, -15, 50, 11.2, 1.75, -0.85, 0.3)
cam_at(95, -9, 47, 11.2, 1.95, -0.85, 0.35)
cam_at(150, -4, 44, 10.6, 2.05, -0.8, 0.4)

# smooth every fcurve; the follow path and the bars use ease in/out
for o in list(bpy.data.objects) + list(bpy.data.curves) + list(bpy.data.materials):
    ad = getattr(o, 'animation_data', None)
    if not ad and hasattr(o, 'node_tree') and o.node_tree:
        ad = o.node_tree.animation_data
    if ad and ad.action:
        try:
            curves = ad.action.fcurves
        except AttributeError:  # Blender 5 layered actions
            curves = [fc for layer in ad.action.layers for strip in layer.strips for cb in strip.channelbags for fc in cb.fcurves]
        for fc in curves:
            for k in fc.keyframe_points:
                k.interpolation = 'BEZIER'
                k.easing = 'AUTO'
                k.handle_left_type = k.handle_right_type = 'AUTO_CLAMPED'


# ---------------------------------------------------------------- labels → film.json
def visible(fr):
    return {
        'origin': fr >= 14,
        'dest': fr >= 18,
        'direct': fr >= 36,
        'beyond': 58 <= fr,
        'found': fr >= 126,
        'saving': fr >= 138,
    }


anchors = {'origin': a_origin, 'dest': a_dest, 'direct': a_direct, 'beyond': a_beyond, 'found': a_found, 'saving': a_save}
labels = {k: [] for k in anchors}
for fr in range(1, N + 1):
    scene.frame_set(fr)
    bpy.context.view_layer.update()
    vis = visible(fr)
    for k, e in anchors.items():
        co = world_to_camera_view(scene, cam, e.matrix_world.translation)
        if vis[k] and co.z > 0 and 0 <= co.x <= 1 and 0 <= co.y <= 1:
            labels[k].append([round(co.x, 4), round(1 - co.y, 4)])
        else:
            labels[k].append(None)

os.makedirs(OUT, exist_ok=True)
meta = {
    'origin': ORIGIN, 'originCity': AIR[ORIGIN]['city'],
    'dest': DEST, 'destCity': AIR[DEST]['city'],
    'beyond': BEYOND, 'beyondCity': AIR[BEYOND]['city'],
    'normal': NORMAL, 'normalCity': AIR[NORMAL]['city'],
    'direct': DIRECT, 'found': FOUND, 'saving': SAVING, 'currency': route['currency'],
    'date': win['legs'][0]['departure'][:10], 'candidates': len(CANDS),
    'bookRoute': win['book_route'],
}
if not TEST:
    with open(os.path.join(OUT, 'film.json'), 'w') as fh:
        json.dump({'count': N, 'w': W, 'h': H, 'meta': meta, 'labels': labels}, fh, separators=(',', ':'))
    print('wrote film.json')

# ---------------------------------------------------------------- render
os.makedirs(RAW, exist_ok=True)
for fr in range(f0, f1 + 1):
    scene.frame_set(fr)
    scene.render.filepath = os.path.join(RAW, f'{fr:04d}.png')
    bpy.ops.render.render(write_still=True)
    print('frame', fr, flush=True)
