# 🌟 PupitoBot - Tu Compañero de Discord Multifuncional 🚀

[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green)](https://nodejs.org/) 
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-blue)](https://discord.js.org/) 
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

¡Bienvenido a **PupitoBot**! Este bot está diseñado para mejorar tu experiencia en Discord con comandos interactivos, juegos, herramientas de entretenimiento y más. Perfecto para comunidades que aman el anime, los memes y la música.

---

## 🎮 Características Principales

### 👾 Juegos y Diversión
- `/ahorcado`: Juega al clásico ahorcado con temas de anime.
- `/piedrapapelotijera`: Enfréntate al bot en piedra, papel o tijera.
- `/randomanime`: Obtén un anime aleatorio de un género que elijas.
- `/bola8`: Haz una pregunta y deja que la bola 8 decida tu destino.
- `/trivia`: Responde preguntas de trivia de opción múltiple.
- `/roll`: Lanza un dado.
- `/waifu`: Obtén una imagen aleatoria de waifu.
- `/bonk`: ¡Bonkea a alguien!
- `/meme1`, `/meme2`, `/meme3`, `/meme4`: Genera memes usando plantillas populares.

### 🌌 Herramientas de Entretenimiento
- `/nasa`: Descubre la imagen del día de la NASA.
- `/steam`: Busca información sobre juegos en Steam.
- `/cat`: Envía una imagen aleatoria de un gato.
- `/padoru`: ¡Padoru!

### 🎵 Comandos de Música
- `/play`: Reproduce una canción en tu canal.
- `/playlist`: Reproduce una lista de reproducción.
- `/skip`: Salta a la siguiente canción.
- `/queue`: Muestra la cola de canciones.
- `/pause` y `/unpause`: Pausa o reanuda la música.
- `/leave`: Haz que el bot salga del canal de voz.
- Más comandos dinámicos con `/musiccommands`.

### ⚙️ Utilidades
- `/commands`: Muestra una lista de comandos disponibles.
- `/server`: Muestra información sobre el servidor.
- `/user`: Muestra información sobre el usuario.
- `/limpiar`: Elimina mensajes recientes del bot en el canal.
- `/ping`: ¡Recibe un **Pong!** como respuesta.

---

## 🚀 Instalación y Configuración

### Requisitos
- Node.js v16+
- Token de bot de Discord [Consíguelo aquí](https://discord.com/developers/applications)
- Token Nasa  [Consíguelo aquí](https://api.nasa.gov/)
- Token Riot Games  [Consíguelo aquí](https://developer.riotgames.com/)
- Token Steam  [Consíguelo aquí](https://steamcommunity.com/dev?l=spanish)
- Cuenta imgflip  [Consíguelo aquí](https://imgflip.com/))
- LibreTranslate local  [Consíguelo aquí](https://github.com/LibreTranslate/LibreTranslate))

### Pasos
1. Clona este repositorio:
   ```
   git clone https://github.com/tuusuario/Pupitobot.git
   cd Pupitobot
   ``` 
2. Instala las dependencias:
   ```
   npm i
   ```
3. Configura el archivo .env con tu token de bot:
    ```
    makefile .env
    ```
    ```
    {
   	"token": "DISCORD_TOKEN",
       "clientId":"CLIENT_ID",
       "guildId":"SERVER_ID",
       "nasa":"NASA_TOKEN",
       "imgflip_1":"IMGFLIP_USER",
       "imgflip_2":"IMGFLIP_PASSWORD",
       "riot":"RIOT_TOKEN",
       "steam":"STEAM_TOKEN"
   }
    ```
4. Inicia el bot:
    ```
    npm deploy-commands
    npm deploy-db
    npm start
    
    ```
🛠 Tecnologías Usadas
Node.js: Backend del bot.
Discord.js v14: Interfaz con la API de Discord.
SQLite3: Base de datos para el sistema de trivia y otras funciones.
APIs Externas: Integración con la API de NASA, Steam, Riot Games y más.

📝 Contribuciones
¡Las contribuciones son bienvenidas! Si tienes ideas para nuevos comandos o mejoras, abre un Issue o envía un Pull Request.

📄 Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

📞 Contacto
Si tienes preguntas o necesitas ayuda, ¡no dudes en contactarme!
EttinNitte | GitHub
