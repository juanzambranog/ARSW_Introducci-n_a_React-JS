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

    // 1. Asignar color único por sesión
    @GetMapping("/mycolor")
    public Map<String, String> myColor(HttpSession session) {
        String color = (String) session.getAttribute("color");
        if (color == null) {
            color = randomColor();
            session.setAttribute("color", color);
        }
        return Collections.singletonMap("color", color);
    }

    // 2. Estado del tablero
    @GetMapping("/state")
    public Map<String, Object> state() {
        Map<String, Object> res = new HashMap<>();
        res.put("strokes", strokes);
        res.put("clearedAt", clearedAt);
        return res;
    }

    // 3. Agregar un trazo
    @PostMapping("/stroke")
    public Map<String, Long> addStroke(@RequestBody Stroke s) {
        s.id = nextId.getAndIncrement();
        strokes.add(s);
        return Collections.singletonMap("id", s.id);
    }

    // 4. Borrar el tablero globalmente
    @PostMapping("/clear")
    public void clearBoard() {
        strokes.clear();
        clearedAt = System.currentTimeMillis();
    }

    private String randomColor() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        return String.format("#%02x%02x%02x", r.nextInt(256), r.nextInt(256), r.nextInt(256));
    }

    // --- Clases auxiliares para serialización JSON ---
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
