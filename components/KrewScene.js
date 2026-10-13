"use client";

import { useEffect, useRef } from "react";

// A small 3D scene: a glossy "problem" gem in the middle with teammates orbiting it,
// each linked back by a line. It follows the mouse, pauses when off screen, and
// stays still for people who prefer reduced motion. three.js loads only on the client.
export default function KrewScene({ variant = "light", className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      } catch {
        return; // No WebGL: the page still works, just without the scene.
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.domElement.setAttribute("aria-hidden", "true");
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0.4, 9);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x2a0e4f, 1.6));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(4, 6, 6);
      scene.add(key);
      const limeLight = new THREE.PointLight(0xb6ff3b, 30, 20);
      limeLight.position.set(-4, 2, 3);
      scene.add(limeLight);
      const cyanLight = new THREE.PointLight(0x0be8f0, 26, 20);
      cyanLight.position.set(4, -3, 2);
      scene.add(cyanLight);

      const world = new THREE.Group();
      scene.add(world);

      // The problem: a faceted gem.
      const gem = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.15, 0),
        new THREE.MeshPhysicalMaterial({
          color: variant === "dark" ? 0x6b3fc4 : 0x2a0e4f,
          roughness: 0.18,
          metalness: 0.15,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          flatShading: true,
        })
      );
      world.add(gem);

      // A glowing ring around it.
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.75, 0.045, 16, 120),
        new THREE.MeshStandardMaterial({ color: 0xb6ff3b, emissive: 0xb6ff3b, emissiveIntensity: 0.8 })
      );
      ring.rotation.x = Math.PI / 2.4;
      world.add(ring);

      // Teammates orbiting the problem.
      const colors = [0xb6ff3b, 0x0be8f0, 0xff7a1a, 0xffffff, 0xc4a3ff, 0xb6ff3b];
      const lineColor = variant === "dark" ? 0xffffff : 0x2a0e4f;
      const people = colors.map((color, i) => {
        const node = new THREE.Group();
        const material = new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, clearcoat: 0.8 });
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), material);
        head.position.y = 0.3;
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.18, 8, 24), material);
        body.position.y = -0.05;
        node.add(head, body);
        world.add(node);

        const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.28 })
        );
        world.add(line);

        return {
          node,
          line,
          radius: 2.5 + (i % 3) * 0.45,
          speed: 0.18 + (i % 4) * 0.05,
          tilt: (i / colors.length) * Math.PI,
          phase: (i / colors.length) * Math.PI * 2,
        };
      });

      // A few floating blocks for depth.
      const blocks = [
        [-3.2, 1.8, -1.5, 0xb6ff3b, 0.45],
        [3.1, 2.1, -2, 0x0be8f0, 0.32],
        [2.9, -2.2, -1, 0xff7a1a, 0.38],
        [-2.7, -2.1, -2.5, 0xffffff, 0.3],
      ].map(([x, y, z, color, s]) => {
        const block = new THREE.Mesh(
          new THREE.BoxGeometry(s, s, s),
          new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 0.6 })
        );
        block.position.set(x, y, z);
        block.userData.base = y;
        scene.add(block);
        return block;
      });

      const pointer = { x: 0, y: 0 };
      function onPointer(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      }
      window.addEventListener("pointermove", onPointer, { passive: true });

      function resize() {
        const { width, height } = mount.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      const resizer = new ResizeObserver(resize);
      resizer.observe(mount);
      resize();

      const clock = new THREE.Clock();
      function draw(t) {
        gem.rotation.y = t * 0.35;
        gem.rotation.x = Math.sin(t * 0.4) * 0.25;
        ring.rotation.z = t * 0.2;

        people.forEach((p) => {
          const a = t * p.speed + p.phase;
          const x = Math.cos(a) * p.radius;
          const z = Math.sin(a) * p.radius;
          p.node.position.set(x, Math.sin(a) * Math.sin(p.tilt) * 1.2, z * 0.6);
          p.node.rotation.y = -a;
          const pos = p.line.geometry.attributes.position;
          pos.setXYZ(1, p.node.position.x, p.node.position.y, p.node.position.z);
          pos.needsUpdate = true;
        });

        blocks.forEach((b, i) => {
          b.rotation.x = t * (0.3 + i * 0.05);
          b.rotation.y = t * (0.4 + i * 0.07);
          b.position.y = b.userData.base + Math.sin(t + i) * 0.15;
        });

        world.rotation.y += (pointer.x * 0.5 - world.rotation.y) * 0.05;
        world.rotation.x += (pointer.y * 0.25 - world.rotation.x) * 0.05;
        renderer.render(scene, camera);
      }

      let frame = 0;
      let visible = true;
      function loop() {
        frame = requestAnimationFrame(loop);
        if (visible && !document.hidden) draw(clock.getElapsedTime());
      }

      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      observer.observe(mount);

      if (reduceMotion) draw(1.2);
      else loop();
      mount.dataset.ready = "true";

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        resizer.disconnect();
        window.removeEventListener("pointermove", onPointer);
        scene.traverse((obj) => {
          obj.geometry?.dispose();
          obj.material?.dispose?.();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [variant]);

  return <div ref={mountRef} className={`pointer-events-none [&>canvas]:h-full [&>canvas]:w-full ${className}`} />;
}
