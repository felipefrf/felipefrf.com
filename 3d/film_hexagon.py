"""Hexagon / Milo: a scroll-scrubbed clay film of what Felipe built there.

Milo gives every person on a team an AI agent, each one running on its own
private machine in the cloud with that person's tools. Only public facts here.

Beats, over 180 frames (the page scrubs them with the scroll, from frame 14):
  1  a team: four clay figures pop up on a slab, and beside each one a small ink
     sparkle (their agent) appears and hovers: one agent each
  2  behind each person a private machine rises; a thin ink cable draws from the
     person to it, the sparkle glides over to hover on top of it and the
     machine's screen boots, line by line
  3  chat bubbles fly in from every side with soft trails (the channels: Slack,
     WhatsApp, Teams, Google Chat; the names are HTML labels); each agent
     catches its message with a little spin, the screen logs a line, and the
     replies fly back out, one of them orange
  4  the vault: a clay safe beside the last machine; the dial turns, the door
     swings open, a key card slides out and glides around the machine into a
     browser login, the password field fills with dots, the button turns orange,
     and the door closes again: the agent never holds the password
  5  replayed real cases leave an archive box on a conveyor, get stamped with a
     check under a press and hop onto a neat stack; the last one turns orange.
     The camera settles on the whole scene.

Every animated value is computed per frame in Python (easing, overshoot, bob)
and keyed linearly, so what renders is exactly what is written here.

Render: Cycles at 2560x1600, transparent film plus a shadow catcher, flattened
over white (see pack: the page multiplies the frames onto its own colour). Pack writes a 2560 set and a Lanczos-downscaled
1280 set. Label anchors are projected through the camera into film.json for the
HTML overlays (normalised, so the same for both sizes).

Run:  blender -b -P 3d/film_hexagon.py -- [--frames 1-180] [--samples 32] [--test] [--norender]
Then: python3 3d/film_hexagon.py --pack   (outside Blender: PNG -> WebP + poster)
"""
import json
import math
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FILM_OUT', os.path.join(ROOT, 'public', 'film', 'hexagon'))
RAW = os.environ.get('FILM_RAW', os.path.join(ROOT, '.work', 'film-hexagon'))
W, H = 2560, 1600
SIZES = [1280, 2560]
N = 180
Q = {2560: 85, 1280: 70}  # cwebp quality per size (about 7.3 MB and 2.1 MB for 180 frames)


# ---------------------------------------------------------------- pack (no bpy)
# Lossy WebP cannot hold the page colour: no YUV triple decodes to #fcfcfa (the
# nearest come out a level or two off). Pure white does round-trip exactly, so
# the frames are flattened over white and the page draws them with
# mix-blend-mode: multiply over the page colour: wherever the render is empty
# the result is exactly the page, and the shadows land on it as shadows do.
# Before flattening, the shadow catcher's faint far-off haze (alpha < 4) is
# dropped and the alpha fades out over the outer 5%, so no frame ever ends in a
# visible edge, even in close-ups that crop the scene.
EDGE = 0.05


def pack():
    """Flatten each RGBA frame over white (ffmpeg), then WebP (cwebp) at both sizes."""
    from concurrent.futures import ThreadPoolExecutor
    for s in SIZES:
        d = os.path.join(OUT, str(s))
        os.makedirs(d, exist_ok=True)
        for x in os.listdir(d):  # no stale frames from a longer cut
            if x.endswith('.webp') and int(x[:4]) > N:
                os.remove(os.path.join(d, x))
    files = sorted(f for f in os.listdir(RAW) if f.endswith('.png') and '.' not in f[:-4] and int(f[:4]) <= N)
    ex_ = 'clip(min(X\\,W-1-X)/(%g*W)\\,0\\,1)' % EDGE
    ey_ = 'clip(min(Y\\,H-1-Y)/(%g*W)\\,0\\,1)' % EDGE
    alpha = "clip((alpha(X\\,Y)-3)*1.012\\,0\\,255)*(%s*%s*(3-2*%s))*(%s*%s*(3-2*%s))" % (ex_, ex_, ex_, ey_, ey_, ey_)
    flt = ("color=c=white:s=%dx%d,format=rgba[b];[0:v]format=rgba,geq=r='r(X\\,Y)':g='g(X\\,Y)':b='b(X\\,Y)':a='%s'[f];"
           "[b][f]overlay=format=auto:shortest=1,format=rgb24" % (W, H, alpha))

    def one(f):
        src = os.path.join(RAW, f)
        flat = os.path.join(RAW, f[:-4] + '.flat.png')
        half = os.path.join(RAW, f[:-4] + '.half.png')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-filter_complex', flt, '-frames:v', '1', flat], check=True)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', flat, '-vf',
                        'scale=%d:%d:flags=lanczos+accurate_rnd+full_chroma_int,format=rgb24' % (W // 2, H // 2),
                        '-frames:v', '1', half], check=True)
        for s, img in ((2560, flat), (1280, half)):
            subprocess.run(['cwebp', '-quiet', '-q', str(Q[s]), '-m', '6', '-sharp_yuv', '-af', img, '-o',
                            os.path.join(OUT, str(s), f[:-4] + '.webp')], check=True)

    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(one, files))
    last = os.path.join(RAW, files[-1][:-4] + '.flat.png')
    subprocess.run(['cwebp', '-quiet', '-q', '84', '-m', '6', '-sharp_yuv', last, '-o', os.path.join(OUT, 'poster.webp')], check=True)
    for s in SIZES:
        d = os.path.join(OUT, str(s))
        total = sum(os.path.getsize(os.path.join(d, x)) for x in os.listdir(d))
        print('packed', len(os.listdir(d)), 'frames at', s, ':', round(total / 1024), 'KB')


if '--pack' in sys.argv:
    pack()
    sys.exit(0)

# ---------------------------------------------------------------- scene (bpy)
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
opt = {'frames': f'1-{N}', 'samples': '32'}
for i, a in enumerate(argv):
    if a.startswith('--') and i + 1 < len(argv) and not argv[i + 1].startswith('--'):
        opt[a[2:]] = argv[i + 1]
TEST = '--test' in argv
NORENDER = '--norender' in argv
if '-' not in opt['frames']:
    FRAMES = [int(x) for x in opt['frames'].split(',') if x]
else:
    f0, f1 = (int(x) for x in opt['frames'].split('-'))
    FRAMES = list(range(f0, f1 + 1))
RES = float(opt.get('res', '1'))  # --res 0.5 for quick looks

