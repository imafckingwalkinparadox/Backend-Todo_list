// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
var path = require('path'); 
var mysql = require('mysql2');
var { createConnection } = require('mysql2');

// Crear una instancia de la aplicación Express
var app = express();

// Usar CORS para permitir solicitudes desde el puerto 5500 (o el origen de tu frontend)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Aquí puedes ajustar esto al origen de tu frontend
}));

// Middlewares para la configuración básica de Express
app.use(express.json()); // Para parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hector.2008',
  database: 'juego_de_memoria'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// Ruta para la página principal
app.get('/', (req, res) => {
  res.send('¡Hola desde mi backend en Express!');
});

// Ruta para obtener tareas
app.get('/tarea', (req, res) => { 
  db.query('SELECT * FROM tarea', (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});
 

// Ruta para agregar una tarea
app.post('/agregar', (req, res) => {
  const { nombre, estado, usuario_id } = req.body;
  if (!nombre || !estado || !usuario_id) {
    return res.status(400).send('Faltan datos en la solicitud');
  }

  const sql = 'INSERT INTO tarea (nombre, estado, usuario_id) VALUES (?, ?, ?)';
  db.query(sql, [nombre, estado, usuario_id], (err, result) => {
    if (err) {
      console.error('Error al insertar la tarea: ', err);
      return res.status(500).send('Error al insertar la tarea');
    }

    // Recuperamos solo la tarea recién agregada
    const sqlGetTarea = 'SELECT * FROM tarea WHERE id = ?';
    db.query(sqlGetTarea, [result.insertId], (err, results) => {
      if (err) {
        console.error('Error al recuperar la tarea: ', err);
        return res.status(500).send('Error al recuperar la tarea');
      }
      // Enviamos solo la tarea recién agregada al frontend
      res.status(201).json(results[0]);  // Enviamos solo el primer resultado (la tarea agregada)
    });
  });
});



// Ruta para el login
app.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos en la solicitud' });
  }

  const sql = 'SELECT * FROM usuario WHERE correo = ? AND contrasenna = ?';
  db.query(sql, [correo, contraseña], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    if (results.length > 0) {
      const usuario = { id: results[0].id, nombre: results[0].nombre, correo: results[0].correo };
      res.status(200).json({ mensaje: 'Login exitoso', usuario });
    } else {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
  });
});


// Ruta para el registro de usuarios
app.post('/registro', (req, res) => {
  const { correo, contraseña, nombre } = req.body;
  if (!correo || !contraseña || !nombre) {
    return res.status(400).send('Faltan datos en la solicitud');
  }
  // Corregir el orden de los parámetros en la consulta SQL
  const sql = 'INSERT INTO usuario (nombre, correo, contrasenna) VALUES (?, ?, ?)';
  db.query(sql, [nombre, correo, contraseña], (err, result) => {
    if (err) {
      console.error('Error al registrar el usuario: ', err);
      return res.status(500).send('Error al registrar usuario');
    }
    res.status(201).send('Cuenta creada con éxito');
  });
});


db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Error en la conexión con MySQL:', err);
  } else {
    console.log('Conexión con MySQL funcionando correctamente');
  }
});


// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;
