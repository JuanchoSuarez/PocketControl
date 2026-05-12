-- ==========================================
-- SCRIPT DE DATOS PARA VIDEO DE POCKET CONTROL
-- ==========================================
-- Instrucciones:
-- 1. Asegúrate de tener al menos un usuario creado en la app (con tu email).
-- 2. Abre DBeaver, conéctate a la base de datos 'pocketcontrol'.
-- 3. Abre un nuevo script SQL, pega este código y ejecútalo.
-- 4. ¡Listo! Tu app se verá llena de datos reales.
-- Nota: Asegúrate de que tu user_id sea 1. Si no lo es, cambia los "1" por tu ID.

-- Limpiar datos de gastos e inversiones (opcional, por si quieres arrancar en limpio)
-- DELETE FROM expenses WHERE user_id = 1;
-- DELETE FROM investments WHERE user_id = 1;

-- Gastos de prueba
INSERT INTO expenses (user_id, amount, description, category, created_at) VALUES 
(1, 15000, 'Almuerzo en la universidad', 'Restaurantes', NOW() - INTERVAL '1 days'),
(1, 8000, 'Uber a la casa', 'Transporte', NOW() - INTERVAL '2 days'),
(1, 22000, 'Entrada de cine', 'Entretenimiento y Suscripciones', NOW() - INTERVAL '3 days'),
(1, 120000, 'Mercado de la quincena', 'Supermercado y Hogar', NOW() - INTERVAL '4 days'),
(1, 4500, 'Empanada y gaseosa', 'Restaurantes', NOW() - INTERVAL '5 hours'),
(1, 55000, 'Mensualidad gimnasio', 'Entretenimiento y Suscripciones', NOW() - INTERVAL '6 days'),
(1, 35000, 'Cita médica copago', 'Salud y Farmacia', NOW() - INTERVAL '8 days'),
(1, 75000, 'Libros semestre', 'Educación y Cursos', NOW() - INTERVAL '10 days'),
(1, 40000, 'Camiseta negra', 'Misceláneos', NOW() - INTERVAL '11 days'),
(1, 3500, 'Transmilenio', 'Transporte', NOW() - INTERVAL '1 hour');

-- Presupuesto de prueba (si no existe)
INSERT INTO budgets (user_id, month, year, amount) 
VALUES (1, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), 600000)
ON CONFLICT DO NOTHING;

-- Inversiones de prueba
INSERT INTO investments (user_id, name, amount, type, duration, created_at) VALUES
(1, 'CDT Bancolombia', 1500000, 'CDT', '6 meses', NOW() - INTERVAL '1 month'),
(1, 'Tyba - Portafolio Moderado', 300000, 'Fondo', 'Indefinido', NOW() - INTERVAL '2 months'),
(1, 'Ahorro para la moto', 850000, 'Ahorro', '12 meses', NOW() - INTERVAL '15 days');
