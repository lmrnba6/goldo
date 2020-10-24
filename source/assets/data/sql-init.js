export const sqlInit =
    `CREATE TABLE IF NOT EXISTS "user" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "username"	TEXT NOT NULL UNIQUE,
    "password"	TEXT NOT NULL,
    "role"	TEXT NOT NULL,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "product" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "description"	TEXT,
    "category"  TEXT NOT NULL,
    "price"	INTEGER NOT NULL,
    "quantity"	INTEGER NOT NULL,
    "photo" TEXT,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "client" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "address"	TEXT,
    "phone"	TEXT NOT NULL,
    "phone2"	TEXT,
    "photo"	TEXT,
    "blocked"	BOOLEAN NOT NULL,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "employee" (
    "id"	SERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "address"	TEXT,
    "phone"	TEXT NOT NULL,
    "phone2"	TEXT,
    "photo"	TEXT,
    "blocked"	BOOLEAN NOT NULL,
    "sold" NUMERIC,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "payment" (
    "id"	SERIAL NOT NULL,
    "amount"	NUMERIC NOT NULL,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "error"  BOOLEAN,
    "employee"	INTEGER NOT NULL,
    "responsible"	INTEGER NOT NULL,
    FOREIGN KEY(employee) REFERENCES "employee"(id),
    FOREIGN KEY(responsible) REFERENCES "user"(id),
    PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "register" (
    "id"	SERIAL NOT NULL,
    "amount"	NUMERIC NOT NULL,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "error"  BOOLEAN,
    "responsible"	INTEGER NOT NULL,
    FOREIGN KEY(responsible) REFERENCES "user"(id),
    PRIMARY KEY("id")
);
  
    CREATE TABLE IF NOT EXISTS "comment" (
    "id"	SERIAL NOT NULL,
    "comment"	TEXT NOT NULL,
    "date"  TEXT NOT NULL,
    "client"	INTEGER NOT NULL,
    FOREIGN KEY(client) REFERENCES "client"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "transaction" (
    "id"	SERIAL NOT NULL,
    "goldIn"	NUMERIC NOT NULL,
    "amountIn"	NUMERIC NOT NULL,
    "goldOut"	NUMERIC NOT NULL,
    "amountOut"	NUMERIC NOT NULL,
    "amountDue"	NUMERIC NOT NULL,
    "totalAmount"	NUMERIC NOT NULL,
    "totalGold"	NUMERIC NOT NULL,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "client"	INTEGER NOT NULL,
    "responsible"	INTEGER NOT NULL,
    FOREIGN KEY(client) REFERENCES "client"(id),
    FOREIGN KEY(responsible) REFERENCES "user"(id),
    PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "transactionProduct" (
    "id" SERIAL NOT NULL,
    "product" INTEGER NOT NULL,
    "transaction" INTEGER NOT NULL,
    "quantity"  NUMERIC NOT NULL,
    FOREIGN KEY(transaction) REFERENCES "transaction"(id),
    FOREIGN KEY(product) REFERENCES "product"(id),
    PRIMARY KEY("id")
);
`


