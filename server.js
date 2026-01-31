const app = require('./app'); 
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
}).on('error', (err) => {
    console.error("Ha ocurrido un error y el servidor no ha iniciado:", err);
    process.exit(1);
});
