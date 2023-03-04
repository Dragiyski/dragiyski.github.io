bool actionRaytraceSphere(const inout RaytraceState state, const in Ray ray, const in Object object) {
    vec4 value_1 = getFloatData(object.data.z);
    vec3 sphere_center = value_1.xyz;
    float sphere_radius = value_1.w;
    vec3 sphere_vector = sphere_center - ray.origin;
    
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, sphere_center));
    float c = dot(sphere_vector, sphere_vector) - sphere_radius * sphere_radius;

    float D = b * b - 4.0 * c;
    if (D < 0.0) {
        return false;
    }

    float depth = (-b - sqrt(D)) * 0.5;
    if (depth < 0.0 || depth > state.depth) {
        depth = (-b + sqrt(D)) * 0.5;
        if (depth < 0.0 || depth > state.depth) {
            return false;
        }
    }

    vec3 hit_point = ray.origin + depth * ray.direction;
    vec3 normal = normalize(hit_point - sphere_center);

    state.normal = normal;
    state.hit_point = hit_point;
    state.depth = depth;
    state.id = object.id;
    return true;
}

bool actionColorRaytraceSphere(const inout ColorRaytraceState state, const in Ray ray, const in Object object) {
    if (!actionRaytraceSphere(state.state, ray, object)) {
        return false;
    }
    return true;
}
