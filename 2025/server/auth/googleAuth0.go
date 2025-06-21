package auth

import (
	"context"
	"fmt"
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

// OAuthCallback godoc
// @Summary Вход через Google OAuth
// @Tags auth
// @Accept json
// @Produce json
// @Param token body map[string]string true "OAuth token от Auth0"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/auth/google [post]
func OAuthCallback(c *fiber.Ctx) error {

	tokenStr, err := extractTokenFromBody(c)
	if err != nil {
		fmt.Println("OAuthCallback: ошибка при извлечении токена из тела запроса:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	claims, err := verifyOAuthToken(tokenStr)
	if err != nil {
		fmt.Println("OAuthCallback: ошибка валидации OAuth токена:", err)
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	user, message, err := findOrCreateUser(claims)
	if err != nil {
		fmt.Println("OAuthCallback: ошибка при поиске или создании пользователя:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if user.ID.IsZero() {
		fmt.Println("OAuthCallback: получен пустой ID пользователя")
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "User ID is invalid"})
	}

	accessToken, err := middleware.CreateToken(user.ID, os.Getenv("ACCESS_SECRET"))
	if err != nil {
		fmt.Println("OAuthCallback: ошибка генерации access токена:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось создать токен"})
	}

	middleware.SetAuthCookies(c, "access_token", accessToken)

	return c.JSON(fiber.Map{"success": true, "message": message})
}

func extractTokenFromBody(c *fiber.Ctx) (string, error) {
	var body struct {
		Token string `json:"token"`
	}
	if err := c.BodyParser(&body); err != nil || body.Token == "" {
		fmt.Println("extractTokenFromBody: ошибка парсинга тела запроса или пустой токен")
		return "", fiber.NewError(fiber.StatusBadRequest, "Token is required")
	}
	fmt.Println("extractTokenFromBody: токен получен из тела запроса")
	return body.Token, nil
}

func verifyOAuthToken(tokenStr string) (jwt.MapClaims, error) {
	fmt.Println("verifyOAuthToken: начало верификации токена")
	jwksURL := "https://" + os.Getenv("AUTH0_DOMAIN") + "/.well-known/jwks.json"
	jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{})
	if err != nil {
		fmt.Println("verifyOAuthToken: ошибка загрузки JWKS:", err)
		return nil, fiber.NewError(http.StatusInternalServerError, "Failed to load JWKS")
	}

	token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
	if err != nil || !token.Valid {
		fmt.Println("verifyOAuthToken: токен невалидный:", err)
		return nil, fiber.NewError(http.StatusUnauthorized, "Invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		fmt.Println("verifyOAuthToken: claims не удалось привести к MapClaims")
		return nil, fiber.NewError(http.StatusInternalServerError, "Invalid claims")
	}
	fmt.Println("verifyOAuthToken: токен успешно верифицирован")

	return claims, nil
}

func findOrCreateUser(claims jwt.MapClaims) (models.User, string, error) {
	fmt.Println("findOrCreateUser: начало поиска или создания пользователя")

	email, ok := claims["email"].(string)
	if !ok || email == "" {
		fmt.Println("findOrCreateUser: email отсутствует в claims")
		return models.User{}, "Ошибка входа", fiber.NewError(fiber.StatusBadRequest, "Email not found in token")
	}

	var user models.User
	filter := bson.M{"email": email, "provider": "google"}
	err := database.UsersCollection.FindOne(context.Background(), filter).Decode(&user)
	if err == nil {
		fmt.Printf("findOrCreateUser: пользователь найден: %+v\n", user)
		return user, "Пользователь " + user.Name + " успешно авторизован", nil
	}
	fmt.Println("findOrCreateUser: пользователь не найден, создаю нового")

	user = models.User{
		Email:    email,
		Name:     claims["name"].(string),
		Provider: "google",
	}

	res, err := database.UsersCollection.InsertOne(context.Background(), user)
	if err != nil {
		fmt.Println("findOrCreateUser: ошибка создания пользователя:", err)
		return models.User{}, "Ошибка входа", fiber.NewError(fiber.StatusInternalServerError, "Ошибка создания пользователя")
	}
	err = database.UsersCollection.FindOne(context.Background(), filter).Decode(&user)
	if err == nil {
		fmt.Printf("findOrCreateUser: пользователь найден: %+v\n", user)
		return user, "Пользователь " + user.Name + " успешно авторизован", nil
	}
	user.ID = res.InsertedID.(primitive.ObjectID)

	fmt.Printf("findOrCreateUser: пользователь создан: %+v\n", user)
	return user, "Пользователь " + user.Name + " успешно создан", nil
}
