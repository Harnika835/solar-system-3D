const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");

window.addEventListener("mousemove", (event) => {
  // Convert mouse to normalized coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    tooltip.style.display = "block";
    tooltip.style.left = event.clientX + 10 + "px";
    tooltip.style.top = event.clientY + 10 + "px";
    tooltip.textContent = planet.userData.name;
  } else {
    tooltip.style.display = "none";
  }
});
window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    const target = intersects[0].object;
    // Animate camera zoom toward the planet
    const targetPos = target.position.clone();
    const camPos = camera.position.clone();
    const direction = targetPos.clone().sub(camPos).normalize();

    const distance = camPos.distanceTo(targetPos);
    const newCamPos = targetPos.clone().add(direction.clone().negate().multiplyScalar(10));

    let step = 0;
    const steps = 60;

    function animateZoom() {
      if (step < steps) {
        camera.position.lerp(newCamPos, 0.1);
        camera.lookAt(target.position);
        step++;
        requestAnimationFrame(animateZoom);
      }
    }

    animateZoom();
  }
});



// Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

function addStars(count = 1000) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000
    );
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({ color: 0xffffff });
  const starField = new THREE.Points(geometry, material);

  scene.add(starField);
}
addStars();


// Light from Sun
const sunlight = new THREE.PointLight(0xffffff, 2, 1000);
scene.add(sunlight);

const planetData = [
  { name: "Mercury", radius: 0.5, distance: 10, color: 0xaaaaaa, speed: 0.02 },
  { name: "Venus", radius: 0.9, distance: 14, color: 0xffcc66, speed: 0.015 },
  { name: "Earth", radius: 1, distance: 18, color: 0x3399ff, speed: 0.012 },
  { name: "Mars", radius: 0.7, distance: 22, color: 0xff3300, speed: 0.01 },
  { name: "Jupiter", radius: 2, distance: 28, color: 0xff9966, speed: 0.008 },
  { name: "Saturn", radius: 1.8, distance: 34, color: 0xffff66, speed: 0.006 },
  { name: "Uranus", radius: 1.4, distance: 40, color: 0x66ffff, speed: 0.004 },
  { name: "Neptune", radius: 1.3, distance: 46, color: 0x3366ff, speed: 0.003 },
];

const planets = [];

planetData.forEach(data => {
  const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: data.color });
  const planet = new THREE.Mesh(geometry, material);
  
  planet.userData = {
    ...data,
    angle: 0
  };

  scene.add(planet);
  planets.push(planet);

  // Slider control
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "0.05";
  slider.step = "0.001";
  slider.value = data.speed;
  slider.addEventListener("input", (e) => {
    planet.userData.speed = parseFloat(e.target.value);
  });

  const label = document.createElement("label");
  label.textContent = data.name + ": ";
  label.appendChild(slider);
  document.getElementById("controls").appendChild(label);
  document.getElementById("controls").appendChild(document.createElement("br"));
});
camera.position.z = 70;

let isPaused = false;

function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach(p => {
      p.userData.angle += p.userData.speed;
      p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
      p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
    });
  }

  renderer.render(scene, camera);
}

animate();

document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").textContent = isPaused ? "Resume" : "Pause";
});
