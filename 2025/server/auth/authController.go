package auth

import (
	"context"
	"github.com/IIkar/WealFlow/2025/database"
	"github.com/IIkar/WealFlow/2025/middleware"
	"github.com/IIkar/WealFlow/2025/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"log"
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
		Provider: "common",
	}

	res, err := database.UsersCollection.InsertOne(context.Background(), user)
	if err != nil {
		log.Printf("Ошибка регистрации: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось создать транзакцию"})
	}

	user.ID = res.InsertedID.(primitive.ObjectID)

	accessToken, _ := middleware.CreateToken(user.ID, os.Getenv("ACCESS_SECRET"))
	refreshToken, _ := middleware.CreateToken(user.ID, os.Getenv("REFRESH_SECRET"))

	middleware.SetAuthCookies(c, "access_token", accessToken)
	middleware.SetAuthCookies(c, "refresh_token", refreshToken)

	return c.JSON(fiber.Map{"success": true, "message": "пользователь " + user.Name + " зарегистрирован"})
}

func Login(c *fiber.Ctx) error {
	var data map[string]string
	var user models.User

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Неверный формат запроса"})
	}

	filter := bson.M{"email": data["email"], "provider": "common"}
	err := database.UsersCollection.FindOne(context.Background(), filter).Decode(&user)
	if err != nil {
		log.Printf("Пользователь не найден: %v\n", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Пользователь не найден"})
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(data["password"])); err != nil {
		log.Printf("пароли не совпадают: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "пароли не совпадают"})
	}

	accessToken, _ := middleware.CreateToken(user.ID, os.Getenv("ACCESS_SECRET"))
	refreshToken, _ := middleware.CreateToken(user.ID, os.Getenv("REFRESH_SECRET"))

	middleware.SetAuthCookies(c, "access_token", accessToken)
	middleware.SetAuthCookies(c, "refresh_token", refreshToken)

	return c.JSON(fiber.Map{"success": true, "message": "пользователь " + user.Name + " авторизован"})
}

func GetUser(c *fiber.Ctx) error {
	var user models.User

	tokenStr := c.Cookies("access_token")

	userStr, err := middleware.ValidateToken(tokenStr, os.Getenv("ACCESS_SECRET"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	userID, _ := primitive.ObjectIDFromHex(userStr)

	err = database.UsersCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		log.Printf("Ошибка поиска: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Неверный ID"})
	}
	return c.JSON(user)
}

func Logout(c *fiber.Ctx) error {
	isSecure := false
	if os.Getenv("ENV") == "production" {
		isSecure = true
	}
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Now(),
		Domain:   os.Getenv("COOKIE_DOMAIN"),
		MaxAge:   -1,
		HTTPOnly: true,
		Secure:   isSecure,
	})
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Now(),
		Domain:   os.Getenv("COOKIE_DOMAIN"),
		MaxAge:   -1,
		HTTPOnly: true,
		Secure:   isSecure,
	})
	return c.JSON(fiber.Map{"success": true})
}
