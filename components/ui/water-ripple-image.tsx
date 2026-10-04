"use client";

import { useEffect, useRef } from "react";

type WaterRippleImageProps = {
  src: string;
  className?: string;
};

const vertexShader = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentShader = `
precision mediump float;
uniform sampler2D image;
uniform float time;
uniform vec2 resolution;
uniform vec2 imageResolution;
varying vec2 uv;

void main() {
  vec2 ratio = vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );
  vec2 coverUv = vec2(uv.x * ratio.x + (1.0 - ratio.x) * 0.5, uv.y * ratio.y + (1.0 - ratio.y) * 0.5);
  float wave = sin(coverUv.y * 12.0 + time * 0.00045) * 0.0025 + sin(coverUv.x * 17.0 - time * 0.00035) * 0.002;
  vec2 ripple = vec2(wave, sin(coverUv.x * 14.0 + time * 0.0004) * 0.002);
  vec4 color = texture2D(image, coverUv + ripple);
  float light = 0.035 * sin((coverUv.x + coverUv.y) * 18.0 + time * 0.0003);
  gl_FragColor = vec4(color.rgb + light, color.a);
}
`;

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const result = gl.createShader(type);
  if (!result) throw new Error("Could not create shader.");
  gl.shaderSource(result, source);
  gl.compileShader(result);
  if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(result) || "Could not compile shader.");
  return result;
}

export default function WaterRippleImage({ src, className = "" }: WaterRippleImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, vertexShader));
    gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, fragmentShader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const upload = () => {
      if (!image.naturalWidth) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    if (image.complete) upload(); else image.addEventListener("load", upload);

    const time = gl.getUniformLocation(program, "time");
    const resolution = gl.getUniformLocation(program, "resolution");
    const imageResolution = gl.getUniformLocation(program, "imageResolution");
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(imageResolution, image.naturalWidth || 1, image.naturalHeight || 1);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    let frame = 0;
    const render = (now: number) => {
      gl.uniform1f(time, now);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      image.removeEventListener("load", upload);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <div className={`water-ripple-image ${className}`} aria-hidden="true"><img ref={imageRef} src={src} alt="" /><canvas ref={canvasRef} /></div>;
}
