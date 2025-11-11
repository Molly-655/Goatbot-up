# Goat Bot V2

## Overview

Goat Bot V2 is a Node.js-based Facebook Messenger chatbot designed for automated interactions via an unofficial Facebook Chat API. It features a command-based system with a plugin architecture, event handling, and a web dashboard for configuration. The bot supports multiple database backends (JSON, SQLite, MongoDB), multi-language capabilities, Google Drive integration for file management, and automated uptime monitoring. Its purpose is to provide a versatile and extensible platform for automating Messenger interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Authentication & Session Management

The bot uses `neokex-fca` for cookie-based Facebook authentication, supporting persistent sessions through `appState` JSON storage. It allows various login methods, including email/password and 2FA, with proxy support and session validation.

### Database Layer

An abstracted database layer provides flexibility across deployment environments, supporting JSON (file-based), SQLite (embedded), and MongoDB (scalable, cloud-ready) via a unified repository pattern. This architecture manages `threadsData`, `usersData`, `dashBoardData`, and `globalData` with corresponding models for chat threads, user profiles, dashboard accounts, and global configurations.

### Command & Event System

The bot implements an extensible plugin system with dynamic module loading for commands (`scripts/cmds/`) and events (`scripts/events/`). Each module defines a configuration and handler functions. A role-based permission system (`role: 0` for user, `1` for group admin, `2` for bot admin, `3` for premium user) controls access to commands and features, with bot admins having overarching permissions. The system includes hot-reload support, command aliases, and environment-based configurations.

### Web Dashboard

An Express.js web server with ETA templating, Passport.js authentication, and Socket.IO provides a user-friendly interface for bot configuration. Features include thread-specific settings, Google Drive file uploads, email verification, reCAPTCHA v2 for bot protection, rate limiting, and secure session management with bcrypt for password hashing and CSRF protection.

### Message Handler Architecture

An event-driven architecture processes incoming Facebook messages through a handler chain: `handlerAction.js` routes events, `handlerCheckData.js` ensures data existence, and `handlerEvents.js` validates permissions and routes to specific handlers for message, reply, reaction, and other Facebook event types.

## Recent Changes

### November 11, 2025
- **neokex-fca upgraded to v4.0.0**: Updated from v3.3.0 to leverage new AI-powered theme generation features.
- **changetheme command refactored**: Replaced OpenAI dependency with neokex-fca's built-in `createAITheme()` and `setThreadThemeMqtt()` methods for AI-based thread theme customization.

## External Dependencies

### Facebook Chat API
- **neokex-fca v4.0.0**: Unofficial Facebook Chat API wrapper for real-time messaging and platform interactions. Includes AI theme generation capabilities.

### Google Services
- **Google Drive API**: For file storage and management.
- **Gmail API**: For email notifications and verification (requires OAuth 2.0).
- **Google reCAPTCHA v2**: For bot protection on dashboard login/registration.

### Email Notifications
- **Nodemailer**: For sending emails via Gmail SMTP.

### Uptime Monitoring
- **Better Uptime / UptimeRobot**: External services to prevent bot sleep on free hosting.

### Database Systems
- **MongoDB**: Optional cloud-based database.
- **SQLite**: Optional embedded database via `sqlite3` and Sequelize ORM.
- **JSON**: Default file-system based storage.

### Third-Party APIs
- **OpenWeatherMap**: For weather data.
- **iTunes Search**: For app store queries.
- **YouTube (@distube/ytdl-core)**: For video downloads.
- **TikTok**: For video downloads (custom scraping).

### Authentication & Security
- **bcrypt**: For password hashing.
- **totp-generator**: For Two-Factor Authentication.
- **Passport.js**: For session management and authentication.

### Core Libraries & Tools
- **Canvas**: For image generation (e.g., QR codes).
- **cheerio**: For HTML parsing in web scraping.