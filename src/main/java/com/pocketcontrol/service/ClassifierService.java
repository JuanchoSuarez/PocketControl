package com.pocketcontrol.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Servicio de clasificación automática de gastos.
 *
 * Estrategia mejorada:
 * 1. Normaliza el texto (tildes, mayúsculas, abreviaciones conocidas).
 * 2. Tokeniza en palabras individuales y frases bi-gram.
 * 3. Usa un sistema de PUNTOS por categoría — cada coincidencia suma puntos.
 *    Las frases exactas valen más que palabras sueltas.
 * 4. La categoría con más puntos gana.
 * 5. Empates se resuelven con el orden de prioridad definido.
 */
@Service
public class ClassifierService {

    // --- Expansión de abreviaciones comunes ---
    private static final Map<String, String> ABBREVIATIONS = new LinkedHashMap<>();

    // --- Reglas de puntos: cada entrada es (patrón, categoría, puntos) ---
    private static final List<ScoringRule> RULES = new ArrayList<>();

    // --- Iconos por categoría ---
    private static final Map<String, String> CATEGORY_ICONS = new LinkedHashMap<>();

    static {
        // ==============================================================
        // ABREVIACIONES Y NORMALIZACIONES COLOMBIANAS
        // ==============================================================
        ABBREVIATIONS.put("\\btm\\b", "transmilenio");
        ABBREVIATIONS.put("\\btransmi\\b", "transmilenio");
        ABBREVIATIONS.put("\\bsitp\\b", "bus");
        ABBREVIATIONS.put("\\bmio\\b", "bus mio");          // MIO = bus de Cali
        ABBREVIATIONS.put("\\bq\\b", "que");
        ABBREVIATIONS.put("\\bxq\\b", "porque");
        ABBREVIATIONS.put("\\bpq\\b", "porque");
        ABBREVIATIONS.put("\\bpza\\b", "pizza");
        ABBREVIATIONS.put("\\bmcd\\b", "mcdonalds");
        ABBREVIATIONS.put("\\bkfc\\b", "kfc pollo");
        ABBREVIATIONS.put("\\brappi\\b", "rappi domicilio");
        ABBREVIATIONS.put("\\bifood\\b", "ifood domicilio");
        ABBREVIATIONS.put("\\bubi\\b", "uber");
        ABBREVIATIONS.put("\\bpeti\\b", "gasolina");
        ABBREVIATIONS.put("\\bcomb\\b", "combustible gasolina");
        ABBREVIATIONS.put("\\bparking\\b", "parqueadero");
        ABBREVIATIONS.put("\\bgym\\b", "gimnasio");
        ABBREVIATIONS.put("\\bnet\\b", "netflix");
        ABBREVIATIONS.put("\\bspo\\b", "spotify");
        ABBREVIATIONS.put("\\bdis\\b", "disney");
        ABBREVIATIONS.put("\\bhbo\\b", "hbo streaming");
        ABBREVIATIONS.put("\\buni\\b", "universidad");
        ABBREVIATIONS.put("\\bplatz\\b", "platzi");
        ABBREVIATIONS.put("\\bdroguer\\b", "droguería farmacia");
        ABBREVIATIONS.put("\\bfarma\\b", "farmacia");
        ABBREVIATIONS.put("\\bmed\\b", "medicina medicamento");
        ABBREVIATIONS.put("\\beps\\b", "eps salud");
        ABBREVIATIONS.put("\\bipa\\b", "cerveza");
        ABBREVIATIONS.put("\\bpils\\b", "cerveza");
        ABBREVIATIONS.put("\\bfrio\\b", "cerveza");

        // ==============================================================
        // REGLAS CON PUNTOS — frases exactas valen más
        // Formato: addRule(patrón_regex, categoría, puntos)
        //   - 3 puntos: marca/frase muy específica (mcdonalds, transmilenio)
        //   - 2 puntos: palabra clave fuerte (almuerzo, gasolina, netflix)
        //   - 1 punto:  palabra de contexto débil (comida, bus, suscripcion)
        // ==============================================================

        // ---- RESTAURANTES / COMIDA ----
        // Marcas muy específicas (3 pts)
        rule("mcdonalds|mcdonald's", "Restaurantes", 3);
        rule("burger king", "Restaurantes", 3);
        rule("subway subs?", "Restaurantes", 3);
        rule("kfc pollo|kentucky", "Restaurantes", 3);
        rule("frisby", "Restaurantes", 3);
        rule("presto", "Restaurantes", 3);
        rule("crepes \\w+ waffles|crepes and waffles", "Restaurantes", 3);
        rule("el corral", "Restaurantes", 3);
        rule("domino's|dominos", "Restaurantes", 3);
        rule("pizza hut", "Restaurantes", 3);
        rule("wendy's|wendys", "Restaurantes", 3);
        rule("rappi domicilio|ifood domicilio|domicilio comida", "Restaurantes", 3);
        rule("corrientazo|ejecutivo|bandeja paisa|ajiaco|sancocho", "Restaurantes", 3);
        rule("salchipapa|buñuelo|pandebono|changua|obleas", "Restaurantes", 3);
        rule("tinto|aguapanela|limonada|aromática", "Restaurantes", 3);
        rule("sushi|ramen|tacos|burritos|shawarma|falafe", "Restaurantes", 3);
        // Palabras clave claras (2 pts)
        rule("almuerzo|desayuno|cena|onces|merienda", "Restaurantes", 2);
        rule("restaurante|cafetería|cafeteria|comedor|fritanga", "Restaurantes", 2);
        rule("pizza|hamburguesa|burger|perro caliente|hot dog", "Restaurantes", 2);
        rule("café|cafe|cappuccino|latte|americano|espresso", "Restaurantes", 2);
        rule("helado|postre|torta|pastel|ponqué|ponque", "Restaurantes", 2);
        rule("empanada|arepa|tamal|aborrajado|patacón|patacon", "Restaurantes", 2);
        rule("jugo|gaseosa|bebida|limonada|smoothie|batido", "Restaurantes", 2);
        rule("almuercito|comidita|comienzo|rapidito", "Restaurantes", 2);
        // Contexto débil (1 pt)
        rule("comida|comer|alimento|snack|galleta|dulce|chocolate", "Restaurantes", 1);
        rule("pan|panadería|panaderia|repostería", "Restaurantes", 1);
        rule("asado|bbq|parrilla|carne|pollo asado", "Restaurantes", 1);
        rule("domicilio|pedido|entregar|delivery", "Restaurantes", 1);
        rule("cerveza|trago|ron|aguardiente|whisky|coctel|cóctel", "Restaurantes", 1);

        // ---- TRANSPORTE ----
        // Muy específicos (3 pts)
        rule("transmilenio|trans[- ]?milenio", "Restaurantes", -1); // trampa: ya está en restaurantes por merge — quitar
        rule("transmilenio|transmilen", "Supermercado y Hogar", -1);
        // Corrección: transporte como categoría separada sería ideal, 
        // pero el usuario los fusionó. Poner en Restaurantes no tiene sentido.
        // => Usar Misceláneos para transporte. Redefinir:
        rule("transmilenio|transmilen|sitp|bus mio", "Misceláneos", 3);
        rule("uber|didi|cabify|indriver|indrive|picap|beat", "Misceláneos", 3);
        rule("taxi|taxista|taxis", "Misceláneos", 2);
        rule("bus|buseta|colectivo|flota|terminal buses", "Misceláneos", 2);
        rule("gasolina|combustible|tanqueo|diesel", "Misceláneos", 2);
        rule("parqueadero|estacionamiento", "Misceláneos", 2);
        rule("peaje|autopista", "Misceláneos", 2);
        rule("vuelo|aérea|tiquete avión|avianca|latam|viva air|wingo", "Misceláneos", 3);
        rule("pasaje|tiquete transporte|boleto", "Misceláneos", 1);
        rule("bicicleta|patineta|scooter|bici", "Misceláneos", 2);
        rule("metro|mio bus|megabus", "Misceláneos", 2);

        // ---- SUPERMERCADO Y HOGAR ----
        // Marcas de supermercados muy específicas (3 pts)
        rule("éxito|exito supermercado|grupo éxito", "Supermercado y Hogar", 3);
        rule("jumbo colombia|jumbo super", "Supermercado y Hogar", 3);
        rule("carulla", "Supermercado y Hogar", 3);
        rule("d1|tienda d1", "Supermercado y Hogar", 3);
        rule("ara supermercado|tienda ara", "Supermercado y Hogar", 3);
        rule("olimpica|olímpica|surtimax|surtifresco", "Supermercado y Hogar", 3);
        rule("alkosto|metro mayor|zapatoca", "Supermercado y Hogar", 3);
        rule("makro|pricesmart|costco|sam's club", "Supermercado y Hogar", 3);
        rule("éxito express|carulla express", "Supermercado y Hogar", 3);
        // Artículos del hogar (2 pts)
        rule("mercado|supermercado|compras de mercado|mercadito", "Supermercado y Hogar", 2);
        rule("arriendo|alquiler|renta apartamento|renta habitación", "Supermercado y Hogar", 2);
        rule("servicios públicos|servicio de agua|servicio de luz|recibo luz|recibo agua", "Supermercado y Hogar", 2);
        rule("internet banda|plan de internet|wifi|fibra óptica", "Supermercado y Hogar", 2);
        rule("gas natural|recibo de gas", "Supermercado y Hogar", 2);
        rule("detergente|jabón ropa|suavizante|blanqueador", "Supermercado y Hogar", 2);
        rule("shampoo|acondicionador|gel|crema de peinar", "Supermercado y Hogar", 2);
        rule("papel higiénico|toalla|pañuelo|servilletas", "Supermercado y Hogar", 2);
        rule("nevera|lavadora|estufa|cocina eléctrica|televisor|tv", "Supermercado y Hogar", 2);
        rule("mueble|silla|mesa|cama|colchón|colchon", "Supermercado y Hogar", 2);
        // Contexto débil (1 pt)
        rule("frutas|verduras|leche|huevos|mantequilla|queso|aceite", "Supermercado y Hogar", 1);
        rule("tienda|abastecimiento|viveres|víveres|despensa", "Supermercado y Hogar", 1);
        rule("aseo|limpieza|escoba|trapeador|trapero|desengrasante", "Supermercado y Hogar", 1);
        rule("hogar|casa|habitación|habitacion|apartamento|apt", "Supermercado y Hogar", 1);

        // ---- ENTRETENIMIENTO Y SUSCRIPCIONES ----
        // Plataformas muy específicas (3 pts)
        rule("netflix", "Entretenimiento y Suscripciones", 3);
        rule("spotify", "Entretenimiento y Suscripciones", 3);
        rule("disney\\+|disney plus", "Entretenimiento y Suscripciones", 3);
        rule("hbo max|hbo go|max streaming", "Entretenimiento y Suscripciones", 3);
        rule("amazon prime|prime video", "Entretenimiento y Suscripciones", 3);
        rule("youtube premium|yt premium", "Entretenimiento y Suscripciones", 3);
        rule("apple tv|apple music|apple one", "Entretenimiento y Suscripciones", 3);
        rule("crunchyroll|paramount|star\\+|star plus", "Entretenimiento y Suscripciones", 3);
        rule("xbox game pass|playstation plus|ps plus|nintendo online", "Entretenimiento y Suscripciones", 3);
        rule("steam juego|epic games|origen ea", "Entretenimiento y Suscripciones", 3);
        rule("concierto|festival música|entrada concierto", "Entretenimiento y Suscripciones", 3);
        rule("cine|entrada película|cinecolombia|cinemax|royal films", "Entretenimiento y Suscripciones", 3);
        // Lugares de entretenimiento (2 pts)
        rule("discoteca|rumba|fiesta|bar nocturno|cover entrada", "Entretenimiento y Suscripciones", 2);
        rule("teatro obra|teatro musical|ballet|ópera|opera", "Entretenimiento y Suscripciones", 2);
        rule("museo|galería|galeria|exposición|exposicion", "Entretenimiento y Suscripciones", 2);
        rule("videojuego|consola|joystick|control gaming", "Entretenimiento y Suscripciones", 2);
        rule("suscripción|suscripcion|mensualidad app|membresía|membresia", "Entretenimiento y Suscripciones", 2);
        rule("gimnasio|gym smartfit|bodytech|spinning|crossfit", "Entretenimiento y Suscripciones", 2);
        rule("spa|masaje|sauna|jacuzzi", "Entretenimiento y Suscripciones", 2);
        rule("karaoke|billar|boliche|ping pong|escape room", "Entretenimiento y Suscripciones", 2);
        // Contexto débil (1 pt)
        rule("streaming|digital|online|app suscripción", "Entretenimiento y Suscripciones", 1);
        rule("pelicula|película|serie|episodio|documental", "Entretenimiento y Suscripciones", 1);
        rule("música|musica|cancion|canción|álbum|album|playlist", "Entretenimiento y Suscripciones", 1);
        rule("apuesta|casino|ruleta|slot|poker|baloto|chance|loteria", "Entretenimiento y Suscripciones", 1);

        // ---- EDUCACIÓN Y CURSOS ----
        // Instituciones y plataformas específicas (3 pts)
        rule("universidad|unal|uniandes|javeriana|sabana|rosario|uninorte|icesi", "Educación y Cursos", 3);
        rule("platzi", "Educación y Cursos", 3);
        rule("udemy", "Educación y Cursos", 3);
        rule("coursera", "Educación y Cursos", 3);
        rule("duolingo", "Educación y Cursos", 3);
        rule("edx|khan academy|domestika|skillshare|linkedin learning", "Educación y Cursos", 3);
        rule("matrícula|matricula universitaria|semestre|inscripción carrera", "Educación y Cursos", 3);
        rule("icfes|saber pro|ecaes|toefl|ielts|cambridge english", "Educación y Cursos", 3);
        rule("colegio mensualidad|pensión colegio|pension colegio", "Educación y Cursos", 3);
        // Actividades educativas (2 pts)
        rule("curso online|clase virtual|taller aprendizaje|diplomado|maestría|maestria|doctorado", "Educación y Cursos", 2);
        rule("tutoría|tutoria|asesoría académica|refuerzo clases", "Educación y Cursos", 2);
        rule("libros texto|material didáctico|cuaderno|fotocopias|impresión tesis", "Educación y Cursos", 2);
        rule("papelería|papeleria|esfero|lápiz|lapiz|marcador|resaltador", "Educación y Cursos", 2);
        rule("calculadora científica|regla|compás|microscopio|laboratorio", "Educación y Cursos", 2);
        // Contexto débil (1 pt)
        rule("clase|estudio|tarea|examen|parcial|trabajo|proyecto universitario", "Educación y Cursos", 1);
        rule("aprender|formación|capacitación|certificación|certificado", "Educación y Cursos", 1);
        rule("idioma|inglés|ingles|francés|frances|portugués|alemán", "Educación y Cursos", 1);

        // ---- SALUD Y FARMACIA ----
        // Muy específicos (3 pts)
        rule("droguería|drogueria|farmacia|drogas la rebaja|olimpica farmacia", "Salud y Farmacia", 3);
        rule("eps cita|cita médica|consulta médica|urgencias hospital", "Salud y Farmacia", 3);
        rule("clínica|clinica|hospital|centro médico|centro medico", "Salud y Farmacia", 3);
        rule("dentista|odontólogo|odontologo|ortodoncia|brackets dentales", "Salud y Farmacia", 3);
        rule("oftalmólogo|oftalmologo|optómetra|optometra|examen visual", "Salud y Farmacia", 3);
        rule("psicólogo|psicologo|psiquiatra|terapia psicológica|salud mental", "Salud y Farmacia", 3);
        rule("laboratorio clínico|examen de sangre|muestra laboratorio", "Salud y Farmacia", 3);
        rule("vacuna|inyección|inyeccion|aplicación vacuna", "Salud y Farmacia", 3);
        rule("cirugía|cirugia|operación médica|quirúrgico", "Salud y Farmacia", 3);
        // Artículos médicos (2 pts)
        rule("medicamento|medicina|pastilla|tableta|cápsula|capsula|jarabe", "Salud y Farmacia", 2);
        rule("antibiótico|antibiotic|antiinflamatorio|analgésico|analgesico", "Salud y Farmacia", 2);
        rule("vitamina|suplemento|proteína|proteina|colágeno|colageno", "Salud y Farmacia", 2);
        rule("gafas|lentes de contacto|montura|armazón", "Salud y Farmacia", 2);
        rule("copago|cuota moderadora|seguro médico|medicina prepagada", "Salud y Farmacia", 2);
        rule("dermatólogo|dermatologo|crema médica|tratamiento piel", "Salud y Farmacia", 2);
        // Contexto débil (1 pt)
        rule("doctor|médico|medico|cita|consulta|eps", "Salud y Farmacia", 1);
        rule("salud|enfermedad|dolor|gripa|resfriado|fiebre|tos", "Salud y Farmacia", 1);
        rule("crema|loción|locion|ungüento|ungüento", "Salud y Farmacia", 1);

        // ==============================================================
        // ICONOS
        // ==============================================================
        CATEGORY_ICONS.put("Restaurantes", "🍽️");
        CATEGORY_ICONS.put("Supermercado y Hogar", "🛒");
        CATEGORY_ICONS.put("Entretenimiento y Suscripciones", "🎮");
        CATEGORY_ICONS.put("Educación y Cursos", "📚");
        CATEGORY_ICONS.put("Salud y Farmacia", "💊");
        CATEGORY_ICONS.put("Misceláneos", "📦");
    }

