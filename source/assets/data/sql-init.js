export const sqlInit =
    `CREATE TABLE IF NOT EXISTS "user" (
    "id"	BIGSERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "username"	TEXT NOT NULL UNIQUE,
    "password"	TEXT NOT NULL,
    "role"	TEXT NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "product" (
    "id"	BIGSERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "description"	TEXT,
    "category"  TEXT,
    "price"	INTEGER NOT NULL,
    "quantity"	INTEGER,
    "photo" TEXT,
    "deleted" BOOLEAN DEFAULT false,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "client" (
    "id"	BIGSERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "address"	TEXT,
    "phone"	TEXT,
    "phone2"	TEXT,
    "photo"	TEXT,
    "blocked"	BOOLEAN NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "supplier" (
    "id"	BIGSERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "address"	TEXT,
    "phone"	TEXT,
    "phone2"	TEXT,
    "photo"	TEXT,
    "blocked"	BOOLEAN,
    "deleted" BOOLEAN DEFAULT false,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "employee" (
    "id"	BIGSERIAL NOT NULL,
    "name"	TEXT NOT NULL,
    "address"	TEXT,
    "phone"	TEXT,
    "phone2"	TEXT,
    "photo"	TEXT,
    "blocked"	BOOLEAN,
    "sold" NUMERIC,
    "deleted" BOOLEAN DEFAULT false,
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "payment" (
    "id"	BIGSERIAL NOT NULL,
    "amount"	NUMERIC NOT NULL,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "error"  BOOLEAN,
    "employee"	BIGINT NOT NULL,
    "responsible"	BIGINT NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    FOREIGN KEY(employee) REFERENCES "employee"(id),
    FOREIGN KEY(responsible) REFERENCES "user"(id),
    PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "register" (
    "id"	BIGSERIAL NOT NULL,
    "amount"	NUMERIC NOT NULL,
    "date"  TEXT NOT NULL,
    "comment"  TEXT NOT NULL,
    "error"  BOOLEAN,
    "responsible"	BIGINT NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    FOREIGN KEY(responsible) REFERENCES "user"(id),
    PRIMARY KEY("id")
);
  
    CREATE TABLE IF NOT EXISTS "comment" (
    "id"	BIGSERIAL NOT NULL,
    "comment"	TEXT NOT NULL,
    "date"  TEXT NOT NULL,
    "client"	BIGINT,
    "employee"	BIGINT,
    "supplier"	BIGINT,
    "deleted" BOOLEAN DEFAULT false,
    FOREIGN KEY(client) REFERENCES "client"(id),
    FOREIGN KEY(employee) REFERENCES "employee"(id),
    FOREIGN KEY(supplier) REFERENCES "supplier"(id),
    PRIMARY KEY("id")
);

    CREATE TABLE IF NOT EXISTS "transaction" (
    "id"	BIGSERIAL NOT NULL,
    "goldIn"	NUMERIC NOT NULL,
    "amountIn"	NUMERIC NOT NULL,
    "goldOut"	NUMERIC NOT NULL,
    "amountOut"	NUMERIC NOT NULL,
    "amountDue"	NUMERIC NOT NULL,
    "totalAmount"	NUMERIC NOT NULL,
    "totalGold"	NUMERIC NOT NULL,
    "date"  TEXT NOT NULL,
    "comment"  TEXT,
    "type" TEXT,
    "client"	BIGINT NOT NULL,
    "responsible"	BIGINT NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    FOREIGN KEY(client) REFERENCES "client"(id),
    FOREIGN KEY(responsible) REFERENCES "user"(id),
    PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "buy" (
    "id"	BIGSERIAL NOT NULL,
    "goldIn"	NUMERIC NOT NULL,
    "amountIn"	NUMERIC NOT NULL,
    "goldOut"	NUMERIC NOT NULL,
    "amountOut"	NUMERIC NOT NULL,
    "amountDue"	NUMERIC NOT NULL,
    "totalAmount"	NUMERIC NOT NULL,
    "totalGold"	NUMERIC NOT NULL,
    "date"  TEXT NOT NULL,
    "comment"  TEXT,
    "type" TEXT,
    "supplier"	BIGINT NOT NULL,
    "responsible"	BIGINT NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    FOREIGN KEY(supplier) REFERENCES "supplier"(id),
    FOREIGN KEY(responsible) REFERENCES "user"(id),
    PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "transactionProduct" (
    "id" BIGSERIAL NOT NULL,
    "product" BIGINT NOT NULL,
    "transaction" BIGINT NOT NULL,
    "quantity"  NUMERIC NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    FOREIGN KEY(transaction) REFERENCES "transaction"(id),
    FOREIGN KEY(product) REFERENCES "product"(id),
    PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "buyProduct" (
    "id" BIGSERIAL NOT NULL,
    "product" BIGINT NOT NULL,
    "buy" BIGINT NOT NULL,
    "quantity"  NUMERIC NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    FOREIGN KEY(buy) REFERENCES "buy"(id),
    FOREIGN KEY(product) REFERENCES "product"(id),
    PRIMARY KEY("id")
);
`


