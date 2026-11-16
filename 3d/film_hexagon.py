"""Hexagon / Milo: a scroll-scrubbed clay film of what Felipe built there.

Milo gives every person on a team an AI agent, each one running on its own
private machine in the cloud with that person's tools. Only public facts here.

Beats, over 150 frames (the page scrubs them with the scroll):
  1  a team: four clay figures rise on a slab
  2  behind each person a small private machine rises, joined by a thin ink
     line: one agent each
  3  message tiles fly in from four directions (the channels: Slack, WhatsApp,
     Teams, Google Chat; the names are HTML labels) and land in the machines;
     the replies go back out, one of them orange
  4  the vault: a card slides out of a clay safe beside the last machine, goes
     around it into a browser panel, and the password field fills with dots;
     the agent's machine never touches it
  5  replayed real cases run along a short conveyor through a check gate and
     settle in a neat stack, the last one orange

Render: Cycles, transparent film plus a shadow catcher, composited over the
page colour (#fbfbf9). Same look and helpers as 3d/film_flights.py. Label
anchors are projected through the camera into film.json for HTML overlays.

Run:  blender -b -P 3d/film_hexagon.py -- [--frames 1-150] [--samples 40] [--test]
Then: python3 3d/film_hexagon.py --pack   (outside Blender: PNG → WebP + poster)
"""
import json
import math
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'film', 'hexagon')
RAW = os.environ.get('FILM_RAW', os.path.join(ROOT, '.work', 'film-hexagon'))
W, H = 1280, 800
N = 150
BG = (0xFC, 0xFC, 0xFA)  # the page colour; also round-trips exactly through lossy WebP


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
opt = {'frames': f'1-{N}', 'samples': '40'}
for i, a in enumerate(argv):
    if a.startswith('--') and i + 1 < len(argv) and not argv[i + 1].startswith('--'):
        opt[a[2:]] = argv[i + 1]
TEST = '--test' in argv
if '-' not in opt['frames']:
    FRAMES = [int(x) for x in opt['frames'].split(',') if x]
else:
    f0, f1 = (int(x) for x in opt['frames'].split('-'))
    FRAMES = list(range(f0, f1 + 1))

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
    if os.environ.get('FILM_CPU'):
        raise RuntimeError('FILM_CPU set')
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


def turns_orange(name, frames):
    """a clay material that turns orange between frames (a, b)"""
    m = mat(name, '#f2f2ef')
    b = m.node_tree.nodes['Principled BSDF']
    a0, a1 = frames
    for fr, col, em in ((1, '#f2f2ef', 0.0), (a0, '#f2f2ef', 0.0), (a1, '#ff4f00', 0.25)):
        b.inputs['Base Color'].default_value = srgb(col)
        b.inputs['Base Color'].keyframe_insert('default_value', frame=fr)
        b.inputs['Emission Color'].default_value = srgb('#ff4f00')
        b.inputs['Emission Strength'].default_value = em
        b.inputs['Emission Strength'].keyframe_insert('default_value', frame=fr)
    b.inputs['Roughness'].default_value = 0.5
    return m


def assign(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)


def anim(o, path, pairs):
    """pairs: [(frame, value)], smooth between them."""
    for fr, v in pairs:
        setattr(o, path, v)
        o.keyframe_insert(data_path=path, frame=fr)


def anim_data(idblock, path, pairs):
    for fr, v in pairs:
        setattr(idblock, path, v)
        idblock.keyframe_insert(data_path=path, frame=fr)


Z = (0.001,) * 3
ONE = (1.0,) * 3


def pop(o, a, b, full=ONE, out=None):
    """scale 0 → full over frames a..b; optionally back to 0 over out=(c, d)"""
    keys = [(1, Z), (a, Z), (b, full)]
    if out:
        keys += [(out[0], full), (out[1], Z)]
    anim(o, 'scale', keys)


def show_from(o, fr):
    """hidden from render until frame fr (a squashed object still shows its footprint)"""
    for x in [o] + list(o.children_recursive):
        if x.type in ('MESH', 'CURVE'):
            x.hide_render = True
            x.keyframe_insert('hide_render', frame=1)
            x.keyframe_insert('hide_render', frame=fr - 1)
            x.hide_render = False
            x.keyframe_insert('hide_render', frame=fr)


