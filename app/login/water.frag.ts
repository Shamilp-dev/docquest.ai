// /app/login/water.frag.ts
'use client';

export const WATER_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_seed;
uniform float u_aspect;

// --- Utility Noise ---
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(in vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash(i + vec2(0.0,0.0));
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0,100.0);
  for (int i=0;i<3;i++){
    v += a * noise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// --- Curl Flow ---
vec2 flowField(vec2 uv, float t){
  float e = 0.0015;

  float n1 = fbm(uv * 1.4 + vec2(0.0, t * 0.15));
  float nx = fbm(uv * 1.4 + vec2(e,0.0) + vec2(0.0, t * 0.15));
  float ny = fbm(uv * 1.4 + vec2(0.0,e) + vec2(0.0, t * 0.15));

  vec2 grad = vec2(nx - n1, ny - n1) / e;

  return normalize(vec2(-grad.y, grad.x)) * 0.45;
}

// --- Main ---
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv *= vec2(u_resolution.x / u_resolution.y, 1.0);

  vec2 center = uv - vec2(0.5 * (u_resolution.x/u_resolution.y), 0.5);
  vec2 p = center * 1.8;

  float t = u_time * 1.5;

  // Slightly slower motion and tighter swirl paths
  for (int i=0;i<3;i++) {
    vec2 f = flowField(p + float(i)*0.15 + t*0.1, t);
    p += 0.12 * f;
  }

  // Multiple fbm layers for streaks
  float base   = fbm(p * 1.5 + vec2(0.0, -t * 0.05));
  float layer2 = fbm(p * 3.0 + vec2(10.0, t * 0.08));
  float layer3 = fbm(p * 6.0 - vec2(t * 0.12, 5.0));

  // Streak visibility
  float streaks = base * 0.7 + layer2 * 0.4 + layer3 * 0.2;

  // Make streaks appear only in certain narrow ranges
  float mask = smoothstep(0.55, 0.75, streaks);

  // --- COLORS ---
  // super-dark blend
  vec3 dark      = vec3(0.04, 0.00, 0.06);   // almost black purple
  vec3 purple    = vec3(0.55, 0.20, 1.00);   // bright purple streak
  vec3 blue      = vec3(0.20, 0.40, 1.00);   // neon blue accent

  // mix purple + blue for streaks
  vec3 streakColor = mix(purple, blue, layer3);

  // visible streak intensity
  vec3 color = mix(dark, streakColor, mask * 0.85);

  // small shimmer effect for extra movement
  float shimmer = pow(max(0.0, layer2 - 0.4), 2.0);
  color += shimmer * 0.15;

  // final output
  outColor = vec4(color, 1.0);
}
`;
