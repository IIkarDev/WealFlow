package database

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson" // Для описания индекса
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref" // Для Ping
	"log"
	"os"
	"time"
)

var TransactionsCollection *mongo.Collection
var UsersCollection *mongo.Collection

func MongoDBConnection() *mongo.Client {
	MONGODB_URI := os.Getenv("MONGODB_URI")
	if MONGODB_URI == "" {
		log.Fatal("Переменная окружения MONGODB_URI не установлена.")
	}

	clientOptions := options.Client().ApplyURI(MONGODB_URI)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal("Ошибка подключения к MongoDB:", err)
	}

	// Ping для проверки соединения
	err = client.Ping(context.Background(), readpref.Primary())
	if err != nil {
		log.Fatal("Не удалось выполнить пинг MongoDB:", err)
	}

	fmt.Println("Успешное подключение к MongoDB.")

	dbName := "golang_db"
	db := client.Database(dbName)
	TransactionsCollection = db.Collection("transactions")
	UsersCollection = db.Collection("users")

	// --- Начало кода для создания индекса ---
	fmt.Printf("Попытка создания индекса для коллекции '%s' в базе данных '%s'...\n", "transactions", dbName)
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "userId", Value: 1}}, // Индекс по userId, порядок возрастания
		Options: options.Index().SetName("user_id_index"),
	}

	// Устанавливаем таймаут для операции создания индекса, на всякий случай
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second) // 15 секунд таймаут
	defer cancel()

	indexName, err := TransactionsCollection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		log.Printf("Предупреждение: не удалось создать индекс 'userId_index' для коллекции 'transactions' (возможно, он уже существует или возникла другая ошибка): %v\n", err)
	} else {
		fmt.Printf("Индекс '%s' по полю 'userId' для коллекции 'transactions' успешно создан или уже существовал.\n", indexName)
	}

	return client
}