def rise(o, a, b, full=ONE):
    """grow up from the floor: scale z 0 → 1 over a..b"""
    flat = (full[0], full[1], 0.001)
    anim(o, 'scale', [(1, flat), (a, flat), (b, full)])
    show_from(o, a + 1)


def group(name, loc=(0, 0, 0), rot=(0, 0, 0)):
    g = bpy.data.objects.new(name, None)
    g.location = loc
    g.rotation_euler = rot
    scene.collection.objects.link(g)
    return g


def empty(name, parent=None, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    e.parent = parent
    e.location = loc
    scene.collection.objects.link(e)
    return e


def smooth():
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
    except Exception:
        bpy.ops.object.shade_smooth()


def box(parent, loc, size, m=CLAY, bevel=0.012, segs=3):
    """a bevelled box; size is the full (w, d, h)"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    o.location = loc
    if bevel:
        bpy.ops.object.modifier_add(type='BEVEL')
        o.modifiers[-1].width = bevel
        o.modifiers[-1].segments = segs
        o.modifiers[-1].affect = 'EDGES'
        smooth()
    o.parent = parent
    assign(o, m)
    return o


def cyl(parent, loc, r, h, m=CLAY, r2=None, verts=48, bevel=0.0, rot=(0, 0, 0)):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=verts, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, vertices=verts, rotation=rot)
    o = bpy.context.object
    if bevel:
        bpy.ops.object.modifier_add(type='BEVEL')
        o.modifiers[-1].width = bevel
        o.modifiers[-1].segments = 3
        o.modifiers[-1].limit_method = 'ANGLE'
    smooth()
    o.parent = parent
    assign(o, m)
    return o


def ball(parent, loc, r, m=CLAY, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.object
    o.scale = scale
    bpy.ops.object.shade_smooth()
    o.parent = parent
    assign(o, m)
    return o


def line(name, pts, m=INK, radius=0.0045, parent=None):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    cu.bevel_factor_mapping_start = 'SPLINE'
    cu.bevel_factor_mapping_end = 'SPLINE'
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, v in zip(sp.points, pts):
        p.co = (v[0], v[1], v[2], 1)
    o = bpy.data.objects.new(name, cu)
    o.parent = parent
    scene.collection.objects.link(o)
    assign(o, m)
    return o, cu


def arc_points(a, b, lift, n=48):
    a, b = Vector(a), Vector(b)
    d = (b - a).length
    pts = []
    for i in range(n + 1):
        t = i / n
        p = a.lerp(b, t)
        p.z += math.sin(math.pi * t) * lift * d
        pts.append(p)
    return pts


def draw(cu, a, b):
    anim_data(cu, 'bevel_factor_end', [(1, 0.0), (a, 0.0), (b, 1.0)])


# ---------------------------------------------------------------- floor (shadow catcher)
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
floor = bpy.context.object
floor.is_shadow_catcher = True
assign(floor, CLAY)

# ---------------------------------------------------------------- the slab
TOP = 0.06
slab = box(None, (0, 0.38, TOP / 2), (2.7, 1.3, TOP), bevel=0.014)

XS = [-0.93, -0.31, 0.31, 0.93]   # one person, one machine
FY = 0.0                           # the people
MY = 0.70                          # their machines
MW, MD, MH = 0.36, 0.30, 0.46      # machine size
MTOP = TOP + MH

# ---------------------------------------------------------------- 1 the team
HEIGHTS = [1.0, 0.92, 1.06, 0.96]
heads = []
for k, (x, hs) in enumerate(zip(XS, HEIGHTS)):
    g = group(f'person{k}', (x, FY, TOP))
    cyl(g, (0, 0, 0.012), 0.105, 0.024, bevel=0.006)
    cyl(g, (0, 0, 0.024 + 0.13 * hs), 0.115, 0.26 * hs, r2=0.062, bevel=0.01)
    cyl(g, (0, 0, 0.024 + 0.26 * hs + 0.012), 0.03, 0.03)
    ball(g, (0, 0, 0.024 + 0.26 * hs + 0.085), 0.072)
    heads.append(Vector((x, FY, TOP + 0.024 + 0.26 * hs + 0.16)))
    s = 2 + k * 3
    rise(g, s, s + 12)

a_team = empty('a_team', loc=heads[0] + Vector((0, 0, 0.06)))

# ---------------------------------------------------------------- 2 one private machine each
machines = []
for k, x in enumerate(XS):
    g = group(f'machine{k}', (x, MY, TOP))
    box(g, (0, 0, MH / 2), (MW, MD, MH), bevel=0.02)
    fy = -MD / 2 - 0.002
    for j in range(3):  # vents
        box(g, (-0.03, fy, MH - 0.08 - j * 0.035), (0.2, 0.006, 0.007), m=INK, bevel=0)
    ball(g, (0.115, fy, MH - 0.08), 0.012, m=INK)
    box(g, (0, fy + 0.001, 0.07), (0.26, 0.004, 0.05), m=CLAY2, bevel=0.002)  # a drive bay
    s = 16 + k * 3
    rise(g, s, s + 12)
    machines.append(g)
    # the person and their agent, joined by a thin ink line
    # a cable on the slab from the person's side to their machine, curving out so
    # the figure never hides it
    zc = TOP + 0.0045
    p0 = Vector((x + 0.1, FY + 0.03, zc))
    p2 = Vector((x + 0.02, MY - MD / 2 - 0.004, zc))
    c1 = Vector((x + 0.2, (FY + MY) / 2 - 0.05, zc))
    pts = [(1 - t) ** 2 * p0 + 2 * (1 - t) * t * c1 + t * t * p2 for t in (i / 32 for i in range(33))]
    _, cu = line(f'link{k}', pts)
    draw(cu, s + 12, s + 20)
    nub0 = cyl(None, (p0.x, p0.y, TOP + 0.004), 0.014, 0.008, m=INK, verts=32)
    pop(nub0, s + 11, s + 13)
    nub = cyl(None, (p2.x, p2.y, TOP + 0.004), 0.016, 0.008, m=INK, verts=32)
    pop(nub, s + 19, s + 21)

a_machine = empty('a_machine', loc=(XS[2], MY, MTOP + 0.08))


# ---------------------------------------------------------------- tiles (messages, test cases)
def tile(name, m=CLAY, check=False):
    g = group(name)
    box(g, (0, 0, 0), (0.2, 0.14, 0.022), m=m, bevel=0.008)
    box(g, (-0.02, 0.025, 0.0125), (0.12, 0.016, 0.004), m=INK, bevel=0)
    box(g, (-0.04, -0.012, 0.0125), (0.08, 0.016, 0.004), m=INK, bevel=0)
    tick = None
    if check:
        tick = group(name + '_tick')
        tick.parent = g
        tick.location = (0.06, -0.02, 0.0125)
        a = box(tick, (-0.012, 0.0, 0), (0.026, 0.008, 0.004), m=INK, bevel=0)
        a.rotation_euler = (0, 0, math.radians(-45))
        a.location = (-0.013, 0.004, 0)
        b = box(tick, (0.0, 0.0, 0), (0.05, 0.008, 0.004), m=INK, bevel=0)
        b.rotation_euler = (0, 0, math.radians(55))
        b.location = (0.01, 0.012, 0)
    return g, tick


def fly(g, keys):
    """keys: [(frame, (x, y, z))]"""
    anim(g, 'location', [(1, keys[0][1])] + keys)


LAND = MTOP + 0.013
SRC = {  # where each channel's messages come from
    'left': Vector((-1.45, MY, 0.9)),
    'back': Vector((0.0, 1.6, 0.85)),
    'top': Vector((0.0, MY, 1.2)),
    'right': Vector((1.6, MY, 0.9)),
}
ROUTES = [('left', 0), ('back', 1), ('top', 2), ('right', 3), ('back', 2), ('top', 0)]
for k, (src, mi) in enumerate(ROUTES):
    s = 40 + k * 2 + (4 if k >= 4 else 0)
    start = SRC[src].copy()
    if src in ('top', 'back'):
        start.x = XS[mi] * 0.6
    land = Vector((XS[mi], MY, LAND))
    mid = start.lerp(land, 0.55)
    mid.z = max(start.z, land.z) + 0.12
    g, _ = tile(f'msg{k}')
    fly(g, [(s, start), (s + 7, mid), (s + 13, land), (s + 15, land), (s + 18, land - Vector((0, 0, 0.03)))])
    anim(g, 'scale', [(1, Z), (s, Z), (s + 3, ONE), (s + 15, ONE), (s + 18, Z)])

# the replies go back out the way their messages came in; one turns orange
REPLY_ORANGE = 1
for k, (src, mi) in enumerate(ROUTES[:4]):
    s = 62 + k * 2
    land = Vector((XS[mi], MY, LAND))
    up = land + Vector((0, 0, 0.22))
    out = SRC[src].copy()
    if src in ('top', 'back'):
        out.x = XS[mi] * 0.6
    mid = up.lerp(out, 0.5)
    mid.z += 0.1
    m = turns_orange('reply_orange', (s + 1, s + 6)) if k == REPLY_ORANGE else CLAY
    g, _ = tile(f'reply{k}', m=m)
    fly(g, [(s, land - Vector((0, 0, 0.02))), (s + 5, up), (s + 11, mid), (s + 17, out)])
    anim(g, 'scale', [(1, Z), (s, Z), (s + 3, ONE), (s + 14, ONE), (s + 17, Z)])

a_channels = empty('a_channels', loc=(-1.25, MY, 1.0))

# ---------------------------------------------------------------- 4 the vault
SX, SY = 1.72, 0.64
safe = group('safe', (SX, SY, 0))
box(safe, (0, 0, 0.19), (0.38, 0.34, 0.38), bevel=0.022)
box(safe, (0, -0.172, 0.19), (0.3, 0.012, 0.3), m=CLAY2, bevel=0.006)        # the door
cyl(safe, (0.0, -0.182, 0.22), 0.05, 0.014, rot=(math.radians(90), 0, 0))     # the dial
bpy.ops.mesh.primitive_torus_add(major_radius=0.05, minor_radius=0.0035, location=(0.0, -0.19, 0.22),
                                 rotation=(math.radians(90), 0, 0), major_segments=48)
t = bpy.context.object
t.parent = safe
assign(t, INK)
ball(safe, (0.0, -0.19, 0.22), 0.009, m=INK)
box(safe, (0.0, -0.183, 0.11), (0.09, 0.014, 0.016), m=INK, bevel=0.003)       # the lever
for hz in (0.1, 0.28):                                                          # the hinges
    box(safe, (-0.152, -0.18, hz), (0.012, 0.012, 0.04), m=INK, bevel=0.002)
box(safe, (0, 0, 0.381), (0.15, 0.03, 0.004), m=INK, bevel=0)                  # the slot on top
rise(safe, 72, 82)

PX, PY = 1.7, -0.32
PROT = math.radians(-8)
panel = group('panel', (PX, PY, 0), (0, 0, PROT))
cyl(panel, (0, 0, 0.01), 0.13, 0.02, bevel=0.005)
cyl(panel, (0, 0, 0.08), 0.016, 0.12)
SW, SH, SZ = 0.68, 0.46, 0.37
box(panel, (0, 0, SZ), (SW, 0.04, SH), bevel=0.016)
FRONT = -0.0215
line('chrome', [(-SW / 2 + 0.03, FRONT - 0.003, SZ + SH / 2 - 0.07), (SW / 2 - 0.03, FRONT - 0.003, SZ + SH / 2 - 0.07)],
     radius=0.0025, parent=panel)
for j in range(3):
    ball(panel, (-SW / 2 + 0.045 + j * 0.028, FRONT, SZ + SH / 2 - 0.037), 0.008, m=INK)


def field(z, w=0.46, h=0.07):
    box(panel, (0, FRONT + 0.001, z), (w, 0.006, h), m=CLAY2, bevel=0.003)
    x0, x1, y = -w / 2, w / 2, FRONT - 0.004
    line('fld', [(x0, y, z - h / 2), (x1, y, z - h / 2), (x1, y, z + h / 2), (x0, y, z + h / 2), (x0, y, z - h / 2)],
         radius=0.0018, parent=panel)


field(SZ + 0.07)   # the user name, filled in by name
box(panel, (-0.11, FRONT - 0.004, SZ + 0.07), (0.2, 0.004, 0.012), m=INK, bevel=0)
FZ = SZ - 0.04     # the password
field(FZ)
box(panel, (0, FRONT, SZ - 0.15), (0.16, 0.01, 0.05), m=CLAY2, bevel=0.008)  # the button
rise(panel, 76, 86)

dots = []
for j in range(8):
    d = ball(panel, (-0.19 + j * 0.034, FRONT - 0.006, FZ), 0.0105, m=INK)
    pop(d, 101 + j, 103 + j)
    dots.append(d)

# the key card: out of the safe's slot, around the machine, into the field
key, _ = tile('key')
P_IN = Vector((PX + math.sin(PROT) * 0.0, PY - 0.06, FZ))  # just in front of the field
fly(key, [(86, (SX, SY, 0.33)), (89, (SX, SY, 0.56)), (93, (SX + 0.42, SY - 0.3, 0.72)),
          (97, (PX + 0.2, PY - 0.28, 0.62)), (101, P_IN)])
anim(key, 'rotation_euler', [(1, (0, 0, 0)), (89, (0, 0, 0)), (99, (math.radians(90), 0, PROT))])
anim(key, 'scale', [(1, Z), (86, Z), (88, ONE), (100, ONE), (104, Z)])

a_vault = empty('a_vault', loc=(SX, SY, 0.46))

# ---------------------------------------------------------------- 5 the tests
CY = -0.86
CX0, CX1 = -1.6, 0.16
GX = -0.8
belt = group('belt', ((CX0 + CX1) / 2, CY, 0))
box(belt, (0, 0, 0.025), (CX1 - CX0, 0.3, 0.05), bevel=0.01)
for side in (-1, 1):
    line('rail', [(-(CX1 - CX0) / 2 + 0.03, side * 0.12, 0.052), ((CX1 - CX0) / 2 - 0.03, side * 0.12, 0.052)],
         radius=0.002, parent=belt)
rise(belt, 98, 106)

gate = group('gate', (GX, CY, 0))
GL, GH = 0.24, 0.19                       # a scanner hood the cases pass under
for side in (-1, 1):
    box(gate, (0, side * 0.19, GH / 2), (GL, 0.04, GH), bevel=0.01)
box(gate, (0, 0, GH + 0.02), (GL, 0.42, 0.04), bevel=0.012)
gt = group('gate_tick')
gt.parent = gate
gt.location = (0, 0, GH + 0.041)
gt.scale = (1.8, 1.8, 1)
ta = box(gt, (-0.013, 0.004, 0), (0.026, 0.008, 0.004), m=INK, bevel=0)
ta.rotation_euler = (0, 0, math.radians(-45))
tb = box(gt, (0.01, 0.012, 0), (0.05, 0.008, 0.004), m=INK, bevel=0)
tb.rotation_euler = (0, 0, math.radians(55))
for end in (-1, 1):
    gx = end * (GL / 2 + 0.003)
    line('mouth', [(gx, -0.17, 0.0), (gx, -0.17, GH - 0.012), (gx, 0.17, GH - 0.012), (gx, 0.17, 0.0)],
         radius=0.0025, parent=gate)
rise(gate, 100, 108)

TX = 0.5
tray = box(None, (TX, CY, 0.015), (0.3, 0.24, 0.03), bevel=0.008)
rise(tray, 102, 108)

NCARD = 5
CZ = 0.05 + 0.012
for i in range(NCARD):
    s = 106 + i * 5
    last = i == NCARD - 1
    m = turns_orange('case_orange', (s + 6, s + 9)) if last else CLAY
    g, tick = tile(f'case{i}', m=m, check=True)
    zi = 0.03 + 0.012 + i * 0.026
    fly(g, [(s, (CX0 + 0.12, CY, CZ)), (s + 7, (GX, CY, CZ)), (s + 12, (CX1 - 0.12, CY, CZ)),
            (s + 15, (TX, CY, zi + 0.12)), (s + 18, (TX, CY, zi))])
    anim(g, 'scale', [(1, Z), (s, Z), (s + 3, ONE)])
    anim(tick, 'scale', [(1, Z), (s + 6, Z), (s + 9, ONE)])

a_tests = empty('a_tests', loc=(GX, CY, 0.44))

# ---------------------------------------------------------------- light and camera
bpy.ops.object.light_add(type='AREA', location=(-5.5, -4.5, 9.0))
key_l = bpy.context.object
key_l.data.size = 9
key_l.data.energy = 650
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


# slow drift: close on the team, opening up for the vault and the tests
cam_at(1, -14, 45, 5.9, 0.0, 0.42, 0.25)
cam_at(50, -11, 44, 6.3, 0.1, 0.42, 0.3)
cam_at(90, -7, 44, 7.3, 0.38, 0.15, 0.25)
cam_at(118, -5, 44, 7.6, 0.24, 0.02, 0.18)
cam_at(150, -4, 44, 7.7, 0.2, -0.04, 0.15)

# smooth every fcurve
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
            if fc.data_path == 'hide_render':
                for k in fc.keyframe_points:
                    k.interpolation = 'CONSTANT'
                continue
            for k in fc.keyframe_points:
                k.interpolation = 'BEZIER'
                k.easing = 'AUTO'
                k.handle_left_type = k.handle_right_type = 'AUTO_CLAMPED'


# ---------------------------------------------------------------- labels → film.json
SHOW = {'team': 12, 'machine': 34, 'channels': 44, 'vault': 82, 'tests': 108}
anchors = {'team': a_team, 'machine': a_machine, 'channels': a_channels, 'vault': a_vault, 'tests': a_tests}
labels = {k: [] for k in anchors}
worst = {}
for fr in range(1, N + 1):
    scene.frame_set(fr)
    bpy.context.view_layer.update()
    for k, e in anchors.items():
        co = world_to_camera_view(scene, cam, e.matrix_world.translation)
        if fr >= SHOW[k] and co.z > 0 and 0 <= co.x <= 1 and 0 <= co.y <= 1:
            labels[k].append([round(co.x, 4), round(1 - co.y, 4)])
        else:
            labels[k].append(None)
    # fade-safe check: everything visible should sit in the central 70% x 75%
    if fr % 5 == 0 or fr == 1:
        dg = bpy.context.evaluated_depsgraph_get()
        for o in scene.objects:
            if o.type != 'MESH' or o is floor:
                continue
            mw = o.matrix_world
            if min(mw.to_scale()) < 0.01:
                continue
            if o.type == 'CURVE' and o.data.bevel_factor_end - o.data.bevel_factor_start < 0.01:
                continue
            for c in o.evaluated_get(dg).bound_box:
                co = world_to_camera_view(scene, cam, mw @ Vector(c))
                x, y = co.x, 1 - co.y
                over = max(0.15 - x, x - 0.85, 0.125 - y, y - 0.875)
                if over > 0.005 and over > worst.get(fr, (0, ''))[0]:
                    worst[fr] = (round(over, 3), o.name, round(x, 3), round(y, 3))
for fr, w in sorted(worst.items()):
    print('outside safe area: frame', fr, w)
for k, v in labels.items():
    first = next((i + 1 for i, p in enumerate(v) if p), None)
    print('label', k, 'from frame', first, 'at', v[first - 1] if first else None, 'end', v[-1])

os.makedirs(OUT, exist_ok=True)
if not TEST:
    with open(os.path.join(OUT, 'film.json'), 'w') as fh:
        json.dump({'count': N, 'w': W, 'h': H, 'labels': labels}, fh, separators=(',', ':'))
    print('wrote film.json')

# ---------------------------------------------------------------- render
os.makedirs(RAW, exist_ok=True)
for fr in FRAMES:
    scene.frame_set(fr)
    scene.render.filepath = os.path.join(RAW, f'{fr:04d}.png')
    bpy.ops.render.render(write_still=True)
    print('frame', fr, flush=True)
