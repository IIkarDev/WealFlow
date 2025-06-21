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

// Register godoc
// @Summary Регистрация пользователя
// @Tags auth
// @Accept json
// @Produce json
// @Param user body map[string]string true "Поля: name, email, password"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/auth/register [post]
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

// Login godoc
// @Summary Авторизация пользователя
// @Tags auth
// @Accept json
// @Produce json
// @Param user body map[string]string true "Поля: email, password"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/auth/login [post]
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

// GetUser godoc
// @Summary Получение данных текущего пользователя
// @Tags auth
// @Produce json
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/auth [get]
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

// Logout godoc
// @Summary Выход пользователя (удаление куки)
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]bool
// @Router /api/auth/logout [post]
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

// PatchUser godoc
// @Summary Обновление email или имени
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]bool
// @Router /api/auth/update [post]
func PatchUser(c *fiber.Ctx) error {
	var data map[string]string

	err := c.BodyParser(&data)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	tokenStr := c.Cookies("access_token")
	userStr, err := middleware.ValidateToken(tokenStr, os.Getenv("ACCESS_SECRET"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	userID, _ := primitive.ObjectIDFromHex(userStr)

	delete(data, "_id")
	delete(data, "password")

	filter := bson.M{"_id": userID}
	update := bson.M{"$set": data}

	_, err = database.UsersCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Пользователь успешно обновлен"})
}

// ChangePassword godoc
// @Summary Обновление email или имени
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]bool
// @Router /api/auth/password [post]
func ChangePassword(c *fiber.Ctx) error {
	var data map[string]string
	var user models.User

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	tokenStr := c.Cookies("access_token")
	userStr, err := middleware.ValidateToken(tokenStr, os.Getenv("ACCESS_SECRET"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	userID, _ := primitive.ObjectIDFromHex(userStr)
	filter := bson.M{"_id": userID}
	err = database.UsersCollection.FindOne(context.Background(), filter).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(data["password"])); err != nil {
		log.Printf("пароли не совпадают: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "пароли не совпадают"})
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(data["newPassword"]), bcrypt.DefaultCost)
	update := bson.M{"$set": bson.M{"password": password}}

	_, err = database.UsersCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Пароль успешно обновлен"})
}
