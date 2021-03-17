#version 300 es

#if GL_ES
precision highp float;
precision highp int;
#endif

#define EPSILON (1.1920928955078125e-7)

in vec2 position;

out vec4 fragmentColor;

uniform uvec2 screenSize;
uniform sampler2D spheres;
uniform sampler2D lights;

struct Material {
    float ambient;
    float diffuse;
    float specular;
    float exponent;
};

struct Sphere {
    vec3 position;
    float radius;
    Material material;
    vec4 color;
};

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Light {
    vec3 position;
    vec3 color;
};

struct RayTrace {
    vec3 normal;
    float distance;
    vec3 hitPoint;
};

struct RayTracer {
    RayTrace trace;
    int index;
};

float length2(vec3 value) {
    return value.x * value.x + value.y * value.y + value.z * value.z;
}

RayTrace miss() {
    RayTrace rayTrace;
    float zero = 0.0;
    rayTrace.distance = 1.0 / zero;
    rayTrace.normal = vec3(0.0, 0.0, 0.0);
    return rayTrace;
}

Sphere getSphere(int index) {
    vec4 tex0 = texelFetch(spheres, ivec2(0, index), 0);
    vec4 tex1 = texelFetch(spheres, ivec2(1, index), 0);
    vec4 tex2 = texelFetch(spheres, ivec2(2, index), 0);
    Sphere sphere;
    sphere.position = tex0.xyz;
    sphere.radius = tex0.w;
    sphere.material.ambient = tex1.x;
    sphere.material.diffuse = tex1.y;
    sphere.material.specular = tex1.z;
    sphere.material.exponent = tex1.w;
    sphere.color = tex2;
    return sphere;
}

Light getLight(int index) {
    vec4 tex0 = texelFetch(lights, ivec2(0, index), 0);
    vec4 tex1 = texelFetch(lights, ivec2(1, index), 0);
    Light light;
    light.position = tex0.xyz;
    light.color = tex1.xyz;
    return light;
}

RayTrace raytraceSphere(Ray ray, Sphere sphere) {
    float a = length2(ray.direction);
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, sphere.position));
    float c = length2(ray.origin - sphere.position) - sphere.radius * sphere.radius;
    float D = b * b - 4.0 * a * c;
    if (D < 0.0) {
        return miss();
    }
    float x = (-b - sqrt(D)) / (2.0 * a);
    if (x < 0.0) {
        x = (-b + sqrt(D)) / (2.0 * a);
        if (x < 0.0) {
            return miss();
        }
    }
    RayTrace rayTrace;
    rayTrace.distance = x;
    vec3 hitPoint = ray.origin + x * ray.direction;
    rayTrace.normal = normalize(hitPoint - sphere.position);
    if (dot(rayTrace.normal, -ray.direction) < 0.0) {
        rayTrace.normal = -rayTrace.normal;
    }
    rayTrace.hitPoint = hitPoint;
    return rayTrace;
}

RayTracer rayTrace(Ray ray, int skip) {
    int objectCount = textureSize(spheres, 0).y;
    RayTracer tracer;
    tracer.trace = miss();
    tracer.index = -1;
    for (int i = 0; i < objectCount; ++i) {
        Sphere sphere = getSphere(i);
        RayTrace sphereTrace = raytraceSphere(ray, sphere);
        if (isinf(sphereTrace.distance) || i == skip) {
            continue;
        }
        if (sphereTrace.distance < tracer.trace.distance) {
            tracer.trace = sphereTrace;
            tracer.index = i;
        }
    }
    return tracer;
}

void main() {
    float screenMinHalf = float(min(screenSize.x, screenSize.y)) * 0.5;
    float imageRatio = screenMinHalf / 200.0;
    vec2 screenCenter = vec2(screenSize) * 0.5;
    vec2 imageOrigin = screenCenter - vec2(screenMinHalf);

    vec2 sceenCoords = (gl_FragCoord.xy - imageOrigin) / imageRatio;
    Ray ray;
    ray.origin = vec3(200.0, 200.0, 1000.0);
    ray.direction = normalize(vec3(sceenCoords, 0.0) - ray.origin);

    int objectCount = textureSize(spheres, 0).y;
    RayTracer cameraTracer = rayTrace(ray, -1);
    if (cameraTracer.index < 0) {
        discard;
        fragmentColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }
    gl_FragDepth = cameraTracer.trace.distance;

    Sphere sphere = getSphere(cameraTracer.index);

    vec3 ambient = sphere.material.ambient * sphere.color.xyz;
    vec3 diffuse = vec3(0.0, 0.0, 0.0);
    vec3 specular = vec3(0.0, 0.0, 0.0);
    int lightCount = textureSize(lights, 0).y;
    for (int i = 0; i < lightCount; ++i) {
        Light light = getLight(i);
        vec3 lightVector = light.position - cameraTracer.trace.hitPoint;
        vec3 L = normalize(lightVector);
        {
            Ray lightRay;
            lightRay.origin = cameraTracer.trace.hitPoint;
            lightRay.direction = L;
            RayTracer lightTracer = rayTrace(lightRay, cameraTracer.index);
            if (lightTracer.index >= 0 && lightTracer.trace.distance < length(lightVector)) {
                continue;
            }
        }
        diffuse += sphere.material.diffuse * max(0.0, dot(L, cameraTracer.trace.normal)) * sphere.color.xyz * light.color;
        vec3 R = reflect(-L, cameraTracer.trace.normal);
        specular += sphere.material.specular * pow(max(0.0, dot(R, -ray.direction)), sphere.material.exponent) * light.color;
    }

    fragmentColor = vec4(ambient + diffuse + specular, 1.0);
}
