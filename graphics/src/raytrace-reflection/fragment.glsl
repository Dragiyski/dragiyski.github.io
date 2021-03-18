#version 300 es

#if GL_ES
precision highp float;
precision highp int;
#endif

#define EPSILON (1.1920928955078125e-7)
#define MAX_VALUE (1.7014118346046923e+38)
#define MIN_VALUE (1.401298464324817e-45)
#define MIN_NORMAL_VALUE (1.1754943508222875e-38)

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
    vec4 color;
    Material material;
};

struct Phong {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

bool isEqual(float a, float b) {
    if (a == b) {
        return true;
    }
    if (isnan(a) || isnan(b)) {
        return false;
    }
    float diff = abs(a - b);
    float finAmp = min(abs(a) + abs(b), MAX_VALUE);
    return diff < max(MIN_VALUE, EPSILON * finAmp);
}

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
    rayTrace.material = sphere.material;
    rayTrace.color = sphere.color;
    return rayTrace;
}

RayTrace rayTrace(Ray ray) {
    int objectCount = textureSize(spheres, 0).y;
    RayTrace trace = miss();
    for (int i = 0; i < objectCount; ++i) {
        Sphere sphere = getSphere(i);
        RayTrace sphereTrace = raytraceSphere(ray, sphere);
        if (isinf(sphereTrace.distance)) {
            continue;
        }
        if (!isEqual(sphereTrace.distance, 0.0) && sphereTrace.distance < trace.distance) {
            trace = sphereTrace;
        }
    }
    return trace;
}

Phong illuminate(RayTrace trace, vec3 viewVector) {
    Phong phong;
    phong.ambient = trace.material.ambient * trace.color.xyz;
    phong.diffuse = vec3(0.0, 0.0, 0.0);
    phong.specular = vec3(0.0, 0.0, 0.0);

    int lightCount = textureSize(lights, 0).y;
    for (int i = 0; i < lightCount; ++i) {
        Light light = getLight(i);
        vec3 lightVector = light.position - trace.hitPoint;
        vec3 L = normalize(lightVector);
        {
            Ray lightRay;
            lightRay.origin = trace.hitPoint + 0.5 * L;
            lightRay.direction = L;
            RayTrace lightTracer = rayTrace(lightRay);
            if (lightTracer.distance < length(lightVector)) {
                continue;
            }
        }
        phong.diffuse += trace.material.diffuse * max(0.0, dot(L, trace.normal)) * trace.color.xyz * light.color;
        vec3 R = reflect(-L, trace.normal);
        phong.specular += trace.material.specular * pow(max(0.0, dot(R, viewVector)), trace.material.exponent) * light.color;
    }

    return phong;
}

Phong noPhong() {
    Phong phong;
    phong.ambient = vec3(0.0, 0.0, 0.0);
    phong.diffuse = vec3(0.0, 0.0, 0.0);
    phong.specular = vec3(0.0, 0.0, 0.0);
    return phong;
}

Phong reflectRayTrace1(RayTrace previous, vec3 direction) {
    Ray reflectRay;
    reflectRay.direction = reflect(direction, previous.normal);
    reflectRay.origin = previous.hitPoint + 0.5 * reflectRay.direction;
    RayTrace reflectTrace = rayTrace(reflectRay);
    if(isinf(reflectTrace.distance)) {
        return noPhong();
    }
    return illuminate(reflectTrace, -reflectRay.direction);
}

Phong reflectRayTrace2(RayTrace previous, vec3 direction) {
    Ray reflectRay;
    reflectRay.direction = reflect(direction, previous.normal);
    reflectRay.origin = previous.hitPoint + 0.5 * reflectRay.direction;
    RayTrace reflectTrace = rayTrace(reflectRay);
    if(isinf(reflectTrace.distance)) {
        return noPhong();
    }
    Phong reflectPhong = illuminate(reflectTrace, -reflectRay.direction);
    Phong reflectedPhong = reflectRayTrace1(reflectTrace, reflectRay.direction);
    reflectPhong.specular += reflectTrace.material.specular * (reflectedPhong.ambient + reflectedPhong.diffuse + reflectedPhong.specular);
    return reflectPhong;
}

Phong reflectRayTrace3(RayTrace previous, vec3 direction) {
    Ray reflectRay;
    reflectRay.direction = reflect(direction, previous.normal);
    reflectRay.origin = previous.hitPoint + 0.5 * reflectRay.direction;
    RayTrace reflectTrace = rayTrace(reflectRay);
    if(isinf(reflectTrace.distance)) {
        return noPhong();
    }
    Phong reflectPhong = illuminate(reflectTrace, -reflectRay.direction);
    Phong reflectedPhong = reflectRayTrace2(reflectTrace, reflectRay.direction);
    reflectPhong.specular += reflectTrace.material.specular * (reflectedPhong.ambient + reflectedPhong.diffuse + reflectedPhong.specular);
    return reflectPhong;
}

const int antialis = 2;

void main() {
    float screenMinHalf = float(min(screenSize.x, screenSize.y)) * 0.5;
    float imageRatio = screenMinHalf / 200.0;
    vec2 screenCenter = vec2(screenSize) * 0.5;
    vec2 imageOrigin = screenCenter - vec2(screenMinHalf);
    fragmentColor = vec4(0.0, 0.0, 0.0, 0.0);

    float divisor = 1.0 / float(antialis);
    float zero = 0.0;
    gl_FragDepth = 1.0 / zero;

    for (int aliasX = 0; aliasX < antialis; ++aliasX) {
        for (int aliasY = 0; aliasY < antialis; ++aliasY) {
            vec2 fragmentCoords = gl_FragCoord.xy;
            vec2 offsetAntialias = vec2(float(aliasX + 1) * divisor - divisor / 2.0 - 0.5, float(aliasY + 1) * divisor - divisor / 2.0 - 0.5);
            fragmentCoords += offsetAntialias;
            vec2 sceenCoords = (fragmentCoords - imageOrigin) / imageRatio;
            Ray ray;
            ray.origin = vec3(200.0, 200.0, 1000.0);
            ray.direction = normalize(vec3(sceenCoords, 0.0) - ray.origin);

            int objectCount = textureSize(spheres, 0).y;
            RayTrace cameraTrace = rayTrace(ray);
            if (isinf(cameraTrace.distance)) {
                // discard;
                fragmentColor = vec4(0.0, 0.0, 0.0, 0.0);
                return;
            }
            gl_FragDepth = min(gl_FragDepth, cameraTrace.distance);

            Phong cameraPhong = illuminate(cameraTrace, -ray.direction);

            Phong reflectedPhong = reflectRayTrace3(cameraTrace, ray.direction);
            cameraPhong.specular += cameraTrace.material.specular * (reflectedPhong.ambient + reflectedPhong.diffuse + reflectedPhong.specular);
            fragmentColor.rgb += cameraPhong.ambient + cameraPhong.diffuse + cameraPhong.specular;
            fragmentColor.a += 1.0;
        }
    }

    fragmentColor /= float(antialis * antialis);
}
