#version 300 es

#if GL_ES
precision highp float;
precision highp int;
#endif

layout (location = 0) out vec4 fragmentColor;
layout (location = 1) out vec4 fragmentNormal;

uniform uvec2 screenSize;
uniform vec2 viewSize;
uniform float radius;

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Sphere {
    vec3 position;
    float radius;
    vec3 color;
};

struct RayIntersection {
    float distance;
    vec3 normal;
    vec3 hitPoint;
};

RayIntersection miss() {
    RayIntersection intersection;
    intersection.distance = -1.0;
    intersection.normal = vec3(0.0, 0.0, 0.0);
    return intersection;
}

bool raytraceSphere(in Ray ray, in Sphere sphere, out RayIntersection intersection) {
    float a = dot(ray.direction, ray.direction);
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, sphere.position));
    vec3 sphereVector = ray.origin - sphere.position;
    float c = dot(sphereVector, sphereVector) - sphere.radius * sphere.radius;
    float D = b * b - 4.0 * a * c;
    if (D < 0.0) {
        return false;
    }
    float x = (-b - sqrt(D)) / (2.0 * a);
    if (x < 0.0) {
        x = (-b + sqrt(D)) / (2.0 * a);
        if (x < 0.0) {
            return false;
        }
    }
    intersection.distance = x;
    intersection.hitPoint = ray.origin + x * ray.direction;
    intersection.normal = normalize(intersection.hitPoint - sphere.position);
    return true;
}

bool flatScreen(out Ray ray) {
    vec2 screenRelativeCoord = gl_FragCoord.xy / vec2(screenSize);
    vec2 screenRectCoord = screenRelativeCoord * viewSize - viewSize * 0.5;
    vec3 screenFlatCoord = vec3(screenRectCoord, 0.0);
    ray.origin = vec3(0.0, 0.0, radius);
    ray.direction = normalize(screenFlatCoord - ray.origin);
    return true;
}

bool eyeScreen(out Ray ray) {
    vec2 screenRelativeCoord = gl_FragCoord.xy / vec2(screenSize);
    vec2 screenRectCoord = screenRelativeCoord * viewSize - viewSize * 0.5;
    vec2 screenArcCoord = screenRectCoord / radius;
    vec2 screenEyeCoord = sin(screenArcCoord);
    float observableSpace = 1.0 - dot(screenEyeCoord, screenEyeCoord);
    if (observableSpace < 0.0) {
        return false;
    }
    ray.direction = vec3(screenEyeCoord, -sqrt(observableSpace));
    ray.origin = vec3(0.0, 0.0, radius);
    return true;
}

void main() {
    Ray ray;
    if (!flatScreen(ray)) {
        discard;
    }
    Sphere sphere;
    sphere.radius = 1.0;
    sphere.position = vec3(0.0, 0.0, -20.0);
    sphere.color = vec3(1.0, 0.0, 0.0);
    RayIntersection intersection;
    if(!raytraceSphere(ray, sphere, intersection)) {
        discard;
    }
    fragmentColor = vec4(intersection.normal, 1.0);
    fragmentNormal = vec4(intersection.normal, intersection.distance);
}
