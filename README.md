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

