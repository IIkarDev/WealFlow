package middleware

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"os"
)

func JWTMiddleware(c *fiber.Ctx) error {
	tokenStr := c.Cookies("access_token")

	userID, err := ValidateToken(tokenStr, os.Getenv("ACCESS_SECRET"))
	if err != nil {
		fmt.Println("Ошибка токена на middleware")
	}

	c.Locals("userID", userID)
	return c.Next()
}

func Refresh(c *fiber.Ctx) error {
	tokenStr := c.Cookies("refresh_token")
	if tokenStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Нет refresh токена"})
	}

	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("REFRESH_SECRET")), nil
	})
	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Неверный refresh токен"})
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Неверный формат токена"})
	}

	userID, err := primitive.ObjectIDFromHex(sub)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Неверный ID пользователя"})
	}

	newAccessToken, _ := CreateToken(userID, os.Getenv("ACCESS_SECRET"))
	SetAuthCookies(c, "access_token", newAccessToken)

	return c.JSON(fiber.Map{"success": true})
}
