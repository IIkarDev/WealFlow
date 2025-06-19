package controllers

import (
	"context"
	"github.com/IIkar/WealFlow/2025/database"
	"github.com/IIkar/WealFlow/2025/middleware"
	"github.com/IIkar/WealFlow/2025/models"
	"github.com/MicahParks/keyfunc"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"os"
	"time"
)

func Register(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	filter := bson.M{"email": data["email"]}

	count, err := database.UsersCollection.CountDocuments(context.Background(), filter)
	if err != nil {
		return err
	}
	if count > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email уже зарегистрирован"})
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(data["password"]), bcrypt.DefaultCost)

	user := models.User{
		Name:     data["name"],
		Email:    data["email"],
		Password: password,
	}

	res, err := database.UsersCollection.InsertOne(context.Background(), user)
	if err != nil {
		log.Printf("Ошибка регистрации: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось создать транзакцию"})
	}

	user.ID = res.InsertedID.(primitive.ObjectID)

	_ = middleware.CreateToken(c, user)

	return c.JSON(fiber.Map{"user": user})
}

func Login(c *fiber.Ctx) error {

	var data map[string]string
	var user models.User

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Неверный формат запроса"})
	}

	email, exists := data["email"]
	if !exists || email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Поле 'email' обязательно"})
	}

	err := database.UsersCollection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		log.Printf("Пользователь не найден: %v\n", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Пользователь не найден"})
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(data["password"])); err != nil {
		log.Printf("пароли не совпадают: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "пароли не совпадают"})
	}

	return c.JSON(fiber.Map{"success": true})
}

func GetUser(c *fiber.Ctx) error {
	var user models.User

	userID, err := middleware.ExtractUserID(c)
	if userID == primitive.NilObjectID {
		log.Printf("Ошибка токена: %v\n", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Действующий токен не найден"})
	}
	if err != nil {
		log.Printf("Ошибка ID: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Ошибка получения ID из токена"})
	}

	err = database.UsersCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		log.Printf("Ошибка поиска: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Неверный ID"})
	}
	return c.JSON(user)
}

func Logout(c *fiber.Ctx) error {
	cookie := fiber.Cookie{
		Name:     "JWT_TOKEN",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Domain:   os.Getenv("JWT_DOMAIN"),
	}

	//c.ClearCookie("JWT_TOKEN")

	c.Cookie(&cookie)

	return c.JSON(fiber.Map{"success": true})
}

func OAuthCallback(c *fiber.Ctx) error {
	var body struct {
		Token string `json:"token"`
	}
	if err := c.BodyParser(&body); err != nil || body.Token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Token is required"})
	}

	// Загрузка JWKS из Auth0
	jwksURL := "https://" + os.Getenv("AUTH0_DOMAIN") + "/.well-known/jwks.json"
	jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load JWKS"})
	}

	// Проверка и разбор id_token
	token, err := jwt.Parse(body.Token, jwks.Keyfunc)
	if err != nil || !token.Valid {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Invalid claims"})
	}

	email, ok := claims["email"].(string)
	if !ok || email == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Email not found in token"})
	}

	// Ищем или создаём пользователя
	var user models.User
	err = database.UsersCollection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		// Если пользователь не найден — создаём
		user = models.User{
			Email: email,
			Name:  claims["name"].(string), // или "" если не хочешь
		}
		res, err := database.UsersCollection.InsertOne(context.Background(), user)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Ошибка создания пользователя"})
		}
		user.ID = res.InsertedID.(primitive.ObjectID)
	}

	// Создаём JWT и отправляем cookie
	if err := middleware.CreateToken(c, user); err != nil {
		return err
	}

	return c.JSON(fiber.Map{"success": true, "user": user})
}
