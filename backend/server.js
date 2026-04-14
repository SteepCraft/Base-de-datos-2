import app from "./app.js";

const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`API corriendo en el puerto ${PORT}`);
  console.log(`Accede a http://localhost:${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  const errorContext = {
    promise,
    message: typeof reason === "object" && reason !== null ? reason.message : String(reason),
    stack: typeof reason === "object" && reason !== null ? reason.stack : undefined,
  };
  console.error("Error: Unhandled Rejection at:", errorContext);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  const errorContext = {
    message: err.message,
    stack: err.stack,
  };
  console.error("Error: Uncaught Exception:", errorContext);
  process.exit(1);
});
