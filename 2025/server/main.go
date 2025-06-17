package main

import (
	"context" // Для управления контекстом операций, например, с MongoDB
	"fmt"     // Для форматированного вывода
	"github.com/IIkar/WealFlow/2025/controllers"
	"github.com/IIkar/WealFlow/2025/database"
	"github.com/gofiber/fiber/v2"                 // Веб-фреймворк Fiber
	"github.com/gofiber/fiber/v2/middleware/cors" // Middleware для CORS
	"github.com/joho/godotenv"                    // Для загрузки переменных окружения из .env файла
	"go.mongodb.org/mongo-driver/mongo"           // Драйвер MongoDB
	"log"                                         // Для логирования ошибок
	"os"                                          // Для работы с переменными окружения и файловой системой
)

func main() {
	fmt.Println("Приложение запущено.") // Информационное сообщение о старте

	// Загрузка переменных окружения из .env файла, если не в production среде
	if os.Getenv("ENV") != "production" {
		err := godotenv.Load(".env") // Используем godotenv для удобства разработки
		if err != nil {
			log.Fatal("Ошибка загрузки .env файла: ", err)
		}
	}

	client := database.MongoDBConnection()

	// Отложенное отключение от MongoDB при завершении работы функции main
	defer func(client *mongo.Client, ctx context.Context) {
		err := client.Disconnect(ctx)
		if err != nil {
			log.Println("Ошибка при отключении от MongoDB:", err) // Не Fatal, т.к. приложение уже завершается
		}
	}(client, context.Background())

	app := fiber.New()

	// Настройка CORS middleware для разрешения запросов с localhost:5173
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173", // URL клиентского приложения
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowMethods:     "GET,POST,PATCH,DELETE,OPTIONS", // Разрешенные HTTP методы
		AllowCredentials: true,
	}))

	// Аутентификационные маршруты (не требуют Authenticate middleware)
	authRoutes := app.Group("/auth")
	authRoutes.Get("/user", controllers.GetUser) // GetUser уже проверяет токен
	authRoutes.Post("/register", controllers.Register)
	authRoutes.Post("/login", controllers.Login)
	authRoutes.Post("/logout", controllers.Logout)

	app.Get("/id", controllers.GetUserID)

	// Маршруты API для транзакций, защищенные middleware
	apiRoutes := app.Group("/api")
	apiRoutes.Get("/transactions", controllers.GetTransactions)
	apiRoutes.Post("/transactions", controllers.PostTransaction)
	apiRoutes.Patch("/transactions/:id", controllers.UpdateTransaction)
	apiRoutes.Delete("/transactions/:id", controllers.DeleteTransaction)

	if os.Getenv("ENV") == "production" {
		app.Static("/", "./client/dist") // Путь к собранному клиентскому приложению
	}

	// Определение порта для сервера
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "5000" // Порт по умолчанию
	}

	log.Println("Сервер запущен на порту " + PORT)
	// Запуск HTTP сервера Fiber
	log.Fatal(app.Listen("0.0.0.0:" + PORT)) // 0.0.0.0 для доступности извне контейнера/сети
}
