// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
var path = require('path'); 
var mysql = require('mysql2');
var { createConnection} = require('mysql2');

const { error } = require('console');

// Crear una instancia de la aplicación Express
var app = express();

// Usar CORS para permitir solicitudes desde el puerto 5500 (o el origen de tu frontend)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Aquí puedes ajustar esto al origen de tu frontend
}));

// Middlewares para la configuración básica de Express
app.use(express.json()); // Para parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Rutas del servidor
app.get('/', (req, res) => {
  res.send('¡Hola desde mi backend en Express!');
});

// Rutas adicionales
app.get('/hola', (req, res) => {
  res.send('¡Hola Mundo Hector!');
});

//-------------------------------------------------------------
// Configurar el puerto en el que se escucharán las solicitudes
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hector.2008',
  database: 'juego_de_memoria'
});

//Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error de conexion de la base de datos:', err);
    return
  }
  console.log('Conexion a la base de datos establecidos');
});

// Ruta para consultar los usuarios desde la base de datos
app.get('/tareas', (req, res) => {
  // Realiza una consulta SELECT a la base de datos
  
  db.query('SELECT * FROM tareas', (err, results) => {
  if (err) {
  console.error('Error al ejecutar la consulta: ', err);
  res.status(500).send('Error en la consulta');
  return;
  }
  // Enviar los resultados de la consulta como respuesta en formato JSON
  res.json(results);
  });
});  

//-----------------SET-----------------------------------------------
app.post('/agregar', (req, res) => {
  // Obtenemos los datos enviados desde el cuerpo de la solicitud (request body)
  const { nombre_tarea, estado } = req.body;

  // Verificamos que todos los campos sean proporcionados
  if (!nombre_tarea || !estado) {
    return res.status(400).send('Faltan datos en la solicitud');
  }

  // Realiza la consulta INSERT para agregar una nueva tarea a la base de datos
  const sql = 'INSERT INTO tareas (nombre_tarea, estado) VALUES (?, ?)';

  // Ejecutamos la consulta con los valores proporcionados
  db.query(sql, [nombre_tarea, estado], (err, result) => {
    if (err) {
      console.error('Error al insertar la tarea: ', err);
      return res.status(500).send('Error al insertar la tarea');
    }
    // Si la inserción es exitosa, enviamos una respuesta con el ID de la nueva tarea
    res.status(201).json({ id: result.insertId, nombre_tarea, estado });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;