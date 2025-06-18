package middleware

import (
	"context"
	"fmt"
	"github.com/IIkar/WealFlow/2025/database"
	"github.com/IIkar/WealFlow/2025/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"log"
	"os"
	"time"
)

func CreateToken(c *fiber.Ctx, user models.User) error {
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    user.ID.Hex(),
		ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
	})
	token, err := claims.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": "не удается войти в систему"})
	}

	cookie := fiber.Cookie{
		Name:     "JWT_TOKEN",
		Value:    token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Domain:   os.Getenv("JWT_DOMAIN"),
	}
	c.Cookie(&cookie)
	return c.JSON(fiber.Map{"token": token})
}

func ExtractUserID(c *fiber.Ctx) (primitive.ObjectID, error) {
	cookie := c.Cookies("JWT_TOKEN")

	token, err := jwt.ParseWithClaims(cookie, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return primitive.NilObjectID, c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Действующий токен не найден"})
	}

	claims := token.Claims.(*jwt.StandardClaims)

	userID, err := primitive.ObjectIDFromHex(claims.Issuer)

	if err != nil {
		log.Printf("Ошибка получения ID из токена: %v\n", err)
		return primitive.NilObjectID, c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Ошибка получения ID из токена"})
	}
	return userID, nil
}

func DeleteAllTransactionsOnUser(c *fiber.Ctx) error {
	userId, err := ExtractUserID(c)
	if userId == primitive.NilObjectID || err != nil {
		log.Fatal("No token or invalid id ")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "No token or invalid id"})
	}

	res, err := database.TransactionsCollection.DeleteMany(context.Background(), bson.M{"user_id": userId})
	fmt.Printf("Удалено: %d транзакций", res.DeletedCount)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "deletedCount": res.DeletedCount})
}
