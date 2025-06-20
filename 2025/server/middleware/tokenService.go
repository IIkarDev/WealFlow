package middleware

import (
	"errors"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"log"
	"os"
	"strconv"
	"time"
)

func CreateToken(userID primitive.ObjectID, secret string) (string, error) {
	var duration int
	var err error
	if secret == os.Getenv("ACCESS_SECRET") {
		duration, err = strconv.Atoi(os.Getenv("ACCESS_EXPIRE_MINUTES"))
	} else {
		duration, err = strconv.Atoi(os.Getenv("REFRESH_EXPIRE_HOURS"))
		duration *= 60
	}
	if err != nil || duration == 0 {
		return "", errors.New("неверная длительность токена")
	}

	claims := jwt.MapClaims{
		"sub": userID.Hex(),
		"exp": time.Now().Add(time.Minute * time.Duration(duration)).Unix(),
		"iat": time.Now().Unix(),
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

	var duration int
	var err error
	if key == "access_token" {
		duration, err = strconv.Atoi(os.Getenv("ACCESS_EXPIRE_MINUTES"))
	} else {
		duration, err = strconv.Atoi(os.Getenv("REFRESH_EXPIRE_HOURS"))
		duration *= 60
	}
	if err != nil || duration == 0 {
		log.Fatalln("неверная длительность токена: ", err)
	}

	c.Cookie(&fiber.Cookie{
		Name:     key,
		Value:    token,
		HTTPOnly: true,
		Secure:   isSecure,
		SameSite: sameSite,
		Expires:  time.Now().Add(time.Minute * time.Duration(duration)),
		MaxAge:   duration * 60,
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
