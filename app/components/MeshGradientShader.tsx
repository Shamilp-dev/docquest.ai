"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  seed?: number;           // deterministic seed: change to alter texture
  intensity?: number;      // overall brightness
  speed?: number;          // animation speed
  style?: React.CSSProperties;
};

const defaultPalette = [
  [44 / 255, 82 / 255, 255 / 255],   // deep blue
  [101 / 255, 31 / 255, 255 / 255],  // purple
  [72 / 255, 57 / 255, 255 / 255],   // indigo
  [97 / 255, 30 / 255, 235 / 255],   // violet
];

export default function MeshGradientShader({
  seed = 123456789,
  intensity = 0.95,
  speed = 0.9,
  style,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
    if (!gl) {
      console.error("WebGL2 not supported in this browser.");
      return;
    }

    // --- shaders ---
    const vert = `#version 300 es
    precision highp float;
    in vec2 a_position;
    out vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

    const frag = `#version 300 es
    precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_seed;
    uniform float u_intensity;
    uniform float u_speed;
    uniform vec3 u_palette[4];

    in vec2 v_uv;
    out vec4 outColor;

    // deterministic random based on seed & coords
    float rand(vec2 p) {
      return fract(sin(dot(p + u_seed, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // 2D rotation
    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    // smooth noise (value-noise-ish)
    float noise(vec2 p){
      vec2 i = floor(p);
      vec2 f = fract(p);
      // four corners
      float a = rand(i);
      float b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0));
      float d = rand(i + vec2(1.0, 1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
    }

    // fbm
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = p * 2.0;
        a *= 0.5;
      }
      return v;
    }

    // smooth circular blob
    float blob(vec2 p, vec2 center, float radius, float wobble) {
      float d = length(p - center);
      // soft falloff
      float s = smoothstep(radius, radius * 0.25, d);
      // tiny wobble from fbm to make organic edges
      float n = fbm((p - center) * (3.0 + wobble));
      return (1.0 - s) * (0.6 + 0.4 * n);
    }

    void main() {
      // normalized coords centered
      vec2 uv = v_uv;
      vec2 p = uv;
      float aspect = u_resolution.x / u_resolution.y;
      p = (p - 0.5) * vec2(aspect, 1.0) + 0.5;

      // base gradient - deep blue / dark indigo
      vec3 base = mix(vec3(0.035, 0.06, 0.25), vec3(0.08, 0.03, 0.18), uv.y);

      float t = u_time * u_speed;

      // deterministic node positions (few blobs)
      vec2 centers[7];
      centers[0] = vec2(0.30 + 0.06 * (sin(t*0.4 + u_seed)), 0.30 + 0.05 * cos(t*0.35));
      centers[1] = vec2(0.70 + 0.05 * cos(t*0.5 + u_seed*1.3), 0.40 + 0.06 * sin(t*0.45));
      centers[2] = vec2(0.50 + 0.08 * sin(t*0.25 + u_seed*0.7), 0.65 + 0.04 * cos(t*0.3));
      centers[3] = vec2(0.20 + 0.04 * cos(t*0.55 + u_seed*0.9), 0.70 + 0.06 * sin(t*0.6));
      centers[4] = vec2(0.85 + 0.03 * sin(t*0.45 + u_seed*1.7), 0.20 + 0.04 * cos(t*0.35));
      centers[5] = vec2(0.45 + 0.06 * cos(t*0.3 + u_seed*1.1), 0.45 + 0.05 * sin(t*0.25));
      centers[6] = vec2(0.62 + 0.04 * sin(t*0.2 + u_seed*2.1), 0.82 + 0.03 * cos(t*0.15));

      float accum = 0.0;
      vec3 colorSum = vec3(0.0);

      // layered blobs blended with 'screen' effect (approx)
      for (int i = 0; i < 7; i++) {
        float r = 0.22 + 0.14 * float((i % 3));
        float wob = 0.5 + 0.5 * sin(t * (0.7 + float(i) * 0.12) + u_seed * float(i+1));
        float b = blob(p, centers[i], r, wob);
        // pick palette index based on i
        vec3 col = u_palette[i % 4];
        // subtle shift per layer
        col *= 0.9 + 0.2 * sin(t * 0.3 + float(i) * 1.3);
        colorSum += col * b;
        accum += b;
      }

      // normalize color sum
      vec3 blended = colorSum / (accum + 0.0001);

      // add subtle noise overlay for texture
      float n = fbm((p * 1.5 + t * 0.05) * 1.4);
      blended = mix(blended, blended + 0.04 * (n - 0.5), 0.6);

      // final composite: mix base and blended with intensity
      vec3 finalColor = mix(base, blended, u_intensity);

      // contrast & slight color grading
      finalColor = pow(finalColor, vec3(0.95, 0.95, 0.98));
      outColor = vec4(finalColor, 1.0);
    }`;

    // --- compile helpers ---
    function compileShader(source: string, type: number) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compileShader(vert, gl.VERTEX_SHADER);
    const fs = compileShader(frag, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "a_position");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
      return;
    }

    // quad
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    // clip-space quad
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    gl.useProgram(prog);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // uniforms
    const uResLoc = gl.getUniformLocation(prog, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(prog, "u_time");
    const uSeedLoc = gl.getUniformLocation(prog, "u_seed");
    const uIntensityLoc = gl.getUniformLocation(prog, "u_intensity");
    const uSpeedLoc = gl.getUniformLocation(prog, "u_speed");
    const uPaletteLoc = gl.getUniformLocation(prog, "u_palette");

    // set static uniforms
    if (uSeedLoc) gl.uniform1f(uSeedLoc, seed);
    if (uIntensityLoc) gl.uniform1f(uIntensityLoc, intensity);
    if (uSpeedLoc) gl.uniform1f(uSpeedLoc, speed);
    if (uPaletteLoc) {
      // pass palette as flatten floats
      const flat = new Float32Array(12);
      for (let i = 0; i < 4; i++) {
        const p = defaultPalette[i];
        flat[i * 3 + 0] = p[0];
        flat[i * 3 + 1] = p[1];
        flat[i * 3 + 2] = p[2];
      }
      gl.uniform3fv(uPaletteLoc, flat);
    }

    // resize handling
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    function resize() {
      if (!gl) return;
      const w = Math.max(1, canvas.clientWidth | 0);
      const h = Math.max(1, canvas.clientHeight | 0);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uResLoc) gl.uniform2f(uResLoc, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    // animation loop
    let start = performance.now();
    function frame(now: number) {
      if (!gl) return;
      const t = (now - start) / 1000;
      if (uTimeLoc) gl.uniform1f(uTimeLoc, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (gl) {
        gl.deleteBuffer(quad);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, [seed, intensity, speed]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          filter: "blur(40px) saturate(1.1)",
          transform: "scale(1.06)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
