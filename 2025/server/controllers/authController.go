package controllers

import (
	"context"
	"fmt"
	"github.com/IIkar/WealFlow/2025/database"
	"github.com/IIkar/WealFlow/2025/middleware"
	"github.com/IIkar/WealFlow/2025/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"log"
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

	_ = middleware.CreateToken(c, user)

	return c.JSON(fiber.Map{"success": true})
}

func GetUser(c *fiber.Ctx) error {
	//log.Printf(">>> GetUser: ЗАПРОС К /auth/user. Cookie JWT_TOKEN: [%s]", c.Cookies("JWT_TOKEN"))
	//cookie := c.Cookies("JWT_TOKEN")
	//
	//token, err := jwt.ParseWithClaims(cookie, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
	//	return []byte(os.Getenv("JWT_SECRET")), nil
	//})
	//if err != nil {
	//	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Действующий токен не найден"})
	//}
	//
	//claims := token.Claims.(*jwt.StandardClaims)
	//primitive.ObjectIDFromHex(claims.Issuer)
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
		Value:    "aas",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
	}

	fmt.Println(c.Cookies("JWT_TOKEN"))
	//c.ClearCookie("JWT_TOKEN")

	c.Cookie(&cookie)

	return c.JSON(fiber.Map{"success": true})
}

func GetUserID(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(primitive.ObjectID)
	fmt.Println(c.Locals("user_id"))
	if !ok {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"user_id": userID})
}
