package main

import (
	"context"
	"fmt"
	"github.com/IIkar/WealFlow/2025/controllers"
	"github.com/IIkar/WealFlow/2025/database"
	"github.com/IIkar/WealFlow/2025/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"os"
)

func main() {
	fmt.Println("Приложение запущено.")

	// Загружаем .env в dev
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(".env"); err != nil {
			log.Fatal("Ошибка загрузки .env файла: ", err)
		}
	}

	client := database.MongoDBConnection()
	defer func(client *mongo.Client, ctx context.Context) {
		err := client.Disconnect(ctx)
		if err != nil {
			log.Println("Ошибка при отключении от MongoDB:", err)
		}
	}(client, context.Background())

	app := fiber.New()

	// Берём фронтенд домен из env, если нет — fallback на localhost для разработки
	frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
	if frontendOrigin == "" {
		frontendOrigin = "http://localhost:5173"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     frontendOrigin,
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowMethods:     "GET,POST,PATCH,DELETE,OPTIONS",
		AllowCredentials: true,
	}))

	// Роуты аутентификации (без защиты)
	authRoutes := app.Group("/auth")
	authRoutes.Get("/", controllers.GetUser)
	authRoutes.Get("/google", controllers.OAuthCallback)
	authRoutes.Post("/register", controllers.Register)
	authRoutes.Post("/login", controllers.Login)
	authRoutes.Post("/logout", controllers.Logout)

	// Защищённые API маршруты
	apiRoutes := app.Group("/api")
	apiRoutes.Get("/transactions", controllers.GetTransactions)
	apiRoutes.Post("/transactions", controllers.PostTransaction)
	apiRoutes.Patch("/transactions/:id", controllers.UpdateTransaction)
	apiRoutes.Delete("/transactions/:id", controllers.DeleteTransaction)
	apiRoutes.Delete("/clear", middleware.DeleteAllTransactionsOnUser)

	if os.Getenv("ENV") == "production" {
		app.Static("/", "../client") // Путь к собранным файлам React
	}

	// Порт из env или 5000 по умолчанию
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "5000"
	}

	log.Println("Сервер запущен на порту " + PORT)

	// В продакшн запускаем на HTTP, SSL сделает платформа
	log.Fatal(app.Listen("0.0.0.0:" + PORT))
}
