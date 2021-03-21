#version 300 es

#if GL_ES
precision highp float;
precision highp int;
#endif

out vec4 fragmentColor;

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
};

RayIntersection miss() {
    RayIntersection intersection;
    intersection.distance = -1.0;
    intersection.normal = vec3(0.0, 0.0, 0.0);
    return intersection;
}

RayIntersection raytraceSphere(Ray ray, Sphere sphere) {
    float a = dot(ray.direction, ray.direction);
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, sphere.position));
    vec3 sphereVector = ray.origin - sphere.position;
    float c = dot(sphereVector, sphereVector) - sphere.radius * sphere.radius;
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
    RayIntersection intersection;
    intersection.distance = x;
    vec3 hitPoint = ray.origin + x * ray.direction;
    intersection.normal = normalize(hitPoint - sphere.position);
    return intersection;
}

Ray flatScreen() {
    vec2 screenRelativeCoord = gl_FragCoord.xy / vec2(screenSize);
    vec2 screenRectCoord = screenRelativeCoord * viewSize - viewSize * 0.5;
    vec3 screenFlatCoord = vec3(screenRectCoord, 0.0);
    Ray ray;
    ray.origin = vec3(0.0, 0.0, radius);
    ray.direction = normalize(screenFlatCoord - ray.origin);
    return ray;
}

Ray eyeScreen() {
    vec2 screenRelativeCoord = gl_FragCoord.xy / vec2(screenSize);
    vec2 screenRectCoord = screenRelativeCoord * viewSize - viewSize * 0.5;
    vec2 screenArcCoord = screenRectCoord / radius;
    vec2 screenEyeCoord = sin(screenArcCoord);
    float observableSpace = 1.0 - dot(screenEyeCoord, screenEyeCoord);
    if (observableSpace < 0.0) {
        return Ray(vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0));
    }
    Ray ray;
    ray.direction = vec3(screenEyeCoord, -sqrt(observableSpace));
    ray.origin = vec3(0.0, 0.0, radius);
    return ray;
}

void main() {
    Ray ray = flatScreen();
//    Ray ray = eyeScreen();
    Sphere sphere;
    sphere.radius = 1.0;
    sphere.position = vec3(0.0, 0.0, -20.0);
    sphere.color = vec3(1.0, 0.0, 0.0);
    RayIntersection intersection = raytraceSphere(ray, sphere);
    if(intersection.distance < 0.0) {
        discard;
    }

    fragmentColor = vec4(intersection.normal * 0.5 + 0.5, 1.0);
//    fragmentColor = vec4(b * 0.01, 0.0, 0.0, 1.0);
}
