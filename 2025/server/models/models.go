package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name     string             `json:"name"`
	Email    string             `json:"email"`
	Password []byte             `json:"password"`
}

type Transaction struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"` // Уникальный идентификатор, `_id` для MongoDB
	UserID      primitive.ObjectID `json:"user_id,omitempty" bson:"user_id,omitempty"`
	Date        primitive.DateTime `json:"date,omitempty" bson:"date,omitempty"`               // Дата транзакции
	Description string             `json:"description,omitempty" bson:"description,omitempty"` // Описание
	Category    string             `json:"category,omitempty" bson:"category,omitempty"`       // Категория
	Amount      float64            `json:"amount,omitempty" bson:"amount,omitempty"`           // Сумма
	Type        bool               `json:"type,omitempty" bson:"type,omitempty"`               // Тип: true - доход, false - расход
}
