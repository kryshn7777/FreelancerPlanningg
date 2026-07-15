import bpy
import math
import os

# ---------------------------------------------------------
# FreelancerOS Cinematic V2 - Blender Procedural Asset Generator
# ---------------------------------------------------------

# Clean up default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def create_ai_core():
    # High-poly icosahedron for smooth vertex displacement later
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=3.0, location=(0, 0, 0))
    core = bpy.context.active_object
    core.name = "AICore"
    # Shade smooth
    bpy.ops.object.shade_smooth()
    return core

def create_orbital_ring(name, radius, thickness):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius, 
        minor_radius=thickness, 
        major_segments=128, 
        minor_segments=16, 
        location=(0, 0, 0)
    )
    ring = bpy.context.active_object
    ring.name = name
    bpy.ops.object.shade_smooth()
    return ring

def create_module(name, radius, location):
    bpy.ops.mesh.primitive_octahedron_add(radius=radius, location=location)
    module = bpy.context.active_object
    module.name = name
    # Bevel the octahedron slightly
    bpy.ops.object.modifier_add(type='BEVEL')
    module.modifiers["Bevel"].width = 0.05
    module.modifiers["Bevel"].segments = 2
    bpy.ops.object.shade_smooth()
    return module

def create_data_crystal(name, location):
    # Cylinder with low vertices
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.2, depth=1.0, location=location)
    crystal = bpy.context.active_object
    crystal.name = name
    # Scale top and bottom
    for v in crystal.data.vertices:
        if v.co.z > 0.4:
            v.co.x *= 0.1
            v.co.y *= 0.1
        elif v.co.z < -0.4:
            v.co.x *= 0.1
            v.co.y *= 0.1
    bpy.ops.object.shade_smooth()
    return crystal

# --- Generate the Scene ---
ai_core = create_ai_core()

# Create Rings and Modules
create_orbital_ring("OrbitRing_Inner", 6.0, 0.02)
create_module("Module_ProposalAI", 0.4, (6.0, 0, 0))

create_orbital_ring("OrbitRing_Mid", 9.0, 0.02)
create_module("Module_ClientCRM", 0.3, (0, 9.0, 0))
create_data_crystal("Crystal_KnowledgeBrain", (0, -9.0, 0))

create_orbital_ring("OrbitRing_Outer", 12.0, 0.02)
create_module("Module_Analytics", 0.5, (-12.0, 0, 0))

# Export Setup
export_path = os.path.join(os.path.dirname(bpy.data.filepath) if bpy.data.filepath else os.getcwd(), "freelancer-os-assets")
if not os.path.exists(export_path):
    os.makedirs(export_path)

# Save .blend
blend_file = os.path.join(export_path, "FreelancerOS_Assets.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_file)
print(f"Saved .blend file to: {blend_file}")

# Export .glb
glb_file = os.path.join(export_path, "FreelancerOS_Assets.glb")
bpy.ops.export_scene.gltf(
    filepath=glb_file,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_materials='EXPORT',
)
print(f"Exported .glb file to: {glb_file}")

print("Asset generation complete!")
