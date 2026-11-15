# A struck medal with ribbon, rendered in Cycles as a seamless turntable loop.
# blender -b -P medal.py -- <gold|silver> <out_dir> [frames] [samples] [still]
import bpy, math, os, sys
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
kind = args[0]
out = args[1]
frames = int(args[2]) if len(args) > 2 else 96
samples = int(args[3]) if len(args) > 3 else 64
still = len(args) > 4

FONT = '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf'
FONT_R = '/System/Library/Fonts/Supplemental/Times New Roman.ttf'

spec = {
    'gold': dict(metal=(1.0, 0.71, 0.29), rough=0.22, mark='1st', sub='TOP GOLD',
                 ring='IBEROAMERICAN PHYSICS OLYMPIAD  ·  OIBF  ·  2020  ·  ',
                 back='FELIPE F. RIBEIRO FILHO', back2='BRASIL',
                 ribbon=(0.004, 0.03, 0.30), stripe=(0.9, 0.9, 0.9)),
    'silver': dict(metal=(0.93, 0.93, 0.95), rough=0.2, mark='Ag', sub='SILVER',
                   ring='NORDIC-BALTIC PHYSICS OLYMPIAD  ·  2020  ·  ',
                   back='FELIPE F. RIBEIRO FILHO', back2='BRASIL',
                   ribbon=(0.004, 0.012, 0.08), stripe=(0.85, 0.55, 0.03)),
}[kind]

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def metal_mat(name, color, rough, brushed=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = 1.0
    p.inputs['Roughness'].default_value = rough
    if brushed:
        # fine concentric-ish grain, like a struck field
        tex = nt.nodes.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = 900
        tex.inputs['Detail'].default_value = 2
        bump = nt.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = 0.08
        nt.links.new(tex.outputs['Fac'], bump.inputs['Height'])
        nt.links.new(bump.outputs['Normal'], p.inputs['Normal'])
        rmap = nt.nodes.new('ShaderNodeMapRange')
        rmap.inputs['To Min'].default_value = rough * 0.8
        rmap.inputs['To Max'].default_value = rough * 1.6
        nt.links.new(tex.outputs['Fac'], rmap.inputs['Value'])
        nt.links.new(rmap.outputs['Result'], p.inputs['Roughness'])
    return m


FIELD = metal_mat('field', spec['metal'], spec['rough'] + 0.12, brushed=True)
RELIEF = metal_mat('relief', spec['metal'], spec['rough'] * 0.6)


def cyl(r, depth, z, m, verts=128):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=(0, 0, z), vertices=verts)
    o = bpy.context.object
    bev = o.modifiers.new('b', 'BEVEL'); bev.width = 0.012; bev.segments = 3
    bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
    o.data.materials.append(m)
    return o


def torus(R, r, z, m):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=(0, 0, z), major_segments=160, minor_segments=24)
    o = bpy.context.object
    bpy.ops.object.shade_smooth()
    o.data.materials.append(m)
    return o


def text(body, size, z, m, font=FONT, depth=0.012, y=0.0, flip=False, spacing=1.0):
    cu = bpy.data.curves.new('t', 'FONT')
    cu.body = body
    cu.font = bpy.data.fonts.load(font)
    cu.size = size
    cu.extrude = depth
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    cu.space_character = spacing
    cu.bevel_depth = depth * 0.25
    o = bpy.data.objects.new('t', cu)
    scene.collection.objects.link(o)
    o.location = (0, y, z)
    if flip:
        o.rotation_euler = (0, math.radians(180), 0)
    o.data.materials.append(m)
    return o


def ring_text(body, radius, z, m, size=0.085, flip=False):
    # one letter per object, laid out around the circle, reading clockwise from the top
    n = len(body)
    objs = []
    for i, ch in enumerate(body):
        if ch == ' ':
            continue
        a = math.pi / 2 - (i / n) * 2 * math.pi * (-1 if flip else 1)
        o = text(ch, size, z, m, font=FONT, depth=0.008)
        o.location = (radius * math.cos(a), radius * math.sin(a), z)
        rz = a - math.pi / 2
        o.rotation_euler = (0, math.radians(180) if flip else 0, -rz if flip else rz)
        objs.append(o)
    return objs


medal = bpy.data.objects.new('medal', None)
scene.collection.objects.link(medal)
parts = []
T = 0.11  # disc thickness
parts.append(cyl(1.0, T, 0, FIELD))
for s in (1, -1):
    parts.append(torus(0.965, 0.04, s * T / 2, RELIEF))
    parts.append(torus(0.62, 0.008, s * T / 2, RELIEF))