# ---------------------------------------------------------------- reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.frame_start, scene.frame_end = 1, N
scene.render.engine = 'CYCLES'
scene.render.resolution_x, scene.render.resolution_y = int(W * RES), int(H * RES)
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.use_persistent_data = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.view_settings.exposure = 0.0
cy = scene.cycles
cy.samples = int(opt['samples'])
cy.use_adaptive_sampling = True
cy.adaptive_threshold = float(opt.get('threshold', '0.02'))
cy.use_denoising = True
for k, v in (('denoiser', 'OPENIMAGEDENOISE'), ('denoising_input_passes', 'RGB_ALBEDO_NORMAL'),
             ('denoising_prefilter', 'ACCURATE'), ('denoising_quality', 'HIGH'), ('denoising_use_gpu', True)):
    try:
        setattr(cy, k, v)
    except Exception as e:
        print('denoise setting', k, e)
cy.max_bounces = 6
cy.filter_width = 1.2
try:
    if os.environ.get('FILM_CPU'):
        raise RuntimeError('FILM_CPU set')
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:  # the GPU only: CPU + GPU together is slower here
        d.use = d.type == 'METAL'
    if not any(d.use for d in prefs.devices):
        raise RuntimeError('no Metal device')
    cy.device = 'GPU'
    print('render devices:', [(d.name, d.type) for d in prefs.devices if d.use], flush=True)
except Exception as e:  # CPU is fine, just slower
    print('GPU unavailable:', e)

world = bpy.data.worlds.new('w')
scene.world = world
world.use_nodes = True
bgn = world.node_tree.nodes['Background']
bgn.inputs[0].default_value = (1, 1, 1, 1)
bgn.inputs[1].default_value = 0.42

FR = range(1, N + 1)


# ---------------------------------------------------------------- easing
def clamp01(t):
    return 0.0 if t < 0 else 1.0 if t > 1 else t


def seg(fr, a, b):
    return clamp01((fr - a) / float(b - a))


def smooth(t):
    t = clamp01(t)
    return t * t * t * (t * (6 * t - 15) + 10)


def cubic(t):
    t = clamp01(t)
    return 4 * t * t * t if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def out3(t):
    return 1 - (1 - clamp01(t)) ** 3


def in3(t):
    return clamp01(t) ** 3


def back(t, s=1.9):
    """ease out with a soft overshoot"""
    t = clamp01(t) - 1
    return t * t * ((s + 1) * t + s) + 1


def lerp(a, b, t):
    return a + (b - a) * t


def vlerp(a, b, t):
    return Vector(a).lerp(Vector(b), t)


def qbez(p0, c, p1, t):
    p0, c, p1 = Vector(p0), Vector(c), Vector(p1)
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * c + t * t * p1


# ---------------------------------------------------------------- keying
def key(idb, path, fn, frames=FR, const=False):
    """key fn(frame) on every frame where it changes (and the ends of every run)"""
    vals = []
    for fr in frames:
        v = fn(fr)
        vals.append(tuple(v) if hasattr(v, '__len__') else v)
    frames = list(frames)
    for i, (fr, v) in enumerate(zip(frames, vals)):
        prev = vals[i - 1] if i else None
        nxt = vals[i + 1] if i + 1 < len(vals) else None
        if i in (0, len(vals) - 1) or v != prev or v != nxt:
            setattr(idb, path, v)
            idb.keyframe_insert(data_path=path, frame=fr)


def shown(o, a, b=10 ** 6):
    """render o (and its children) only on frames a..b"""
    for x in [o] + list(o.children_recursive):
        if x.type in ('MESH', 'CURVE') and not x.name.startswith('cutter'):
            key(x, 'hide_render', lambda fr: not (a <= fr <= b), const=True)


def pop_scale(o, a, b, out=None, full=1.0, ov=1.9):
    """scale 0 -> full over a..b with a soft overshoot; back to 0 over out=(c, d)"""
    def f(fr):
        s = back(seg(fr, a, b), ov) * full
        if out:
            s *= 1 - in3(seg(fr, out[0], out[1]))
        s = max(s, 0.0005)
        return (s, s, s)
    key(o, 'scale', f)
    shown(o, a + 1, out[1] - 1 if out else 10 ** 6)


def rise(o, a, b, ov=1.6):
    """grow up from the floor: scale z 0 -> 1 over a..b, a little overshoot"""
    key(o, 'scale', lambda fr: (1, 1, max(0.0005, back(seg(fr, a, b), ov))))
    shown(o, a + 1)


# ---------------------------------------------------------------- materials
def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c) + (1,)


