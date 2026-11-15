# The medals as real-time models: same geometry as medal.py, exported to glTF
# so the page can render them live (transparent, 60 fps, drag to turn).
# blender -b -P medal_glb.py -- <gold|silver> <en|pt> <out.glb> <ribbon.png>
import bpy, math, sys

args = sys.argv[sys.argv.index('--') + 1:]
kind, lang, out, ribbon_png = args[:4]

FONT = '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf'

face = {
    ('gold', 'en'): ('1st', 'GOLD  ·  OVERALL'),
    ('gold', 'pt'): ('1º', 'OURO  ·  GERAL'),
    ('silver', 'en'): ('16th', 'SILVER  ·  OVERALL'),
    ('silver', 'pt'): ('16º', 'PRATA  ·  GERAL'),
}[(kind, lang)]
spec = {
    'gold': dict(metal=(1.0, 0.74, 0.34), ring='IBEROAMERICAN PHYSICS OLYMPIAD  ·  OIBF  ·  2020  ·  '),
    'silver': dict(metal=(0.95, 0.95, 0.97), ring='NORDIC-BALTIC PHYSICS OLYMPIAD  ·  NBPHO  ·  2020  ·  '),
}[kind]
mark, sub = face

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, color, rough, metallic=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = rough
    return m


FIELD = mat('field', spec['metal'], 0.34)
RELIEF = mat('relief', spec['metal'], 0.12)


def cyl(r, depth, z, m, verts=96):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=(0, 0, z), vertices=verts)
    o = bpy.context.object
    bev = o.modifiers.new('b', 'BEVEL'); bev.width = 0.012; bev.segments = 3
    bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
    o.data.materials.append(m)
    return o


def torus(R, r, z, m, minor=14):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=(0, 0, z), major_segments=128, minor_segments=minor)
    o = bpy.context.object
    bpy.ops.object.shade_smooth()
    o.data.materials.append(m)
    return o


def text(body, size, z, m, depth=0.012, y=0.0, flip=False, spacing=1.0):
    cu = bpy.data.curves.new('t', 'FONT')
    cu.body = body
    cu.font = bpy.data.fonts.load(FONT)
    cu.size = size
    cu.extrude = depth
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    cu.space_character = spacing
    cu.bevel_depth = depth * 0.25
    cu.bevel_resolution = 1
    cu.resolution_u = 4
    o = bpy.data.objects.new('t', cu)
    scene.collection.objects.link(o)
    o.location = (0, y, z)
    if flip:
        o.rotation_euler = (0, math.radians(180), 0)
    o.data.materials.append(m)
    return o


def ring_text(body, radius, z, m, size=0.085):
    n = len(body)
    objs = []
    for i, ch in enumerate(body):
        if ch == ' ':
            continue
        a = math.pi / 2 - (i / n) * 2 * math.pi
        o = text(ch, size, z, m, depth=0.008)
        o.location = (radius * math.cos(a), radius * math.sin(a), z)
        o.rotation_euler = (0, 0, a - math.pi / 2)
        objs.append(o)
    return objs


T = 0.11
field = [cyl(1.0, T, 0, FIELD)]
relief = []
for s in (1, -1):
    relief.append(torus(0.965, 0.04, s * T / 2, RELIEF))
    relief.append(torus(0.62, 0.008, s * T / 2, RELIEF, minor=8))
relief += ring_text(spec['ring'], 0.79, T / 2, RELIEF)
big = 0.62 if len(mark) <= 3 else 0.5
relief.append(text(mark, big, T / 2, RELIEF, y=0.05, depth=0.03))
relief.append(text(sub, 0.085, T / 2, RELIEF, y=-0.36, spacing=1.3, depth=0.01))
relief.append(text('FELIPE F. RIBEIRO FILHO', 0.1, -T / 2, RELIEF, y=0.06, flip=True, depth=0.008, spacing=1.15))
relief.append(text('BRASIL', 0.13, -T / 2, RELIEF, y=-0.14, flip=True, depth=0.01, spacing=1.4))
bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.03, location=(0, 1.08, 0), rotation=(0, math.radians(90), 0))
loop = bpy.context.object; bpy.ops.object.shade_smooth(); loop.data.materials.append(RELIEF); relief.append(loop)

# ribbon: two strips in a V behind the loop, striped by an image texture
rib = bpy.data.materials.new('ribbon'); rib.use_nodes = True
nt = rib.node_tree; p = nt.nodes['Principled BSDF']
p.inputs['Roughness'].default_value = 0.6
img = nt.nodes.new('ShaderNodeTexImage'); img.image = bpy.data.images.load(ribbon_png)
nt.links.new(img.outputs['Color'], p.inputs['Base Color'])
ribbons = []
for s in (1, -1):
    bpy.ops.mesh.primitive_plane_add(size=1)
    r = bpy.context.object
    r.scale = (0.34, 2.4, 1)
    bpy.ops.object.transform_apply(scale=True)
    r.location = (s * 0.42, 2.25, -0.06 - (0.01 if s > 0 else 0))
    r.rotation_euler = (0, 0, math.radians(-s * 10))
    r.data.materials.append(rib)
    sol = r.modifiers.new('s', 'SOLIDIFY'); sol.thickness = 0.01
    ribbons.append(r)


def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return o


join(field, 'field')
join(relief, 'relief')
join(ribbons, 'ribbon')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False, export_apply=True,
                          export_yup=True, export_image_format='WEBP', export_materials='EXPORT')
print('DONE', out)
