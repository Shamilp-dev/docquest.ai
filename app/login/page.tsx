// /app/login/page.tsx
"use client";
import { Poppins } from "next/font/google";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WATER_FRAGMENT } from "./water.frag";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Loader2,
  HelpCircle,
  Key,
} from "lucide-react";

/* ---------------------------
   -- Security questions --
   --------------------------- */



const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was your childhood nickname?",
  "What is the name of your favorite teacher?",
];
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
/* ---------------------------
   -- WebGL helpers --
   --------------------------- */
function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile error: " + err);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vsrc: string, fsrc: string) {
  const v = createShader(gl, gl.VERTEX_SHADER, vsrc);
  const f = createShader(gl, gl.FRAGMENT_SHADER, fsrc);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create program");
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link error: " + err);
  }
  return program;
}

const VERT_SHADER = `#version 300 es
in vec2 a_position;
void main(){
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/* ---------------------------
   -- WaterGLBackground component --
   --------------------------- */
function WaterGLBackground({ seed = Math.random() }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
const [fadeOutLogin, setFadeOutLogin] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      // Not mounted yet
      return;
    }

    // Try to get WebGL2 context safely
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
    }) as WebGL2RenderingContext | null;
    if (!gl) {
      // fallback
      canvas.style.background =
        "linear-gradient(180deg, rgb(20 24 60), rgb(45 21 101))";
      return;
    }

    // Compile program
    const program = createProgram(gl, VERT_SHADER, WATER_FRAGMENT);

    // Fullscreen triangle
    const posBuffer = gl.createBuffer();
    if (!posBuffer) {
      console.warn("Unable to create buffer");
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    gl.useProgram(program);
    const aPos = gl.getAttribLocation(program, "a_position");
    if (aPos >= 0) {
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    }

    // Uniform locations — may be null; guard before using
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uSeed = gl.getUniformLocation(program, "u_seed");
    const uAspect = gl.getUniformLocation(program, "u_aspect");

    let currentW = 0;
    let currentH = 0;
    function resize() {
      if (!canvas || !gl) return;
      const parent = canvas.parentElement ?? document.body;
      const w = Math.max(1, Math.floor(parent.clientWidth));
      const h = Math.max(1, Math.floor(parent.clientHeight));
      if (w === currentW && h === currentH) return;
      currentW = w;
      currentH = h;
      const dpr = 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uResolution) gl.uniform2f(uResolution, canvas.width, canvas.height);
      if (uAspect) gl.uniform1f(uAspect, canvas.width / canvas.height);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement ?? canvas);

    const start = performance.now();
    function frame(now: number) {
      if (!mountedRef.current || !gl) return;
      const t = (now - start) / 1000;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      if (uTime) gl.uniform1f(uTime, t);
      if (uSeed) gl.uniform1f(uSeed, seed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      try {
        gl.deleteBuffer(posBuffer);
        gl.deleteProgram(program);
      } catch {}
    };
  }, [seed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        filter: "blur(36px) saturate(1.15)",
        transform: "scale(1.50)",
        pointerEvents: "none",
        display: "block",
      }}
      aria-hidden
    />
  );
}

/* ---------------------------
   -- Page component (split login) --
   --------------------------- */
export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [forgotStep, setForgotStep] = useState<"email" | "question" | "reset">(
    "email"
  );
const [fadeOutLogin, setFadeOutLogin] = useState(false);

  const [collapseAnim, setCollapseAnim] = useState(false);
const [modeTransition, setModeTransition] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const interactiveRef = useRef<HTMLDivElement | null>(null);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const [forgotData, setForgotData] = useState({
    email: "",
    securityQuestion: "",
    securityAnswer: "",
    newPassword: "",
    confirmNewPassword: "",
    userId: "",
  });

  useEffect(() => {
    const inter = interactiveRef.current;
    if (!inter) return;
    let curX = 0,
      curY = 0,
      tgX = 0,
      tgY = 0,
      raf = 0;
    const move = () => {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      inter.style.transform = `translate(${Math.round(curX)}px, ${Math.round(
        curY
      )}px)`;
      raf = requestAnimationFrame(move);
    };
    const onMove = (e: MouseEvent) => {
      tgX = e.clientX;
      tgY = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    move();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword)
          throw new Error("Passwords do not match");
        if (!formData.securityQuestion || !formData.securityAnswer)
          throw new Error("Please pick and answer a security question");
      }
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: mode === "signup" ? formData.username : undefined,
          securityQuestion:
            mode === "signup" ? formData.securityQuestion : undefined,
          securityAnswer:
            mode === "signup" ? formData.securityAnswer : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Authentication failed");
      if (mode === "signup") {
        setShowSignupSuccess(true);
        setLoading(false);
        return;
      }
      const redirectPath = data.redirectTo || "/";
   // Start collapse animation
// Start collapse animation
setCollapseAnim(true);

// Fade the login box (right side)
setTimeout(() => {
  setFadeOutLogin(true);
}, 300);

// Redirect after fade animation finishes
setTimeout(() => {
  router.push(redirectPath);
  router.refresh();
}, 900);


} catch (err) {
  setError(err instanceof Error ? err.message : "An error occurred");
} finally {
  setLoading(false);
}

  };

  const handleForgotPassword = async () => {
    setError("");
    setLoading(true);
    try {
      if (forgotStep === "email") {
        const res = await fetch("/api/auth/security-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotData.email }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to get security question");
        setForgotData((d) => ({
          ...d,
          securityQuestion: data.securityQuestion,
        }));
        setForgotStep("question");
      } else if (forgotStep === "question") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotData.email,
            securityAnswer: forgotData.securityAnswer,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Incorrect answer");
        setForgotData((d) => ({ ...d, userId: data.userId }));
        setForgotStep("reset");
      } else if (forgotStep === "reset") {
        if (forgotData.newPassword !== forgotData.confirmNewPassword)
          throw new Error("Passwords do not match");
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: forgotData.userId,
            newPassword: forgotData.newPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to reset password");
        alert(
          "Password reset successfully! Please login with your new password."
        );
        setMode("login");
        setForgotStep("email");
        setForgotData({
          email: "",
          securityQuestion: "",
          securityAnswer: "",
          newPassword: "",
          confirmNewPassword: "",
          userId: "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: "Ruigslay";
          src: url("/fonts/ruigslay.regular.otf") format("opentype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `}</style>

      <div className="min-h-screen flex bg-white overflow-hidden">

        <aside
  className={`
    hidden lg:flex relative overflow-hidden transition-all duration-700 ease-in-out
    ${collapseAnim ? "lg:w-0 opacity-0" : "lg:w-1/2 opacity-100"}
  `}