parts += ring_text(spec['ring'], 0.79, T / 2, RELIEF)
parts.append(text(spec['mark'], 0.62, T / 2, RELIEF, y=0.04, depth=0.03))
parts.append(text(spec['sub'], 0.105, T / 2, RELIEF, y=-0.36, spacing=1.35, depth=0.01))
# back
parts.append(text(spec['back'], 0.1, -T / 2, RELIEF, y=0.06, flip=True, depth=0.008, spacing=1.15))
parts.append(text(spec['back2'], 0.13, -T / 2, RELIEF, y=-0.14, flip=True, depth=0.01, spacing=1.4))
# loop at the top
bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.03, location=(0, 1.08, 0), rotation=(0, math.radians(90), 0))
loop = bpy.context.object; bpy.ops.object.shade_smooth(); loop.data.materials.append(RELIEF); parts.append(loop)
for o in parts:
    o.parent = medal

# ribbon: a V of two strips falling behind the loop, with a stripe texture
rib = bpy.data.materials.new('ribbon'); rib.use_nodes = True
nt = rib.node_tree; p = nt.nodes['Principled BSDF']
p.inputs['Roughness'].default_value = 0.55
p.inputs['Sheen Weight'].default_value = 0.6
coord = nt.nodes.new('ShaderNodeTexCoord')
wave = nt.nodes.new('ShaderNodeTexWave'); wave.wave_profile = 'SAW'
sep = nt.nodes.new('ShaderNodeSeparateXYZ')
nt.links.new(coord.outputs['UV'], sep.inputs['Vector'])
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.interpolation = 'CONSTANT'
e = ramp.color_ramp.elements
e[0].color = (*spec['ribbon'], 1); e[0].position = 0
e[1].color = (*spec['ribbon'], 1); e[1].position = 0.99
for pos, col in ((0.22, spec['stripe']), (0.34, spec['ribbon']), (0.66, spec['stripe']), (0.78, spec['ribbon'])):
    el = e.new(pos); el.color = (*col, 1)
nt.links.new(sep.outputs['X'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], p.inputs['Base Color'])
for s in (1, -1):
    bpy.ops.mesh.primitive_plane_add(size=1)
    r = bpy.context.object
    r.scale = (0.34, 2.4, 1)
    bpy.ops.object.transform_apply(scale=True)
    r.location = (s * 0.42, 2.25, -0.06 - (0.01 if s > 0 else 0))
    r.rotation_euler = (0, 0, math.radians(-s * 10))
    r.data.materials.append(rib)
    sub = r.modifiers.new('s', 'SOLIDIFY'); sub.thickness = 0.01
    r.parent = medal

# turntable: medal spins once around Y over the loop (the ribbon spins with it)
medal.rotation_mode = 'XYZ'
scene.frame_start, scene.frame_end = 1, frames
medal.rotation_euler = (math.radians(6), 0, 0)
medal.keyframe_insert('rotation_euler', index=1, frame=1)
medal.rotation_euler[1] = math.radians(360)
medal.keyframe_insert('rotation_euler', index=1, frame=frames + 1)
for fc in medal.animation_data.action.fcurves if hasattr(medal.animation_data.action, 'fcurves') else []:
    for kp in fc.keyframe_points:
        kp.interpolation = 'LINEAR'
try:
    # Blender 4.4+ layered actions
    for layer in medal.animation_data.action.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                for fc in cb.fcurves:
                    for kp in fc.keyframe_points:
                        kp.interpolation = 'LINEAR'
except Exception:
    pass

# camera and studio light
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
cam.data.lens = 85
scene.collection.objects.link(cam)
cam.location = (0, 0.25, 8.2)
cam.rotation_euler = (0, 0, 0)
d = Vector((0, 0.25, 0)) - cam.location
cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam


def area(loc, energy, size, color=(1, 1, 1)):
    L = bpy.data.lights.new('a', 'AREA'); L.energy = energy; L.size = size; L.color = color
    o = bpy.data.objects.new('a', L); scene.collection.objects.link(o)
    o.location = loc
    dd = Vector((0, 0, 0)) - Vector(loc)
    o.rotation_euler = dd.to_track_quat('-Z', 'Y').to_euler()


area((-3.5, 3.0, 4.0), 900, 3.0)
area((4.0, -1.0, 3.0), 500, 4.0, (1.0, 0.82, 0.7))
area((0, -4, -3), 400, 3.0, (0.7, 0.8, 1.0))
area((0, 5, -2), 300, 2.0)
world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True
bg = world.node_tree.nodes['Background']
sky = world.node_tree.nodes.new('ShaderNodeTexGradient')
world.node_tree.links.new(sky.outputs['Color'], bg.inputs['Color'])
bg.inputs['Strength'].default_value = 0.35

scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'METAL'
prefs.get_devices()
for dv in prefs.devices:
    dv.use = True
scene.cycles.samples = samples
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = 640
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
os.makedirs(out, exist_ok=True)
if still:
    for f in (1, frames // 4, frames // 2):
        scene.frame_set(f)
        scene.render.filepath = os.path.join(out, f'{kind}-still-{f}.png')
        bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath = os.path.join(out, f'{kind}-')
    bpy.ops.render.render(animation=True)
print('DONE')
