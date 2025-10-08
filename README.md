### Escuela Colombiana de Ingeniería
### Arquiecturas de Software

---

### Juan David Zambrano Gonzalez

---

## Construccion de un tablero interactivo que permita a múltiples usuarios dibujar en un tablero compartido.


1. Crear una aplicación java básica usando maven.

![alt text](/img/image.png)
![alt text](/img/image-1.png)


2. Actualizar el pom para utilizar la configuración web-MVC de spring boot. Incluya
lo siguiente en su pom.

![alt text](/img/image-2.png)

3. Cree la siguiente clase que iniciará el servidor de aplicaciones de Spring con la
configuración mínima Web-MVC.
![alt text](/img/image-4.png)

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@SpringBootApplication
@RestController
public class WebSiteController {
    public static void main(String[] args) {
    SpringApplication.run(WebSiteController.class, args);
    }
    @GetMapping("/status")
    public String status() {
        return "{\"status\":\"Greetings from Spring Boot. " +
        java.time.LocalDate.now() + ", " +
        java.time.LocalTime.now() +
        ". " + "The server is Runnig!\"}";
    }
}
```

4. Cree un index html en la siguiente localización: /src/main/resources/static
![alt text](/img/image-3.png)


5. Corra la clase que acabamos de crear y su servidor debe iniciar la ejecución
![alt text](/img/image-7.png)
![alt text](/img/image-6.png)

6. Verifique que se esté ejecutando accediendo a: localhost:8080/status
![alt text](/img/image-5.png)

7. Verifique que el servidor esté entregando elementos estáticos web entrando a: localhost/index.html
![alt text](/img/image-8.png)


## WHITEBOARD

> ### WhiteboardController
>Es el controlador principal del tablero colaborativo:
coordina los trazos, colores y actualizaciones entre todos los usuarios conectados.

```js
    package edu.eci.arsw;

    import org.springframework.web.bind.annotation.*;

    import javax.servlet.http.HttpSession;
    import java.util.*;
    import java.util.concurrent.atomic.AtomicLong;
    import java.util.concurrent.ThreadLocalRandom;

    @RestController
    @RequestMapping("/api")
    public class WhiteboardController {

        private final List<Stroke> strokes = Collections.synchronizedList(new ArrayList<>());
        private final AtomicLong nextId = new AtomicLong(1);
        private volatile long clearedAt = 0;

        //Asignar color único por sesión
        @GetMapping("/mycolor")
        public Map<String, String> myColor(HttpSession session) {
            String color = (String) session.getAttribute("color");
            if (color == null) {
                color = randomColor();
                session.setAttribute("color", color);
            }
            return Collections.singletonMap("color", color);
        }

        //Estado del tablero
        @GetMapping("/state")
        public Map<String, Object> state() {
            Map<String, Object> res = new HashMap<>();
            res.put("strokes", strokes);
            res.put("clearedAt", clearedAt);
            return res;
        }

        //Agregar un trazo
        @PostMapping("/stroke")
        public Map<String, Long> addStroke(@RequestBody Stroke s) {
            s.id = nextId.getAndIncrement();
            strokes.add(s);
            return Collections.singletonMap("id", s.id);
        }

        //Borrar el tablero globalmente
        @PostMapping("/clear")
        public void clearBoard() {
            strokes.clear();
            clearedAt = System.currentTimeMillis();
        }

        private String randomColor() {
            ThreadLocalRandom r = ThreadLocalRandom.current();
            return String.format("#%02x%02x%02x", r.nextInt(256), r.nextInt(256), r.nextInt(256));
        }

        public static class Stroke {
            public long id;
            public String color;
            public List<Point> points;
        }

        public static class Point {
            public int x;
            public int y;
        }
    }

```


> ### sketch.js
>El archivo sketch.js implementa el cliente gráfico del tablero colaborativo usando la librería p5.js.
Su objetivo es permitir que cada usuario dibuje en la pantalla, enviar los trazos al servidor y recibir actualizaciones periódicas del estado compartido del tablero.

- Permite dibujar trazos con el mouse.

- Comunica los trazos nuevos al servidor.

- Recibe y redibuja los trazos de todos los usuarios conectados.

- Sincroniza periódicamente el tablero y gestiona el borrado global.

```js
    let myColor = '#000';
    let strokes = [];
    let currentStroke = null;
    let clearedAt = 0;

    function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
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

```

> ### index.html
>El archivo index.html define la estructura básica de la página web del tablero colaborativo.
>Incluye referencias a la librería p5.js para el dibujo y al archivo sketch.js que contiene la lógica del cliente.
> Proporciona un botón para borrar el tablero y un área para mostrar el color asignado al usuario.

```html
    <!doctype html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>Tablero Compartido</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; }
        #controls { margin-bottom: 10px; }
    </style>
    </head>
    <body>
    <h1>Whiteboard</h1>

    <div id="controls">
        <button id="clearBtn">Borrar tablero</button>
        <span id="info">Asignando color...</span>
    </div>
    <div id="canvasHolder"></div>
    <script src="js/sketch.js"></script>
    </body>
    </html>

```


> ## **Pruebas** 

>Se realizan pruebas de funcionalidad en local: [local](http://localhost:8080/index.html) 

>Probamos con un navegador normal y otro en incognito para tener usuarios diferentes.

![alt text](/img/image-9.png)
![alt text](/img/image-10.png)

![alt text](/img/image-11.png)
![alt text](/img/image-12.png)

> # Despliegue 
> Desplegamos con un App Service en Azure Devops 
> Despliegue: [WHITEBOARD](whiteboard-engtfrg6e0axejfv.westeurope-01.azurewebsites.net)

![alt text](/img/image-13.png)
![alt text](/img/image-14.png)

