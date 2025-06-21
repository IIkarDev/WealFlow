package transactions

import (
	"context"
	"github.com/IIkar/WealFlow/2025/database"
	"github.com/IIkar/WealFlow/2025/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"time"
)

// GetTransactions godoc
// @Summary Получить список транзакций
// @Tags transactions
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {array} models.Transaction
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/transactions [get]
func GetTransactions(c *fiber.Ctx) error {

	userID, err := primitive.ObjectIDFromHex(c.Locals("userID").(string))
	if userID == primitive.NilObjectID {
		log.Printf("Ошибка токена: %v\n")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Действующий токен не найден"})
	}

	var transactions []models.Transaction // Слайс для хранения найденных транзакций

	// Выполняем поиск всех документов в коллекции
	filter := bson.M{"user_id": userID}
	cursor, err := database.TransactionsCollection.Find(context.Background(), filter)
	if err != nil {
		log.Printf("Ошибка при поиске транзакций: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось получить транзакции"})
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		err := cursor.Close(ctx)
		if err != nil {

		}
	}(cursor, context.Background()) // Важно закрыть курсор

	// Итерируем по курсору и декодируем каждую транзакцию
	for cursor.Next(context.Background()) {
		var transaction models.Transaction
		if err := cursor.Decode(&transaction); err != nil {
			log.Printf("Ошибка декодирования транзакции: %v\n", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Ошибка декодирования транзакции"})
		}
		transactions = append(transactions, transaction)
	}

	// Проверяем наличие ошибок во время итерации по курсору
	if err := cursor.Err(); err != nil {
		log.Printf("Ошибка курсора: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Ошибка при итерации курсора"})
	}

	// Возвращаем список транзакций в формате JSON
	return c.JSON(transactions)
}

// PostTransaction godoc
// @Summary Создать новую транзакцию
// @Tags transactions
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param transaction body models.Transaction true "Данные транзакции"
// @Success 201 {object} models.Transaction
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/transactions [post]
func PostTransaction(c *fiber.Ctx) error {

	userID := c.Locals("userID").(string)
	if userID == "" {
		log.Printf("Ошибка токена: %v\n")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Действующий токен не найден"})
	}

	transaction := new(models.Transaction) // Создаем указатель на новую структуру Transaction

	// Парсим тело запроса в структуру transaction
	if err := c.BodyParser(transaction); err != nil {
		log.Printf("Ошибка парсинга тела запроса: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Некорректный формат JSON"})
	}

	// Простая валидация полей
	if transaction.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Поле 'description' обязательно"})
	}
	if transaction.Category == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Поле 'category' обязательно"})
	}

	transaction.UserID, _ = primitive.ObjectIDFromHex(userID)

	// Если дата не передана клиентом, устанавливаем текущую дату и время
	if transaction.Date == 0 { // primitive.DateTime это int64, 0 - его нулевое значение
		transaction.Date = primitive.NewDateTimeFromTime(time.Now())
	}

	insertRes, err := database.TransactionsCollection.InsertOne(context.Background(), transaction)
	if err != nil {
		log.Printf("Ошибка вставки транзакции: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось создать транзакцию"})
	}

	// Присваиваем сгенерированный ID обратно в структуру для ответа клиенту
	transaction.ID = insertRes.InsertedID.(primitive.ObjectID)

	// Возвращаем созданную транзакцию со статусом 201 Created
	return c.Status(fiber.StatusCreated).JSON(transaction)
}

// UpdateTransaction godoc
// @Summary Обновить транзакцию
// @Tags transactions
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path string true "ID транзакции"
// @Param update body map[string]interface{} true "Обновляемые поля"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/transactions/{id} [patch]
func UpdateTransaction(c *fiber.Ctx) error {
	userStr := c.Locals("userID").(string)
	if userStr == "" {
		log.Printf("Ошибка токена: %v\n")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Действующий токен не найден"})
	}
	userID, _ := primitive.ObjectIDFromHex(userStr)

	id := c.Params("id") // Получаем ID из параметров пути
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Неверный формат ID"})
	}

	// Для частичного обновления (PATCH) считываем тело запроса в map[string]interface{}
	// Это позволяет обновлять только те поля, которые были переданы клиентом.
	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Некорректный формат JSON: " + err.Error()})
	}

	delete(updates, "id")
	delete(updates, "_id")
	delete(updates, "user_id")

	// Специальная обработка для поля "date", если оно передано как строка
	if dateStr, ok := updates["date"].(string); ok {

		parsedTime, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Неверный формат даты. Используйте ISO 8601 (YYYY-MM-DDTHH:MM:SSZ): " + err.Error()})
		}
		updates["date"] = primitive.NewDateTimeFromTime(parsedTime) // Преобразуем в тип MongoDB
	} else if _, ok := updates["date"]; ok && updates["date"] != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Поле 'date', если передано, должно быть строкой в формате ISO 8601"})
	}

	// Проверяем, есть ли вообще что обновлять
	if len(updates) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Нет полей для обновления"})
	}

	// Фильтр для поиска документа по ID
	filter := bson.M{"_id": objectID, "user_id": userID}
	// Документ для обновления с оператором $set
	updateDoc := bson.M{"$set": updates}

	// Выполняем операцию обновления одного документа
	result, err := database.TransactionsCollection.UpdateOne(context.Background(), filter, updateDoc)
	if err != nil {
		log.Printf("Ошибка обновления транзакции: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось обновить транзакцию"})
	}

	// Проверяем, был ли найден документ для обновления
	if result.MatchedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Транзакция не найдена"})
	}
	// Проверяем, были ли применены изменения (может быть 0, если данные идентичны)
	if result.ModifiedCount == 0 && result.MatchedCount == 1 {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Транзакция найдена, но изменения не применены (данные могут быть идентичны)"})
	}

	// Возвращаем сообщение об успехе
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": "Транзакция успешно обновлена"})
}

// DeleteTransaction godoc
// @Summary Удалить транзакцию
// @Tags transactions
// @Security ApiKeyAuth
// @Produce json
// @Param id path string true "ID транзакции"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/transactions/{id} [delete]
func DeleteTransaction(c *fiber.Ctx) error {
	userStr := c.Locals("userID").(string)
	if userStr == "" {
		log.Printf("Ошибка токена: %v\n")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Действующий токен не найден"})
	}
	userID, _ := primitive.ObjectIDFromHex(userStr)

	id := c.Params("id") // Получаем ID из параметров пути
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Неверный формат ID"})
	}

	// Фильтр для поиска документа по ID
	filter := bson.M{"_id": objectID, "user_id": userID} // <--- ВАЖНО: проверяем и ID транзакции, и UserID

	// Выполняем операцию удаления одного документа
	result, err := database.TransactionsCollection.DeleteOne(context.Background(), filter)
	if err != nil {
		log.Printf("Ошибка удаления транзакции: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось удалить транзакцию"})
	}

	// Проверяем, был ли удален какой-либо документ
	if result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Транзакция не найдена для удаления"})
	}

	// Возвращаем сообщение об успехе
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": "Транзакция успешно удалена"})
}
