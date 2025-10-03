let myColor = '#000';
let strokes = [];
let currentStroke = null;
let clearedAt = 0;

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent('canvasHolder');
  background(255);

  // pedir color de sesión
  fetch('/api/mycolor')
    .then(r => r.json())
    .then(j => {
      myColor = j.color;
      document.getElementById('info').innerText = 'Tu color: ' + myColor;
    });

  // primer fetch y polling cada 1s
  fetchState();
  setInterval(fetchState, 1000);

  document.getElementById('clearBtn').addEventListener('click', () => {
    fetch('/api/clear', { method: 'POST' }).then(() => {
      strokes = [];
      background(255);
    });
  });
}

function draw() {
  background(255);

  // dibujar trazos confirmados
  for (let s of strokes) {
    stroke(s.color);
    strokeWeight(10);
    noFill();
    beginShape();
    if (s.points) {
      for (let p of s.points) vertex(p.x, p.y);
    }
    endShape();
  }

  // dibujar trazo en curso
  if (currentStroke) {
    stroke(currentStroke.color);
    strokeWeight(10);
    noFill();
    beginShape();
    for (let p of currentStroke.points) vertex(p.x, p.y);
    endShape();
  }
}

function mousePressed() {
  if (mouseY < 0 || mouseY > height) return;
  currentStroke = { color: myColor, points: [{ x: mouseX, y: mouseY }] };
}

function mouseDragged() {
  if (currentStroke) currentStroke.points.push({ x: mouseX, y: mouseY });
}

function mouseReleased() {
  if (!currentStroke) return;
  fetch('/api/stroke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentStroke)
  })
  .then(r => r.json())
  .then(res => {
    currentStroke.id = res.id;
    strokes.push(currentStroke);
    currentStroke = null;
  });
}

function fetchState() {
  fetch('/api/state')
    .then(r => r.json())
    .then(j => {
      if (j.clearedAt && j.clearedAt > clearedAt) {
        clearedAt = j.clearedAt;
        strokes = [];
        background(255);
      }
      strokes = j.strokes || [];
    });
}
