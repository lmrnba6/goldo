import {TheDb} from './thedb';
import {Product} from "./product";

/**
 * class for selecting, inserting, updating and deleting transactionProducts in transactionProduct table.
 *
 * @export
 * @class Transaction
 */
export class TransactionProduct {
    public id = -1;
    public product: number | Product;
    public transaction: number | TransactionProduct;
    public quantity: number;
    public deleted: boolean;
    
    public static getAll(): Promise<TransactionProduct[]> {
        const sql = `SELECT * FROM "transactionProduct" as tr
                        INNER JOIN "transaction" as t on t.id = tr.transaction
                        WHERE t.deleted = false`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const transactionProducts: TransactionProduct[] = [];
                for (const row of rows) {
                    transactionProducts.push(this.toTransaction(row));
                }
                return transactionProducts;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "transactionProduct" ("product", "transaction", "quantity")
            VALUES(${this.product},${this.transaction},${this.quantity})`;

        return TheDb.insert(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transaction to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "transactionProduct"
               SET "product" = ${this.product}, "transaction" = ${this.transaction},"quantity" = ${this.quantity}            
             WHERE id = ${this.id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transaction to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "transactionProduct" WHERE id = ${id}`;
        
        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transaction to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static deleteByTransaction(id: number): Promise<void> {
        const sql = `
            DELETE FROM "transactionProduct" WHERE transaction = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transaction to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static safeDelete(id: number): Promise<void> {
        const sql = `UPDATE "transactionProduct" SET deleted = true  WHERE id = ${id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be deleted. Was ${result.changes}`);
                }
            });
    }


    private static toTransaction = (o: any): TransactionProduct => {
        const transactionProduct: TransactionProduct = new TransactionProduct();
        for(let k in o) transactionProduct[k]=o[k];
        return transactionProduct;
    }

}