    private static void rule(String pattern, String category, int points) {
        RULES.add(new ScoringRule(pattern, category, points));
    }

    // ========================== MODELO INTERNO ==========================
    private static class ScoringRule {
        final Pattern pattern;
        final String category;
        final int points;

        ScoringRule(String regex, String category, int points) {
            this.pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            this.category = category;
            this.points = points;
        }
    }

    // ========================== CLASSIFY ==========================
    /**
     * Clasifica un texto en una categoría usando sistema de puntuación.
     * Normaliza, expande abreviaciones y evalúa todas las reglas.
     */
    public String classify(String rawText) {
        String text = normalize(rawText);

        // Scoring map
        Map<String, Integer> scores = new LinkedHashMap<>();
        String[] validCategories = {
            "Restaurantes", "Supermercado y Hogar",
            "Entretenimiento y Suscripciones", "Educación y Cursos",
            "Salud y Farmacia", "Misceláneos"
        };
        for (String cat : validCategories) {
            scores.put(cat, 0);
        }

        for (ScoringRule rule : RULES) {
            if (rule.points <= 0) continue; // Ignorar reglas de "trampa"
            Matcher m = rule.pattern.matcher(text);
            if (m.find()) {
                scores.merge(rule.category, rule.points, Integer::sum);
            }
        }

        // Encontrar la categoría con mayor puntaje
        return scores.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Misceláneos");
    }