>

          {/* FULLSCREEN WATER ANIMATION */}
          <div className="absolute inset-0 z-0">
            <WaterGLBackground seed={12345} />
          </div>

          {/* LEFT SIDE CONTENT */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
            <div>


              <p className={`text-sm opacity-40 max-w-md ${poppins.className}`}>
                AI-powered document search with intelligence <br />
                fast, private and smart.
              </p>
            </div>
            <div
  className="w-full text-center mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
  <h1 className={`text-2xl lg:text-2xl text-left font-bold text-white leading-snug ${poppins.className}`}>
    Supercharge your workflow with AI-powered document intelligence
  </h1>

  <p className={`text-white/40 text-sm text-left lg:text-base mt-3 ${poppins.className}`}>
    Experience an AI-driven platform that transforms document chaos into <br /> meaningful insights and fast discovery.
  </p>
</div>

          </div>
        </aside>

        <main
  className={`
    flex-1 flex items-center justify-center px-6 py-0 h-screen
    transition-all duration-700 ease-in-out
    ${collapseAnim ? "lg:w-full" : "lg:w-1/2"}
  `}
>




         <div className="w-full h-full flex items-center justify-center">

  <div className="w-full max-w-md">


            {showSignupSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-white/5 border border-white/20 p-6 rounded-2xl text-center max-w-xs">
                  <div className="text-green-400 text-4xl mb-3">✓</div>
                  <h3 className="text-white text-lg font-semibold mb-2">
                    Account Created!
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    Your account has been created successfully. Please log in to
                    continue.
                  </p>
                  <button
                    onClick={() => {
                      setShowSignupSuccess(false);
                      setMode("login");
                      setFormData({
                        email: "",
                        password: "",
                        username: "",
                        confirmPassword: "",
                        securityQuestion: "",
                        securityAnswer: "",
                      });
                    }}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}

            <div
  className={`
    bg-white rounded-2xl p-8 flex flex-col justify-center
    transition-all duration-500
    ${fadeOutLogin ? "opacity-0 scale-95" : "opacity-100 scale-100"}
  `}
>


              <div className="text-center">

                <h1
                  className="text-4xl font-bold mb-8 text-center"
                  style={{ fontFamily: "Ruigslay", letterSpacing: "1px" }}
                >
                  docQuest.ai
                </h1>

                <p className="text-sm text-gray-500">
                  {mode === "login"
                    ? "Please sign in to continue"
                    : mode === "signup"
                    ? "Create your account"
                    : "Reset your password"}
                </p>
              </div>

             <div className="space-y-4">


                {mode !== "forgot" ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            required={mode === "signup"}
                            value={formData.username}
                            onChange={(e) =>
                              setFormData((s) => ({
                                ...s,
                                username: e.target.value,
                              }))
                            }
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            placeholder="Your username"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              email: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          required
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              password: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                          placeholder="••••••"
                          minLength={6}
                        />
                      </div>
                    </div>

                    {mode === "signup" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              required
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                setFormData((s) => ({
                                  ...s,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className="w-full pl-10 pr-4 py-2 border rounded-lg"
                              placeholder="••••••"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Security Question
                          </label>
                          <div className="relative">
                            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                              required
                              value={formData.securityQuestion}
                              onChange={(e) =>
                                setFormData((s) => ({
                                  ...s,
                                  securityQuestion: e.target.value,
                                }))
                              }
                              className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            >
                              <option value="">Select a question...</option>
                              {SECURITY_QUESTIONS.map((q, i) => (
                                <option key={i} value={q}>
                                  {q}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Security Answer
                          </label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              required
                              type="text"
                              value={formData.securityAnswer}
                              onChange={(e) =>
                                setFormData((s) => ({
                                  ...s,
                                  securityAnswer: e.target.value,
                                }))
                              }
                              className="w-full pl-10 pr-4 py-2 border rounded-lg"
                              placeholder="Your answer"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Used to recover your account if you forget your
                            password
                          </p>
                        </div>
                      </>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {mode === "login"
                            ? "Signing in..."
                            : "Creating account..."}
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          {mode === "login" ? "Sign In" : "Create Account"}
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-sm mt-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" /> Remember me
                      </label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot");
                            setForgotStep("email");
                          }}
                          className="text-blue-600"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div
  className={`
    space-y-4 transition-all duration-500 ease-in-out
    ${modeTransition ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}
  `}
>

                    <button
                      onClick={() => {
                        setMode("login");
                        setForgotStep("email");
                        setError("");
                      }}
                      className="text-sm text-gray-600 mb-2"
                    >
                      ← Back to login
                    </button>
                    <h3 className="text-lg font-semibold">
                      {" "}
                      {forgotStep === "email"
                        ? "Enter Your Email"
                        : forgotStep === "question"
                        ? "Answer Security Question"
                        : "Reset Password"}
                    </h3>

                    {forgotStep === "email" && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          value={forgotData.email}
                          onChange={(e) =>
                            setForgotData((d) => ({
                              ...d,
                              email: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="you@example.com"
                        />
                      </div>
                    )}

                    {forgotStep === "question" && (
                      <>
                        <div className="bg-gray-100 p-3 rounded">
                          {forgotData.securityQuestion}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Your Answer
                          </label>
                          <input
                            value={forgotData.securityAnswer}
                            onChange={(e) =>
                              setForgotData((d) => ({
                                ...d,
                                securityAnswer: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Answer"
                          />
                        </div>
                      </>
                    )}

                    {forgotStep === "reset" && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            value={forgotData.newPassword}
                            onChange={(e) =>
                              setForgotData((d) => ({
                                ...d,
                                newPassword: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            type="password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            value={forgotData.confirmNewPassword}
                            onChange={(e) =>
                              setForgotData((d) => ({
                                ...d,
                                confirmNewPassword: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            type="password"
                          />
                        </div>
                      </>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : forgotStep === "reset" ? (
                        "Reset Password"
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </div>
                )}

                <div className="text-center text-sm text-gray-500 mt-3">
                  Dont have an account?{" "}
                  <button
                    className="text-blue-600"
                    onClick={() => {
  setModeTransition(true);

  setTimeout(() => {
    if (mode === "login") {
      setMode("signup");
    } else if (mode === "signup") {
      setMode("login");
    } else {
      setMode("login"); // forgot mode → login
    }
    setModeTransition(false);
  }, 300);
}}

                  >
                    {mode === "signup" ? "Sign In" : "Sign Up"}
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                AI-powered document management © 2024
              </p>
            </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
