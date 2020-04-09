CREATE TABLE IF NOT EXISTS pizzas (
	id text PRIMARY KEY
	,name text
    ,toppings text
    ,img text
    ,username text
    ,created bigint
    ,createdAt timestamptz
    ,updatedAt timestamptz
);