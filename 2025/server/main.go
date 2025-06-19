package main

import (
	"context"
	"fmt"
	"github.com/IIkar/WealFlow/2025/auth"
	"github.com/IIkar/WealFlow/2025/database"
	"github.com/IIkar/WealFlow/2025/middleware"
	"github.com/IIkar/WealFlow/2025/transactions"
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
	authRoutes := app.Group("/api/auth")
	authRoutes.Get("/", auth.GetUser)
	authRoutes.Get("/google", auth.OAuthCallback)
	authRoutes.Post("/register", auth.Register)
	authRoutes.Post("/login", auth.Login)
	authRoutes.Post("/logout", auth.Logout)
	authRoutes.Post("/refresh", middleware.Refresh)

	// Защищённые API маршруты
	apiRoutes := app.Group("/api", middleware.JWTMiddleware)
	apiRoutes.Get("/transactions", transactions.GetTransactions)
	apiRoutes.Post("/transactions", transactions.PostTransaction)
	apiRoutes.Patch("/transactions/:id", transactions.UpdateTransaction)
	apiRoutes.Delete("/transactions/:id", transactions.DeleteTransaction)

	app.Get("/dev/access", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"token": c.Cookies("access_token")}) })
	app.Get("/dev/refresh", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"token": c.Cookies("refresh_token")}) })

	//if os.Getenv("ENV") == "production" {
	//	app.Static("/", "../client") // Путь к собранным файлам React
	//}

	// Порт из env или 5000 по умолчанию
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "5000"
	}

	log.Println("Сервер запущен на порту " + PORT)

	// В продакшн запускаем на HTTP, SSL сделает платформа
	log.Fatal(app.Listen("0.0.0.0:" + PORT))
}
