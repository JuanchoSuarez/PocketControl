package com.pocketcontrol.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Servicio de clasificación automática de gastos.
 * Usa un mapa de palabras clave en español colombiano para asignar categorías.
 */
@Service
public class ClassifierService {

    // Mapa de palabras clave por categoría
    private static final Map<String, List<String>> KEYWORD_MAP = new LinkedHashMap<>();

    // Iconos por categoría
    private static final Map<String, String> CATEGORY_ICONS = new LinkedHashMap<>();

    static {
        // Restaurantes (antes Alimentación + Transporte meals)
        KEYWORD_MAP.put("Restaurantes", Arrays.asList(
            "almuerzo", "desayuno", "cena", "comida", "merienda", "onces",
            "café", "cafe", "tinto", "cappuccino", "latte", "aromática", "aromatica",
            "restaurante", "corrientazo", "bandeja", "ajiaco", "sancocho", "arepa",
            "empanada", "buñuelo", "pandebono", "pan", "panadería", "panaderia",
            "hamburguesa", "burger", "pizza", "sushi", "perro", "salchipapa",
            "rappi", "ifood", "domicilio", "domicilios", "pedido",
            "mcdonalds", "mcdonald", "subway", "kfc", "frisby", "presto",
            "crepes", "wok", "jugos", "jugo", "gaseosa", "cerveza", "trago",
            "helado", "postre", "snack", "galleta", "chocolate", "dulce",
            "asado", "bbq", "pollo", "carne", "arroz", "sopa", "tamal",
            "transmilenio", "tm", "transmi", "sitp", "uber", "didi", "cabify", "indriver", "indrive",
            "taxi", "bus", "buseta", "colectivo", "metro", "mio", "megabus",
            "gasolina", "gas", "tanqueo", "parqueadero", "parking", "peaje",
            "bici", "bicicleta", "ecobici", "patineta", "scooter",
            "vuelo", "avion", "avión", "avianca", "latam", "viva", "wingo",
            "flota", "terminal", "pasaje", "tiquete", "rappi moto", "picap"
        ));

        // Supermercado y Hogar
        KEYWORD_MAP.put("Supermercado y Hogar", Arrays.asList(
            "mercado", "supermercado", "éxito", "exito", "jumbo", "carulla",
            "d1", "ara", "justo", "bueno", "olimpica", "olímpica", "surtimax",
            "alkosto", "makro", "pricesmart", "costco",
            "frutas", "verduras", "leche", "huevos", "aceite",
            "papel", "aseo", "detergente", "jabón", "jabon", "shampoo",
            "tienda", "miscelánea",
            "compras", "víveres", "viveres", "despensa",
            "hogar", "casa", "cocina", "lavadora", "nevera", "mueble", "decoración",
            "bombillo", "escoba", "trapeador", "arriendo", "servicios", "luz", "agua", "internet"
        ));

        // Entretenimiento y Suscripciones
        KEYWORD_MAP.put("Entretenimiento y Suscripciones", Arrays.asList(
            "cine", "película", "pelicula", "netflix", "spotify", "disney",
            "hbo", "prime", "amazon", "youtube", "premium", "streaming",
            "concierto", "teatro", "museo", "parque", "diversión", "diversion",
            "fiesta", "cover", "discoteca", "bar", "rumba", "billar",
            "boliche", "karaoke", "escape room", "paintball",
            "videojuego", "juego", "play", "xbox", "nintendo", "steam",
            "suscripcion", "suscripción", "membresía", "membresia",
            "gym", "gimnasio", "piscina", "spa", "masaje",
            "libro", "kindle", "audible", "revista",
            "apuesta", "casino", "lotería", "loteria", "baloto", "chance"
        ));

        // Educación y Cursos
        KEYWORD_MAP.put("Educación y Cursos", Arrays.asList(
            "universidad", "matrícula", "matricula", "semestre", "pensión", "pension",
            "colegio", "curso", "clase", "taller", "diplomado", "maestría", "maestria",
            "especialización", "especializacion", "doctorado", "pregrado",
            "libros", "texto", "cuaderno", "fotocopias", "copias", "impresiones",
            "udemy", "coursera", "platzi", "edx", "duolingo",
            "tutoria", "tutoría", "profesor", "asesoría", "asesoria",
            "papelería", "papeleria", "útiles", "utiles", "esfero", "lápiz", "lapiz",
            "calculadora", "usb", "tesis", "monografía", "monografia",
            "certificado", "icfes", "saber", "toefl", "ielts"
        ));

        // Salud y Farmacia
        KEYWORD_MAP.put("Salud y Farmacia", Arrays.asList(
            "médico", "medico", "doctor", "doctora", "cita", "consulta",
            "eps", "prepagada", "hospital", "clínica", "clinica", "urgencias",
            "medicina", "medicamento", "pastilla", "droga", "fórmula", "formula",
            "examen", "laboratorio", "sangre", "radiografía", "radiografia",
            "dentista", "odontólogo", "odontologo", "ortodoncia", "brackets",
            "oftalmólogo", "oftalmologo", "gafas", "lentes", "optometría",
            "psicólogo", "psicologo", "terapia", "psiquiatra",
            "dermatólogo", "dermatologo", "crema", "protector",
            "vacuna", "inyección", "inyeccion", "cirugía", "cirugia",
            "seguro", "póliza", "poliza", "copago",
            "droguería", "drogueria", "farmacia"
        ));

        // Iconos
        CATEGORY_ICONS.put("Restaurantes", "🍽️");
        CATEGORY_ICONS.put("Supermercado y Hogar", "🛒");
        CATEGORY_ICONS.put("Entretenimiento y Suscripciones", "🎮");
        CATEGORY_ICONS.put("Educación y Cursos", "📚");
        CATEGORY_ICONS.put("Salud y Farmacia", "💊");
        CATEGORY_ICONS.put("Misceláneos", "📦");
    }

