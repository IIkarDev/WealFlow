package middleware

import (
	"errors"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"os"
	"strconv"
	"time"
)

func CreateToken(userID primitive.ObjectID, secret string) (string, error) {
	var duration int
	if secret == os.Getenv("ACCESS_SECRET") {
		duration, _ = strconv.Atoi(os.Getenv("ACCESS_EXPIRE_MINUTES"))
	} else {
		duration, _ = strconv.Atoi(os.Getenv("REFRESH_EXPIRE_HOURS"))
		duration *= 60
	}
	claims := jwt.MapClaims{
		"sub": userID.Hex(),
		"exp": time.Now().Add(time.Minute * time.Duration(duration)).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func SetAuthCookies(c *fiber.Ctx, key string, token string) {
	isSecure := false
	sameSite := "Lax"
	if os.Getenv("ENV") == "production" {
		isSecure = true
		sameSite = "None"
	}
	c.Cookie(&fiber.Cookie{
		Name:     key,
		Value:    token,
		HTTPOnly: true,
		Secure:   isSecure,
		SameSite: sameSite,
		Domain:   os.Getenv("COOKIE_DOMAIN"),
		Path:     "/",
	})
}

func ValidateToken(tokenStr string, secret string) (string, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		fmt.Println(err)
		return "", errors.New("Пользователь не авторизован или недопустимый токен")
	}
	sub, ok := claims["sub"].(string)
	if !ok {
		return "", errors.New("Недопустимый токен")
	}
	return sub, nil
}