    /**
     * Normaliza el texto: lowercase, elimina tildes, expande abreviaciones.
     */
    private String normalize(String text) {
        String s = text.toLowerCase(Locale.ROOT)
                .replaceAll("[áàä]", "a")
                .replaceAll("[éèë]", "e")
                .replaceAll("[íìï]", "i")
                .replaceAll("[óòö]", "o")
                .replaceAll("[úùü]", "u")
                .replaceAll("ñ", "n");

        // Expandir abreviaciones
        for (Map.Entry<String, String> entry : ABBREVIATIONS.entrySet()) {
            s = s.replaceAll(entry.getKey(), entry.getValue());
        }

        return s;
    }

    // ========================== EXTRACT AMOUNT ==========================
    /**
     * Extrae el monto numérico de un texto libre.
     * Soporta: "3500", "3.500", "15000", "15.000", "$8.000", "15k", "15mil"
     */
    public BigDecimal extractAmount(String text) {
        // "15k" o "15mil" → miles
        Pattern kPattern = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(?:k|mil)\\b", Pattern.CASE_INSENSITIVE);
        Matcher kMatcher = kPattern.matcher(text);
        if (kMatcher.find()) {
            String num = kMatcher.group(1).replace(",", ".");
            return new BigDecimal(num).multiply(BigDecimal.valueOf(1000));
        }

        // Formato con puntos como separador de miles (ej: 3.500, 15.000)
        Pattern thousandsPattern = Pattern.compile("(\\d{1,3}(?:\\.\\d{3})+)");
        Matcher thousandsMatcher = thousandsPattern.matcher(text);
        if (thousandsMatcher.find()) {
            String numStr = thousandsMatcher.group(1).replace(".", "");
            return new BigDecimal(numStr);
        }

        // Número simple (ej: 3500, 15000)
        Pattern simplePattern = Pattern.compile("(\\d{3,})");
        Matcher simpleMatcher = simplePattern.matcher(text);
        if (simpleMatcher.find()) {
            return new BigDecimal(simpleMatcher.group(1));
        }

        // Número pequeño al final si nada más aplica
        Pattern smallPattern = Pattern.compile("(\\d+)");
        Matcher smallMatcher = smallPattern.matcher(text);
        if (smallMatcher.find()) {
            return new BigDecimal(smallMatcher.group(1));
        }

        return null;
    }

    // ========================== EXTRACT DESCRIPTION ==========================
    /**
     * Extrae la descripción limpia del texto (sin el número).
     */
    public String extractDescription(String text) {
        String desc = text.replaceAll("\\$", "")
                         .replaceAll("(?i)\\b\\d+(?:[.,]\\d+)?\\s*(?:k|mil)\\b", "")
                         .replaceAll("\\d{1,3}(?:\\.\\d{3})+", "")
                         .replaceAll("\\d+", "")
                         .replaceAll("\\s+", " ")
                         .trim();
        return desc.isEmpty() ? text.trim() : desc;
    }

    // ========================== UTILS ==========================
    public String getIcon(String category) {
        return CATEGORY_ICONS.getOrDefault(category, "📦");
    }

    public Map<String, String> getAllCategories() {
        return Collections.unmodifiableMap(CATEGORY_ICONS);
    }
}