    /**
     * Clasifica un texto en una categoría según las palabras clave.
     */
    public String classify(String text) {
        String lower = text.toLowerCase()
                .replaceAll("[áà]", "a")
                .replaceAll("[éè]", "e")
                .replaceAll("[íì]", "i")
                .replaceAll("[óò]", "o")
                .replaceAll("[úù]", "u");

        for (Map.Entry<String, List<String>> entry : KEYWORD_MAP.entrySet()) {
            for (String keyword : entry.getValue()) {
                String normalizedKey = keyword.toLowerCase()
                        .replaceAll("[áà]", "a")
                        .replaceAll("[éè]", "e")
                        .replaceAll("[íì]", "i")
                        .replaceAll("[óò]", "o")
                        .replaceAll("[úù]", "u");
                if (lower.contains(normalizedKey)) {
                    return entry.getKey();
                }
            }
        }
        return "Misceláneos";
    }

    /**
     * Extrae el monto numérico de un texto libre.
     * Soporta formatos: "3500", "3.500", "15000", "15.000", "4500.50"
     */
    public BigDecimal extractAmount(String text) {
        // Buscar patrones numéricos — primero formatos con punto como separador de miles
        // Patrón: dígitos con puntos como separador de miles (ej: 3.500, 15.000)
        Pattern thousandsPattern = Pattern.compile("(\\d{1,3}(?:\\.\\d{3})+)");
        Matcher thousandsMatcher = thousandsPattern.matcher(text);
        if (thousandsMatcher.find()) {
            String numStr = thousandsMatcher.group(1).replace(".", "");
            return new BigDecimal(numStr);
        }

        // Patrón: número simple (ej: 3500, 15000)
        Pattern simplePattern = Pattern.compile("(\\d+)");
        Matcher simpleMatcher = simplePattern.matcher(text);
        if (simpleMatcher.find()) {
            return new BigDecimal(simpleMatcher.group(1));
        }

        return null;
    }

    /**
     * Extrae la descripción (todo lo que no es el número).
     */
    public String extractDescription(String text) {
        // Remover el número y limpiar
        String desc = text.replaceAll("\\$", "")
                         .replaceAll("\\d{1,3}(?:\\.\\d{3})+", "")
                         .replaceAll("\\d+", "")
                         .replaceAll("\\s+", " ")
                         .trim();
        return desc.isEmpty() ? text.trim() : desc;
    }

    /**
     * Retorna el ícono emoji de una categoría.
     */
    public String getIcon(String category) {
        return CATEGORY_ICONS.getOrDefault(category, "📦");
    }

    /**
     * Retorna todas las categorías disponibles con sus íconos.
     */
    public Map<String, String> getAllCategories() {
        return Collections.unmodifiableMap(CATEGORY_ICONS);
    }
}
