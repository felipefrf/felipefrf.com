# Matsumoto-2: a C-band SAR Earth-observation satellite, modelled procedurally.
# blender -b -P satellite.py -- <out_dir>
# Writes satellite.glb (for the site's three.js hero) and satellite.png (check render).
import bpy, bmesh, math, os, sys
from mathutils import Vector

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '.'
here = os.path.dirname(os.path.abspath(__file__))

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, color, metal=0.0, rough=0.5, img=None, emit=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    if img:
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = bpy.data.images.load(os.path.join(here, img))
        nt.links.new(t.outputs['Color'], p.inputs['Base Color'])
    if emit:
        p.inputs['Emission Color'].default_value = (*emit, 1)
        p.inputs['Emission Strength'].default_value = 4.0
    return m


GOLD = mat('mli-gold', (0.83, 0.55, 0.18), 1.0, 0.32)
SILVER = mat('mli-silver', (0.78, 0.79, 0.82), 1.0, 0.28)
WHITE = mat('radiator', (0.86, 0.87, 0.88), 0.0, 0.45)
DARK = mat('structure', (0.05, 0.055, 0.06), 0.6, 0.4)
SOLAR = mat('solar', (1, 1, 1), 0.35, 0.22, img='solar.png')
SAR = mat('sar', (1, 1, 1), 0.2, 0.5, img='sar.png')
LAMP = mat('beacon', (1, 0.35, 0.12), 0, 0.4, emit=(1, 0.35, 0.12))

objs = []


def add(o, m):
    o.data.materials.append(m)
    objs.append(o)
    return o


def box(name, size, loc, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = o.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier='bevel')
    bpy.ops.object.shade_auto_smooth(angle=math.radians(35))
    return add(o, m)


def cyl(name, r, depth, loc, m, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object
    o.name = name
    bpy.ops.object.shade_auto_smooth(angle=math.radians(35))
    return add(o, m)


def uv_box(o):
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.cube_project(cube_size=1.0, scale_to_bounds=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    o.select_set(False)


# Axes: +X is the flight direction, -Z points at Earth (nadir), Y is the wing axis.
# bus: an octagonal prism wrapped in gold foil, with a white radiator band
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.62, depth=1.15, location=(0, 0, 0), rotation=(0, 0, math.radians(22.5)))
bus = bpy.context.object
bus.name = 'bus'
mod = bus.modifiers.new('bevel', 'BEVEL'); mod.width = 0.03; mod.segments = 2
bpy.ops.object.modifier_apply(modifier='bevel')
add(bus, GOLD)
cyl('radiator-band', 0.635, 0.22, (0, 0, 0.32), WHITE, rot=(0, 0, math.radians(22.5)), verts=8)
cyl('top-deck', 0.6, 0.05, (0, 0, 0.6), DARK, verts=8)
cyl('bottom-deck', 0.6, 0.05, (0, 0, -0.6), DARK, verts=8)

# SAR antenna: a long flat phased array under the bus, facing nadir, split in 3 deployed panels
for i, x in enumerate((-2.05, 0, 2.05)):
    p = box(f'sar-panel-{i}', (2.0, 1.15, 0.07), (x, 0, -0.78), SAR, bevel=0.01)
    uv_box(p)
    box(f'sar-back-{i}', (2.0, 1.15, 0.03), (x, 0, -0.73), DARK)
for x in (-1.025, 1.025):
    box('hinge', (0.06, 1.0, 0.06), (x, 0, -0.74), SILVER)
box('sar-mast', (0.18, 0.18, 0.16), (0, 0, -0.66), SILVER)

# solar wings on +Y and -Y, each a yoke and three panels
for s in (1, -1):
    cyl(f'yoke-{s}', 0.035, 0.7, (0, s * 0.95, 0.18), SILVER, rot=(math.radians(90), 0, 0), verts=12)
    box(f'sada-{s}', (0.16, 0.12, 0.16), (0, s * 0.66, 0.18), DARK)
    for k in range(3):
        y = s * (1.45 + k * 1.02)
        p = box(f'wing-{s}-{k}', (0.95, 0.98, 0.035), (0, y, 0.18), SOLAR, bevel=0.006)
        uv_box(p)
        box(f'wing-frame-{s}-{k}', (0.97, 1.0, 0.02), (0, y, 0.16), SILVER)

# X-band downlink dish on a short boom, star trackers and a GNSS patch on top
cyl('dish-boom', 0.025, 0.4, (-0.35, -0.3, -0.75 - 0.0), SILVER, verts=10)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(0.0, 0.0, 0.0), segments=32, ring_count=16)
dish = bpy.context.object
dish.name = 'dish'
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(dish.data)
for v in [v for v in bm.verts if v.co.z > -0.08]:
    bm.verts.remove(v)
bmesh.update_edit_mesh(dish.data)
bpy.ops.object.mode_set(mode='OBJECT')
dish.scale = (1, 1, 0.45)
dish.location = (0.38, 0.32, 0.92)
dish.rotation_euler = (math.radians(180), 0, 0)
sol = dish.modifiers.new('solid', 'SOLIDIFY'); sol.thickness = 0.012
bpy.ops.object.shade_auto_smooth(angle=math.radians(60))
add(dish, WHITE)
cyl('dish-feed', 0.018, 0.22, (0.38, 0.32, 0.86), SILVER, verts=10)
for k, (x, y) in enumerate(((-0.32, 0.25), (-0.32, -0.25))):
    cyl(f'star-tracker-{k}', 0.07, 0.16, (x, y, 0.7), DARK, rot=(math.radians(18), 0, 0), verts=16)
    cyl(f'baffle-{k}', 0.085, 0.06, (x, y, 0.79), SILVER, rot=(math.radians(18), 0, 0), verts=16)
box('gnss', (0.18, 0.18, 0.02), (0.1, -0.3, 0.63), WHITE)
cyl('thruster', 0.05, 0.12, (-0.68, 0, -0.2), DARK, rot=(0, math.radians(90), 0), verts=16)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.03, location=(0.62, 0, 0.45))
add(bpy.context.object, LAMP)

# join into one object per material keeps the GLB small and draw calls low
root = bpy.data.objects.new('matsumoto-2', None)
scene.collection.objects.link(root)
for o in objs:
    o.parent = root

bpy.ops.export_scene.gltf(
    filepath=os.path.join(out, 'satellite.glb'),
    export_format='GLB',
    export_apply=True,
    export_image_format='WEBP',
    export_yup=True,
)

# quick check render
cam_data = bpy.data.cameras.new('cam'); cam_data.lens = 50
cam = bpy.data.objects.new('cam', cam_data); scene.collection.objects.link(cam)
cam.location = (7.5, -8.5, 4.2)
d = Vector((0, 0, 0)) - cam.location
cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN'))
sun.data.energy = 4.0
sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(40))
scene.collection.objects.link(sun)
world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.025, 0.035, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x, scene.render.resolution_y = 1200, 800
scene.render.filepath = os.path.join(out, 'satellite.png')
bpy.ops.render.render(write_still=True)
print('OK', os.path.join(out, 'satellite.glb'))
