package auth

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
	"net/http"
	"os"
)

func OAuthCallback(c *fiber.Ctx) error {
	tokenStr, err := extractTokenFromBody(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	claims, err := verifyOAuthToken(tokenStr)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	user, err := findOrCreateUser(claims)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	accessToken, err := middleware.CreateToken(user.ID, os.Getenv("ACCESS_SECRET"))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось создать токен"})
	}

	middleware.SetAuthCookies(c, "access_token", accessToken)

	return c.JSON(fiber.Map{"success": true, "user": user})
}

func extractTokenFromBody(c *fiber.Ctx) (string, error) {
	var body struct {
		Token string `json:"token"`
	}
	if err := c.BodyParser(&body); err != nil || body.Token == "" {
		return "", fiber.NewError(fiber.StatusBadRequest, "Token is required")
	}
	return body.Token, nil
}

func verifyOAuthToken(tokenStr string) (jwt.MapClaims, error) {
	jwksURL := "https://" + os.Getenv("AUTH0_DOMAIN") + "/.well-known/jwks.json"
	jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{})
	if err != nil {
		return nil, fiber.NewError(http.StatusInternalServerError, "Failed to load JWKS")
	}

	token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
	if err != nil || !token.Valid {
		return nil, fiber.NewError(http.StatusUnauthorized, "Invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fiber.NewError(http.StatusInternalServerError, "Invalid claims")
	}

	return claims, nil
}

func findOrCreateUser(claims jwt.MapClaims) (models.User, error) {
	email, ok := claims["email"].(string)
	if !ok || email == "" {
		return models.User{}, fiber.NewError(fiber.StatusBadRequest, "Email not found in token")
	}

	var user models.User
	err := database.UsersCollection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err == nil {
		return user, nil
	}

	user = models.User{
		Email: email,
		Name:  claims["name"].(string),
	}

	res, err := database.UsersCollection.InsertOne(context.Background(), user)
	if err != nil {
		return models.User{}, fiber.NewError(fiber.StatusInternalServerError, "Ошибка создания пользователя")
	}
	user.ID = res.InsertedID.(primitive.ObjectID)
	return user, nil
}