def mat(name, hexc, rough=0.62, emit=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = srgb(hexc)
    b.inputs['Roughness'].default_value = rough
    if coat:
        b.inputs['Coat Weight'].default_value = coat
        b.inputs['Coat Roughness'].default_value = 0.18
    if emit:
        b.inputs['Emission Color'].default_value = srgb(hexc)
        b.inputs['Emission Strength'].default_value = emit
    return m


def glow(name, hexc, strength=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL':
            nt.nodes.remove(n)
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = srgb(hexc)
    e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


CLAY = mat('clay', '#f2f2ef')
CLAY2 = mat('clay2', '#e4e4df')
INK = mat('ink', '#0e0f11', 0.45)
SCREEN = mat('screen', '#15171a', 0.22, coat=0.6)
LIT = glow('lit', '#ecece6', 1.0)
TRAIL = mat('trail', '#d6d6d1', 0.7)
ORANGE = mat('orange', '#ff4f00', 0.45, emit=0.25)


def turns_orange(name, a, b):
    """a clay material that turns orange over frames a..b"""
    m = mat(name, '#f2f2ef', 0.5)
    bs = m.node_tree.nodes['Principled BSDF']
    c0, c1 = srgb('#f2f2ef'), srgb('#ff4f00')
    bs.inputs['Emission Color'].default_value = c1
    key(bs.inputs['Base Color'], 'default_value', lambda fr: tuple(lerp(x, y, smooth(seg(fr, a, b))) for x, y in zip(c0, c1)))
    key(bs.inputs['Emission Strength'], 'default_value', lambda fr: 0.25 * smooth(seg(fr, a, b)))
    return m


def assign(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)


# ---------------------------------------------------------------- geometry
def link(o, parent):
    o.parent = parent
    return o


def group(name, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    g = bpy.data.objects.new(name, None)
    g.location = loc
    g.rotation_euler = rot
    g.parent = parent
    scene.collection.objects.link(g)
    return g


def shade(o, angle=40):
    o.data.shade_smooth()
    try:
        o.data.set_sharp_from_angle(angle=math.radians(angle))
    except Exception as e:
        print('sharp from angle:', e)


def bevel(o, w, segs=4, angle=True):
    md = o.modifiers.new('bevel', 'BEVEL')
    md.width = w
    md.segments = segs
    if angle:
        md.limit_method = 'ANGLE'
        md.angle_limit = math.radians(40)
    md.harden_normals = False
    return md


def box(parent, loc, size, m=CLAY, bev=0.012, segs=4, origin_left=False):
    """a bevelled box; size is the full (w, d, h); origin_left puts the origin on its -x face"""
    me = bpy.data.meshes.new('box')
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if origin_left:
        bmesh.ops.translate(bm, vec=(size[0] / 2, 0, 0), verts=bm.verts)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new('box', me)
    scene.collection.objects.link(o)
    o.location = loc
    if bev:
        bevel(o, min(bev, min(size) * 0.49), segs)
    shade(o)
    link(o, parent)
    assign(o, m)
    return o


def cyl(parent, loc, r, h, m=CLAY, r2=None, verts=64, bev=0.0, rot=(0, 0, 0)):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=verts, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, vertices=verts, rotation=rot)
    o = bpy.context.object
    if bev:
        bevel(o, bev, 4)
    shade(o)
    link(o, parent)
    assign(o, m)
    return o


def ball(parent, loc, r, m=CLAY, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=64, ring_count=32)
    o = bpy.context.object
    o.scale = scale
    for p in o.data.polygons:
        p.use_smooth = True
    link(o, parent)
    assign(o, m)
    return o


def prism(parent, pts, depth, m=CLAY, loc=(0, 0, 0), bev=0.006, fan=False):
    """extrude a closed outline in the x-z plane along y (centred); fan=True for star shapes"""
    me = bpy.data.meshes.new('prism')
    bm = bmesh.new()
    rings = []
    for y in (-depth / 2, depth / 2):
        rings.append([bm.verts.new((x, y, z)) for x, z in pts])
    n = len(pts)
    for side, ring in enumerate(rings):
        if fan:
            c = bm.verts.new((sum(p[0] for p in pts) / n, ring[0].co.y, sum(p[1] for p in pts) / n))
            for i in range(n):
                tri = (c, ring[i], ring[(i + 1) % n]) if side else (c, ring[(i + 1) % n], ring[i])
                bm.faces.new(tri)
        else:
            bm.faces.new(ring if side else list(reversed(ring)))
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((rings[0][i], rings[0][j], rings[1][j], rings[1][i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new('prism', me)
    scene.collection.objects.link(o)
    o.location = loc
    if bev:
        bevel(o, bev, 3)
    shade(o, 50)
    link(o, parent)
    assign(o, m)
    return o


def line(name, pts, m=INK, radius=0.0045, parent=None):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = 4
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


def resample(pts, n=64):
    """even spacing by length, so a bevel factor is a fraction of the length"""
    pts = [Vector(p) for p in pts]
    d = [0.0]
    for a, b in zip(pts, pts[1:]):
        d.append(d[-1] + (b - a).length)
    out, j = [], 0
    for i in range(n + 1):
        s = d[-1] * i / n
        while j < len(d) - 2 and d[j + 1] < s:
            j += 1
        t = (s - d[j]) / max(1e-9, d[j + 1] - d[j])
        out.append(pts[j].lerp(pts[j + 1], t))
    return out


def along(pts, u):
    u = clamp01(u) * (len(pts) - 1)
    i = min(int(u), len(pts) - 2)
    return pts[i].lerp(pts[i + 1], u - i)


def check_mark(parent, loc, s=1.0, m=INK, rot=(0, 0, 0)):
    """a tick lying in the local x-y plane (face up)"""
    g = group('tick', loc, rot, parent)
    a = box(g, (-0.012 * s, -0.002 * s, 0), (0.026 * s, 0.009 * s, 0.004), m=m, bev=0.0015, segs=2)
    a.rotation_euler = (0, 0, math.radians(-45))
    b = box(g, (0.011 * s, 0.009 * s, 0), (0.05 * s, 0.009 * s, 0.004), m=m, bev=0.0015, segs=2)
    b.rotation_euler = (0, 0, math.radians(52))
    return g


# ---------------------------------------------------------------- floor (shadow catcher)
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
floor = bpy.context.object
floor.is_shadow_catcher = True
assign(floor, CLAY)

# ---------------------------------------------------------------- the slab
TOP = 0.06
slab = box(None, (0, 0.36, TOP / 2), (2.62, 1.42, TOP), bev=0.018)

XS = [-0.87, -0.29, 0.29, 0.87]   # one person, one machine
FY = 0.0                           # the people
MY = 0.72                          # their machines
MW, MD, MH = 0.36, 0.30, 0.46      # machine size
MTOP = TOP + MH
HOVER = MTOP + 0.15                # where the agent sparkle hovers over its machine

# ---------------------------------------------------------------- 1 the team
HEIGHTS = [1.0, 0.92, 1.06, 0.96]
P_RISE = [1 + 3 * k for k in range(4)]          # each rises over 9 frames
S_POP = [24 + 3 * k for k in range(4)]          # their sparkle pops over 7
S_MOVE = [55 + 3 * k for k in range(4)]         # the sparkle glides to the machine over 10
M_RISE = [46 + 3 * k for k in range(4)]         # the machine rises over 10
heads = []
for k, (x, hs) in enumerate(zip(XS, HEIGHTS)):
    g = group(f'person{k}', (x, FY, TOP))
    cyl(g, (0, 0, 0.012), 0.105, 0.024, bev=0.008)
    cyl(g, (0, 0, 0.024 + 0.13 * hs), 0.115, 0.26 * hs, r2=0.064, bev=0.012)
    cyl(g, (0, 0, 0.024 + 0.26 * hs + 0.012), 0.03, 0.03, bev=0.004)
    ball(g, (0, 0, 0.024 + 0.26 * hs + 0.085), 0.074)
    head = Vector((x, FY, TOP + 0.024 + 0.26 * hs + 0.085))
    heads.append(head)
    rise(g, P_RISE[k], P_RISE[k] + 9)
    # a small hop of joy when their agent appears
    s = S_POP[k]
    key(g, 'location', lambda fr, x=x, s=s: (x, FY, TOP + 0.035 * math.sin(math.pi * seg(fr, s, s + 6))))

a_team = group('a_team', (XS[0], FY - 0.14, TOP))  # at the first person's feet; the label hangs below it (day.css)


# the agent: a four-point sparkle, the shape everyone now reads as "AI"
def sparkle_pts(r, e=2.7, n=96):
    out = []
    for i in range(n):
        t = 2 * math.pi * i / n
        c, s = math.cos(t), math.sin(t)
        out.append((r * math.copysign(abs(c) ** e, c), r * math.copysign(abs(s) ** e, s)))
    return out


SPK = sparkle_pts(0.078)
sparks = []
for k, x in enumerate(XS):
    g = group(f'spark{k}')
    prism(g, SPK, 0.03, m=INK, bev=0.007, fan=True)
    sparks.append(g)


def spark_base(k, fr):
    """where agent k is at frame fr, before its bob"""
    near = heads[k] + Vector((0.15, -0.02, 0.07))        # at its person's shoulder
    over = Vector((XS[k], MY, HOVER))                    # on top of its machine
    t = cubic(seg(fr, S_MOVE[k], S_MOVE[k] + 10))
    c = near.lerp(over, 0.5) + Vector((0, 0, 0.26))
    return qbez(near, c, over, t)


# ---------------------------------------------------------------- 2 one private machine each
SCR_W, SCR_H, SCR_Z = 0.28, 0.19, 0.315
ROWS = [SCR_Z + 0.062 - j * 0.0245 for j in range(6)]
BOOT = [[0.17, 0.21, 0.12, 0.19], [0.2, 0.13, 0.18, 0.1], [0.15, 0.2, 0.09, 0.17], [0.19, 0.11, 0.21, 0.14]]
LOGL = [0.15, 0.1]
machines = []
screen_rows = []
ROW_ON = []   # the frame each screen line appears
cursors = []
for k, x in enumerate(XS):
    g = group(f'machine{k}', (x, MY, TOP))
    box(g, (0, 0, MH / 2), (MW, MD, MH), bev=0.024)
    fy = -MD / 2
    box(g, (0, fy - 0.002, SCR_Z), (SCR_W + 0.02, 0.008, SCR_H + 0.02), m=CLAY2, bev=0.006)  # bezel
    box(g, (0, fy - 0.005, SCR_Z), (SCR_W, 0.006, SCR_H), m=SCREEN, bev=0.004)
    for j in range(3):  # vents
        box(g, (-0.04, fy - 0.001, 0.15 - j * 0.03), (0.2, 0.006, 0.008), m=INK, bev=0.002, segs=2)
    led = ball(g, (0.125, fy - 0.002, 0.15), 0.011, m=LIT)
    box(g, (0, fy - 0.001, 0.05), (0.26, 0.004, 0.034), m=CLAY2, bev=0.003)  # a drive bay
    rise(g, M_RISE[k], M_RISE[k] + 10)
    machines.append(g)
    # the screen boots once its agent arrives: lines grow in from the left
    rows = []
    xl = -SCR_W / 2 + 0.022
    b0 = S_MOVE[k] + 9
    for j in range(6):
        ln = box(g, (xl, fy - 0.0085, ROWS[j]), ((BOOT[k] + LOGL)[j], 0.002, 0.0105), m=LIT, bev=0, origin_left=True)
        rows.append(ln)
        if j < 4:
            a = b0 + 2 * j
            key(ln, 'scale', lambda fr, a=a: (max(0.0005, out3(seg(fr, a, a + 3))), 1, 1))
            shown(ln, a + 1)
    screen_rows.append(rows)
    ROW_ON.append([b0 + 2 * j + 1 for j in range(4)] + [10 ** 6, 10 ** 6])
    cursors.append(box(g, (xl, fy - 0.0085, ROWS[0]), (0.011, 0.002, 0.015), m=LIT, bev=0))
    # the cable on the slab, from the person's side to their machine, curving out
    zc = TOP + 0.005
    p0 = Vector((x + 0.1, FY + 0.03, zc))
    p2 = Vector((x + 0.02, MY - MD / 2 - 0.004, zc))
    c1 = Vector((x + 0.2, (FY + MY) / 2 - 0.05, zc))
    pts = [qbez(p0, c1, p2, t) for t in (i / 40 for i in range(41))]
    _, cu = line(f'link{k}', pts)
    s = M_RISE[k] + 6
    key(cu, 'bevel_factor_end', lambda fr, s=s: smooth(seg(fr, s, s + 9)))
    lo = cyl(None, (p0.x, p0.y, TOP + 0.004), 0.015, 0.008, m=INK, bev=0.002)
    pop_scale(lo, s - 1, s + 2)
    hi = cyl(None, (p2.x, p2.y, TOP + 0.004), 0.017, 0.008, m=INK, bev=0.002)
    pop_scale(hi, s + 8, s + 11)

# ---------------------------------------------------------------- 3 the channels
# (source, machine, start, land); messages come in from every side, with trails
SRC = {
    'left': Vector((-2.7, 0.45, 1.05)),
    'right': Vector((2.9, 0.45, 1.1)),
    'backL': Vector((-1.0, 3.0, 1.75)),
    'backR': Vector((1.1, 3.0, 1.75)),
}
ROUTE = [('left', 0), ('backL', 1), ('right', 3), ('backR', 2), ('left', 1), ('right', 2)]
MSG = []
for i, (src, mi) in enumerate(ROUTE):
    f0 = 80 + 3 * i + (2 if i >= 4 else 0)
    MSG.append((src, mi, f0, f0 + 10))
REPLY = [(0, 'left'), (1, 'backL'), (3, 'right'), (2, 'backR')]
REPLY_ORANGE = 1
TILT = math.radians(-32)  # bubbles lean back to face a camera above the table


def rrect(w, h, r, n=10):
    pts = []
    for cx, cz, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    return pts


def bubble(name, m=CLAY):
    g = group(name)
    prism(g, rrect(0.21, 0.13, 0.045), 0.032, m=m, bev=0.009)
    prism(g, [(-0.07, -0.03), (-0.025, -0.03), (-0.085, -0.095)], 0.03, m=m, bev=0.008)
    box(g, (-0.012, -0.0175, 0.022), (0.13, 0.004, 0.017), m=INK, bev=0.004, segs=2)
    box(g, (-0.035, -0.0175, -0.014), (0.085, 0.004, 0.017), m=INK, bev=0.004, segs=2)
    return g


TAPER = bpy.data.curves.new('taper', 'CURVE')
TAPER.dimensions = '2D'
_sp = TAPER.splines.new('BEZIER')
_sp.bezier_points.add(1)
for _p, _co in zip(_sp.bezier_points, ((0, 0, 0), (1, 1, 0))):
    _p.co = _co
    _p.handle_left_type = _p.handle_right_type = 'VECTOR'
TAPER_OB = bpy.data.objects.new('taper', TAPER)
scene.collection.objects.link(TAPER_OB)


def flight(name, pts, f0, f1, ease, m_tile=CLAY, absorb=False, emerge=False, trail_len=0.16):
    """a bubble along pts from f0 to f1, with a soft trail that follows and fades"""
    pts = resample(pts, 72)
    g = bubble(name, m_tile)
    u = lambda fr: ease(seg(fr, f0, f1))  # noqa: E731
    key(g, 'location', lambda fr: along(pts, u(fr)))
    key(g, 'rotation_euler', lambda fr: (TILT, 0, math.radians(8) * math.sin(math.pi * seg(fr, f0, f1))))

    def sc(fr):
        s = 1.0
        if emerge:
            s *= back(seg(fr, f0, f0 + 4))
        else:
            s *= out3(seg(fr, f0, f0 + 3))
        if absorb:
            s *= 1 - 0.95 * in3(seg(fr, f1 - 4, f1))
        else:
            s *= 1 - in3(seg(fr, f1 - 3, f1))
        s = max(s, 0.0005)
        return (s, s, s)
    key(g, 'scale', sc)
    shown(g, f0 + 1, f1)
    o, cu = line(name + '_trail', pts, m=TRAIL, radius=0.011)
    cu.taper_object = TAPER_OB
    cu.use_map_taper = True
    key(cu, 'bevel_factor_end', lambda fr: max(0.0, u(fr) - 0.02))
    key(cu, 'bevel_factor_start', lambda fr: max(0.0, u(fr) - trail_len) if fr <= f1 else
        min(1.0, u(fr) - trail_len + (trail_len - 0.02) * out3(seg(fr, f1, f1 + 4))))
    shown(o, f0 + 2, f1 + 3)
    return g


for i, (src, mi, f0, f1) in enumerate(MSG):
    start = SRC[src].copy()
    land = Vector((XS[mi], MY, HOVER + 0.1))
    c = start.lerp(land, 0.5) + Vector((0, 0, 0.42))
    pts = [qbez(start, c, land, t) for t in (j / 60 for j in range(61))]
    flight(f'msg{i}', pts, f0, f1, out3, absorb=True)
    # the screen logs a line
    r = sum(1 for (_, m2, g0, _) in MSG[:i] if m2 == mi)
    ln = screen_rows[mi][4 + r]
    key(ln, 'scale', lambda fr, a=f1: (max(0.0005, out3(seg(fr, a, a + 3))), 1, 1))
    shown(ln, f1 + 1)
    ROW_ON[mi][4 + r] = f1 + 1

# a cursor blinks after the last line on every screen
for k, cur in enumerate(cursors):
    lens = BOOT[k] + LOGL

    def cpos(fr, k=k, lens=lens):
        on = [j for j in range(6) if ROW_ON[k][j] <= fr]
        j = on[-1] if on else 0
        x = -SCR_W / 2 + 0.022 + (lens[j] * out3(seg(fr, ROW_ON[k][j] - 1, ROW_ON[k][j] + 2)) if on else 0) + 0.014
        return (x, -MD / 2 - 0.0085, ROWS[j])
    key(cur, 'location', cpos)
    key(cur, 'hide_render', lambda fr, k=k: not (fr >= ROW_ON[k][0] and (fr // 4) % 2 == 0))

for j, (mi, src) in enumerate(REPLY):
    f0 = 95 + 3 * j
    f1 = f0 + 12
    land = Vector((XS[mi], MY, HOVER + 0.13))
    out = SRC[src].copy() + Vector((0, -0.2, 0.25))
    c = land + Vector((0, -0.1, 0.55))
    pts = [qbez(land, c, out, t) for t in (q / 60 for q in range(61))]
    m = turns_orange('reply_orange', f0, f0 + 2) if j == REPLY_ORANGE else CLAY
    flight(f'reply{j}', pts, f0, f1, in3, m_tile=m, emerge=True)

# the agents: hover, bob, and spin a little when a message lands
for k, g in enumerate(sparks):
    hits = [f1 for (_, mi, _, f1) in MSG if mi == k] + [95 + 3 * j for j, (mi, _) in enumerate(REPLY) if mi == k]

    def loc(fr, k=k):
        b = spark_base(k, fr)
        return b + Vector((0, 0, 0.014 * math.sin(fr * 0.21 + k * 1.7)))

    def rot(fr, k=k, hits=hits):
        a = math.radians(18) * math.sin(fr * 0.09 + k)
        for h in hits:
            a += math.radians(25) * math.sin(math.pi * seg(fr, h - 1, h + 6))
        a += math.radians(180) * cubic(seg(fr, S_MOVE[k], S_MOVE[k] + 10))
        return (TILT * 0.5, 0, a)

    def sc(fr, k=k, hits=hits):
        s = back(seg(fr, S_POP[k], S_POP[k] + 7), 2.2)
        for h in hits:
            s *= 1 + 0.32 * math.sin(math.pi * seg(fr, h - 1, h + 4))
        s = max(s, 0.0005)
        return (s, s, s)
    key(g, 'location', loc)
    key(g, 'rotation_euler', rot)
    key(g, 'scale', sc)
    shown(g, S_POP[k] + 1)

a_machine = group('a_machine', (XS[2], MY, HOVER + 0.13))
a_channels = group('a_channels', (-0.98, MY + 0.12, 0.9))

# ---------------------------------------------------------------- 4 the vault
SX, SY = 1.64, 0.64
SW_, SD_, SH_ = 0.42, 0.38, 0.42
WT = 0.04
safe = group('safe', (SX, SY, 0))
body = box(safe, (0, 0, SH_ / 2), (SW_, SD_, SH_), bev=0)
cutter = box(safe, (0, -WT / 2 - 0.05, SH_ / 2), (SW_ - 2 * WT, SD_ - WT + 0.1, SH_ - 2 * WT), bev=0)
cutter.name = 'cutter'
cutter.hide_render = True
cutter.hide_viewport = True
bo = body.modifiers.new('cut', 'BOOLEAN')
bo.operation = 'DIFFERENCE'
bo.object = cutter
bevel(body, 0.022, 4)
box(safe, (0, -0.02, WT + 0.004), (SW_ - 2 * WT - 0.02, SD_ - WT - 0.06, 0.008), m=CLAY2, bev=0.003)  # a mat inside
box(safe, (0, 0, SH_ + 0.0005), (0.15, 0.03, 0.004), m=INK, bev=0.0015, segs=2)  # the slot on top
SAFE_RISE = 104
rise(safe, SAFE_RISE, SAFE_RISE + 10)

FRONT_Y = SY - SD_ / 2
hinge = group('hinge', (SX - SW_ / 2 + 0.008, FRONT_Y - 0.016, 0))
DW, DH = SW_ - 0.016, SH_ - 0.016
door = group('door', (DW / 2, 0, SH_ / 2), parent=hinge)
box(door, (0, 0, 0), (DW, 0.03, DH), m=CLAY, bev=0.014)
box(door, (0, -0.016, 0), (DW - 0.07, 0.004, DH - 0.07), m=CLAY2, bev=0.004)
dial = group('dial', (0.0, -0.02, 0.03), parent=door)
cyl(dial, (0, -0.006, 0), 0.058, 0.014, rot=(math.radians(90), 0, 0), bev=0.004)
bpy.ops.mesh.primitive_torus_add(major_radius=0.058, minor_radius=0.004, location=(0, -0.013, 0),
                                 rotation=(math.radians(90), 0, 0), major_segments=64, minor_segments=12)
t = bpy.context.object
for p in t.data.polygons:
    p.use_smooth = True
link(t, dial)
assign(t, INK)
ball(dial, (0, -0.014, 0), 0.011, m=INK)
box(dial, (0, -0.0145, 0.04), (0.007, 0.004, 0.022), m=INK, bev=0.002, segs=2)  # the tick on the dial
box(door, (0.0, -0.021, -0.11), (0.1, 0.012, 0.018), m=INK, bev=0.004)            # the handle
for hz in (-0.12, 0.12):                                                         # the hinges
    cyl(door, (-DW / 2 + 0.004, -0.004, hz), 0.012, 0.06, m=INK, bev=0.003)
DIAL0, DOOR0, CARD0, CARD1, DOTS0, DOOR_SHUT = 117, 121, 126, 131, 139, 141
key(dial, 'rotation_euler', lambda fr: (0, math.radians(300) * cubic(seg(fr, DIAL0, DIAL0 + 4)) -
                                        math.radians(120) * cubic(seg(fr, DIAL0 + 4, DIAL0 + 6)), 0))
key(hinge, 'rotation_euler', lambda fr: (0, 0, -math.radians(112) * back(seg(fr, DOOR0, DOOR0 + 7), 1.2)
                                         * (1 - cubic(seg(fr, DOOR_SHUT, DOOR_SHUT + 6)))))
key(hinge, 'scale', lambda fr: (1, 1, max(0.0005, back(seg(fr, SAFE_RISE, SAFE_RISE + 10), 1.6))))
shown(hinge, SAFE_RISE + 1)

# the browser panel with its login form
PX, PY = 2.0, -0.26
PROT = math.radians(-14)
panel = group('panel', (PX, PY, 0), (0, 0, PROT))
cyl(panel, (0, 0, 0.011), 0.13, 0.022, bev=0.006)
cyl(panel, (0, 0, 0.08), 0.017, 0.12, bev=0.003)
PW, PH, PZ = 0.6, 0.42, 0.35
box(panel, (0, 0, PZ), (PW, 0.042, PH), bev=0.018)
PF = -0.021
line('chrome', [(-PW / 2 + 0.03, PF - 0.003, PZ + PH / 2 - 0.072), (PW / 2 - 0.03, PF - 0.003, PZ + PH / 2 - 0.072)],
     radius=0.0025, parent=panel)
for j in range(3):
    ball(panel, (-PW / 2 + 0.046 + j * 0.03, PF, PZ + PH / 2 - 0.038), 0.0085, m=INK)
box(panel, (0.05, PF - 0.002, PZ + PH / 2 - 0.038), (0.3, 0.004, 0.024), m=CLAY2, bev=0.006)  # the address bar


def field(z, w=0.42, h=0.066):
    box(panel, (0, PF - 0.001, z), (w, 0.006, h), m=CLAY2, bev=0.004)
    x0, x1, y = -w / 2, w / 2, PF - 0.0045
    line('fld', [(x0, y, z - h / 2), (x1, y, z - h / 2), (x1, y, z + h / 2), (x0, y, z + h / 2), (x0, y, z - h / 2)],
         radius=0.0019, parent=panel)


field(PZ + 0.07)   # the user name, filled in by name
box(panel, (-0.1, PF - 0.005, PZ + 0.07), (0.18, 0.004, 0.013), m=INK, bev=0.002, segs=2)
FZ = PZ - 0.03     # the password
field(FZ)
BTN = turns_orange('button_orange', DOTS0 + 8, DOTS0 + 11)
btn = box(panel, (0, PF - 0.002, PZ - 0.13), (0.16, 0.012, 0.048), m=BTN, bev=0.012)
key(btn, 'scale', lambda fr: tuple([1 + 0.14 * math.sin(math.pi * seg(fr, DOTS0 + 8, DOTS0 + 13))] * 3))
PANEL_RISE = 108
rise(panel, PANEL_RISE, PANEL_RISE + 10)

for j in range(8):
    d = ball(panel, (-0.17 + j * 0.031, PF - 0.007, FZ), 0.0098, m=INK)
    pop_scale(d, DOTS0 + j * 0.8, DOTS0 + j * 0.8 + 3)

# the key card: slides out of the safe, glides around (never through a machine) into the field
card = group('card')
prism(card, rrect(0.17, 0.11, 0.016), 0.014, m=CLAY, bev=0.004)
box(card, (0, -0.0075, 0.028), (0.17 - 0.004, 0.003, 0.024), m=INK, bev=0.001, segs=2)   # the stripe
box(card, (-0.05, -0.0075, -0.022), (0.036, 0.003, 0.028), m=CLAY2, bev=0.004)          # the chip
box(card, (0.03, -0.0075, -0.03), (0.07, 0.003, 0.009), m=INK, bev=0.002, segs=2)
C_IN = Vector((SX, SY - 0.03, WT + 0.065))
C_OUT = Vector((SX, FRONT_Y - 0.1, 0.2))
pin = Matrix.Translation((PX, PY, 0)) @ Matrix.Rotation(PROT, 4, 'Z')
C_END = pin @ Vector((0, PF - 0.03, FZ))
C_MID = Vector((PX - 0.65, PY - 0.5, 0.56))  # swings out in front of the panel, never through it
card_path = resample([qbez(C_OUT, C_MID, C_END, t) for t in (j / 60 for j in range(61))], 60)


def card_loc(fr):
    if fr <= CARD1:
        return vlerp(C_IN, C_OUT, cubic(seg(fr, CARD0, CARD1)))
    return along(card_path, cubic(seg(fr, CARD1, DOTS0)))


key(card, 'location', card_loc)
key(card, 'rotation_euler', lambda fr: (math.radians(-14) * math.sin(math.pi * seg(fr, CARD1, DOTS0)), 0,
                                        PROT * cubic(seg(fr, CARD1, DOTS0))))
key(card, 'scale', lambda fr: tuple([max(0.0005, 1 - 0.45 * cubic(seg(fr, DOTS0 - 3, DOTS0)) - 0.55 * in3(seg(fr, DOTS0, DOTS0 + 2)))] * 3))
shown(card, SAFE_RISE + 8, DOTS0 + 1)

a_vault = group('a_vault', (SX, SY, SH_ + 0.1))

# ---------------------------------------------------------------- 5 the tests
CY = -0.95
BX0, BX1 = -0.98, 0.62
BH = 0.06
belt = group('belt', ((BX0 + BX1) / 2, CY, 0))
BL = BX1 - BX0
box(belt, (0, 0, BH / 2), (BL, 0.3, BH), bev=0.014)
box(belt, (0, 0, BH + 0.0005), (BL - 0.1, 0.22, 0.003), m=CLAY2, bev=0.001, segs=2)
for side in (-1, 1):
    line('rail', [(-BL / 2 + 0.03, side * 0.13, BH + 0.002), (BL / 2 - 0.03, side * 0.13, BH + 0.002)],
         radius=0.0022, parent=belt)
for end in (-1, 1):
    cyl(belt, (end * (BL / 2 - 0.004), 0, BH / 2), 0.026, 0.24, m=CLAY2, rot=(math.radians(90), 0, 0), bev=0.004)
BELT_RISE = 136
rise(belt, BELT_RISE, BELT_RISE + 8)

# the archive the real cases come from
arch = group('archive', (BX0 - 0.13, CY, 0))
box(arch, (0, 0, 0.13), (0.28, 0.36, 0.26), bev=0.02)
box(arch, (0.141, 0, BH + 0.03), (0.006, 0.24, 0.036), m=INK, bev=0.002, segs=2)   # the slot
for j in range(3):
    box(arch, (0.0, -0.181, 0.2 - j * 0.03), (0.16, 0.004, 0.008), m=INK, bev=0.002, segs=2)
rise(arch, BELT_RISE - 2, BELT_RISE + 6)

GX = -0.18
gate = group('gate', (GX, CY, 0))
box(gate, (0, 0.21, 0.21), (0.08, 0.07, 0.42), bev=0.016)       # a post behind the belt
box(gate, (0, 0.11, 0.395), (0.09, 0.3, 0.07), bev=0.018)       # an arm over it
press = group('press', (0, 0, 0), parent=gate)
cyl(press, (0, 0, 0.32), 0.012, 0.08, m=INK, bev=0.002)
cyl(press, (0, 0, 0.255), 0.056, 0.05, bev=0.008)
cyl(press, (0, 0, 0.2285), 0.044, 0.004, m=INK)
rise(gate, BELT_RISE + 2, BELT_RISE + 10)

TX = 0.98
tray = group('tray', (TX, CY, 0))
box(tray, (0, 0, 0.016), (0.3, 0.24, 0.032), bev=0.01)
rise(tray, BELT_RISE + 4, BELT_RISE + 10)

NCARD = 5
CARD_S = [144 + 4 * i for i in range(NCARD)]
CZ = BH + 0.011
XA, XB = BX0 - 0.06, BX1 - 0.12
PRESS_DN = 0.255 - 0.025 - (CZ + 0.011) - 0.004


def case_x(fr, s):
    if fr <= s + 5:
        return lerp(XA, GX, out3(seg(fr, s, s + 5)))
    return lerp(GX, XB, cubic(seg(fr, s + 6, s + 10)))


for i, s in enumerate(CARD_S):
    last = i == NCARD - 1
    m = turns_orange('case_orange', s + 5, s + 8) if last else CLAY
    g = group(f'case{i}')
    box(g, (0, 0, 0), (0.2, 0.14, 0.022), m=m, bev=0.009)
    box(g, (-0.025, 0.025, 0.0125), (0.12, 0.016, 0.004), m=INK, bev=0.002, segs=2)
    box(g, (-0.045, -0.012, 0.0125), (0.08, 0.016, 0.004), m=INK, bev=0.002, segs=2)
    tk = check_mark(g, (0.058, -0.022, 0.0125), 1.15)
    key(tk, 'scale', lambda fr, s=s: tuple([max(0.0005, back(seg(fr, s + 5, s + 8), 2.4))] * 3))
    shown(tk, s + 6)
    zi = 0.032 + 0.011 + i * 0.0235
    end = Vector((XB, CY, CZ))
    top = Vector((TX, CY, zi))
    mid = (end + top) / 2 + Vector((0, 0, 0.2))

    def cl(fr, s=s, end=end, top=top, mid=mid):
        if fr <= s + 10:
            return (case_x(fr, s), CY, CZ)
        return tuple(qbez(end, mid, top, cubic(seg(fr, s + 10, s + 14))))
    key(g, 'location', cl)
    key(g, 'rotation_euler', lambda fr, s=s, i=i: (0, 0, math.radians((-6 + 3 * i) % 7 - 3) * cubic(seg(fr, s + 10, s + 14))))
    shown(g, s)

# the press comes down on every case as it stops under it
key(press, 'location', lambda fr: (0, 0, -PRESS_DN * max(
    [math.sin(math.pi * seg(fr, s + 4, s + 7)) ** 0.7 for s in CARD_S] + [0])))
a_tests = group('a_tests', (TX, CY, 0.24))  # over the stack of checked cases

# ---------------------------------------------------------------- light
LTGT = group('ltgt', (0.2, 0.1, 0.1))
bpy.ops.object.light_add(type='AREA', location=(-5.5, -4.5, 9.0))
key_l = bpy.context.object
key_l.data.size = 7
key_l.data.energy = 620
key_l.constraints.new('TRACK_TO').target = LTGT
key(key_l, 'location', lambda fr: (lerp(-6.2, -4.2, smooth(fr / N)), lerp(-3.8, -5.6, smooth(fr / N)), 9.0))
bpy.ops.object.light_add(type='AREA', location=(6, 5, 5))
fill = bpy.context.object
fill.data.size = 10
fill.data.energy = 110
fill.constraints.new('TRACK_TO').target = LTGT
bpy.ops.object.light_add(type='AREA', location=(2.0, 6.5, 4.2))
rim = bpy.context.object
rim.data.size = 4
rim.data.energy = 180
rim.constraints.new('TRACK_TO').target = LTGT

# ---------------------------------------------------------------- camera
cam_d = bpy.data.cameras.new('cam')
cam_d.lens = 50
cam_d.sensor_width = 36
cam = bpy.data.objects.new('cam', cam_d)
scene.collection.objects.link(cam)
scene.camera = cam
look = group('look')
tc = cam.constraints.new('TRACK_TO')
tc.target = look
tc.track_axis = 'TRACK_NEGATIVE_Z'
tc.up_axis = 'UP_Y'
cam_d.dof.use_dof = True
cam_d.dof.focus_object = look
cam_d.dof.aperture_blades = 0

# (frame, azimuth, elevation, distance, look x, y, z, f-stop): one slow move per beat
POSES = [
    (1, -10, 25, 3.85, 0.05, 0.04, 0.17, 2.2),
    (40, -6, 27, 3.65, 0.07, 0.08, 0.2, 2.2),
    (62, -4, 33, 3.95, 0.0, 0.36, 0.36, 2.6),
    (78, -3, 35, 3.85, 0.0, 0.4, 0.4, 2.6),
    (94, -1, 37, 4.25, 0.0, 0.46, 0.52, 3.0),
    (108, 1, 37, 4.15, 0.05, 0.46, 0.5, 3.0),
    (122, -10, 38, 3.5, 1.68, 0.22, 0.32, 2.4),
    (138, -6, 38, 3.4, 1.72, 0.18, 0.32, 2.4),
    (154, -10, 40, 3.85, 0.0, -0.6, 0.2, 2.8),
    (172, -6, 44, 6.45, 0.45, -0.1, 0.18, 6.0),
    (180, -5, 44, 6.4, 0.45, -0.1, 0.18, 6.0),
]


def pchip(xs, ys, x):
    """monotone cubic through the poses: smooth, no overshoot"""
    n = len(xs)
    if x <= xs[0]:
        return ys[0]
    if x >= xs[-1]:
        return ys[-1]
    h = [xs[i + 1] - xs[i] for i in range(n - 1)]
    dlt = [(ys[i + 1] - ys[i]) / h[i] for i in range(n - 1)]
    m = [dlt[0]] + [0.0] * (n - 2) + [dlt[-1]]
    for i in range(1, n - 1):
        if dlt[i - 1] * dlt[i] <= 0:
            m[i] = 0.0
        else:
            w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]
            m[i] = (w1 + w2) / (w1 / dlt[i - 1] + w2 / dlt[i])
    m[0] = m[-1] = 0.0
    i = max(j for j in range(n - 1) if xs[j] <= x)
    t = (x - xs[i]) / h[i]
    h00, h10, h01, h11 = 2 * t ** 3 - 3 * t ** 2 + 1, t ** 3 - 2 * t ** 2 + t, -2 * t ** 3 + 3 * t ** 2, t ** 3 - t ** 2
    return h00 * ys[i] + h10 * h[i] * m[i] + h01 * ys[i + 1] + h11 * h[i] * m[i + 1]


def pose(fr):
    xs = [p[0] for p in POSES]
    return [pchip(xs, [p[c] for p in POSES], fr) for c in range(1, 8)]


def cam_loc(fr):
    az, el, dist, lx, ly, lz, _ = pose(fr)
    a, e = math.radians(az), math.radians(el)
    return (lx + dist * math.cos(e) * math.sin(a), ly - dist * math.cos(e) * math.cos(a), lz + dist * math.sin(e))


key(cam, 'location', cam_loc)
key(look, 'location', lambda fr: tuple(pose(fr)[3:6]))
key(cam_d.dof, 'aperture_fstop', lambda fr: pose(fr)[6])

# every key is linear: the values above are already eased per frame
for idb in list(bpy.data.objects) + list(bpy.data.curves) + list(bpy.data.cameras) + [m.node_tree for m in bpy.data.materials if m.node_tree]:
    ad = getattr(idb, 'animation_data', None)
    if not (ad and ad.action):
        continue
    for layer in ad.action.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                for fc in cb.fcurves:
                    for kp in fc.keyframe_points:
                        kp.interpolation = 'CONSTANT' if fc.data_path == 'hide_render' else 'LINEAR'

# ---------------------------------------------------------------- labels -> film.json
SHOW = {'team': 12, 'machine': 66, 'channels': 84, 'vault': 116, 'tests': 148}
anchors = {'team': a_team, 'machine': a_machine, 'channels': a_channels, 'vault': a_vault, 'tests': a_tests}
labels = {k: [] for k in anchors}
PROBE = [int(x) for x in opt.get('probe', '').split(',') if x.isdigit()]
for fr in range(1, N + 1):
    scene.frame_set(fr)
    for k, e in anchors.items():
        co = world_to_camera_view(scene, cam, e.matrix_world.translation)
        x, y = co.x, 1 - co.y
        if fr >= SHOW[k] and co.z > 0 and 0.07 <= x <= 0.93 and 0.1 <= y <= (0.88 if k == 'team' else 0.95):  # team hangs below
            labels[k].append([round(x, 4), round(y, 4)])
        else:
            labels[k].append(None)
    if fr in PROBE or (fr % 6 == 0 and opt.get('probe') == 'all'):
        dg = bpy.context.evaluated_depsgraph_get()
        x0, y0, x1, y1 = 1, 1, 0, 0
        for o in scene.objects:
            if o.type != 'MESH' or o is floor or o is cutter or o is slab or o.hide_render or min(o.matrix_world.to_scale()) < 0.01:
                continue
            for c in o.evaluated_get(dg).bound_box:
                co = world_to_camera_view(scene, cam, o.matrix_world @ Vector(c))
                top = o
                while top.parent:
                    top = top.parent
                if co.x < x0:
                    x0, nx0 = co.x, top.name
                if co.x > x1:
                    x1, nx1 = co.x, top.name
                if 1 - co.y < y0:
                    y0, ny0 = 1 - co.y, top.name
                if 1 - co.y > y1:
                    y1, ny1 = 1 - co.y, top.name
        print('extent', fr, 'x %.3f-%.3f  y %.3f-%.3f' % (x0, x1, y0, y1), nx0, nx1, ny0, ny1,
              {k: v[-1] for k, v in labels.items() if v[-1]})
for k, v in labels.items():
    first = next((i + 1 for i, p in enumerate(v) if p), None)
    print('label', k, 'from frame', first, 'at', v[first - 1] if first else None, 'end', v[-1])

os.makedirs(OUT, exist_ok=True)
if not TEST and not NORENDER:
    with open(os.path.join(OUT, 'film.json'), 'w') as fh:
        json.dump({'count': N, 'w': W, 'h': H, 'sizes': SIZES, 'labels': labels}, fh, separators=(',', ':'))
    print('wrote film.json')

# ---------------------------------------------------------------- render
if not NORENDER:
    os.makedirs(RAW, exist_ok=True)
    for fr in FRAMES:
        scene.frame_set(fr)
        scene.render.filepath = os.path.join(RAW, f'{fr:04d}.png')
        bpy.ops.render.render(write_still=True)
        print('frame', fr, flush=True)
