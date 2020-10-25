import {Component, OnInit} from '@angular/core';
import './stats.component.scss';
import {Product} from "../model/product";
import {TransactionProduct} from "../model/transactionProduct";
import moment = require("moment");
import {TranslateService} from "@ngx-translate/core";
import {Transaction} from "../model/transaction";
import {BuyProduct} from "../model/buyProduct";
import {Buy} from "../model/buy";

const Chart = require('chart.js');

@Component({
    selector: 'app-footer',
    templateUrl: './stats.component.html'
})
export class StatsComponent implements OnInit {
    public products: Array<Product> = [];
    public transactionProducts: Array<TransactionProduct> = [];
    public transaction: Array<Transaction> = [];
    public buyProducts: Array<BuyProduct> = [];
    public buy: Array<Buy> = [];
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public productChartColor: Array<{ background: string, border: string }> = [];
    public yearChartColor: Array<{ background: string, border: string }> = [];
    public months: Array<string> = [];
    public yearData: Array<number> = [];
    public total: number = 0;
    public yearDataBuy: Array<number> = [];
    public totalBuy: number = 0;


    constructor(private translate: TranslateService) {
    }

    ngOnInit() {
        this.block = true;
        Promise.all([Product.getAll(), TransactionProduct.getAll(), Transaction.getAll(), BuyProduct.getAll(), Buy.getAll()]).then(vals => {
            this.block = false;
            this.products = vals[0];
            this.transactionProducts = vals[1];
            this.transaction = vals[2];
            this.buyProducts = vals[3];
            this.buy = vals[4];
            moment.locale(this.translate.currentLang); // sets words language (optional if current locale is to be used)
            this.months = moment.months();
            this.productChartColor = this.products.map(() => this.randomRgba());
            this.yearChartColor = this.months.map(() => this.randomRgba());
            this.total = this.transactionProducts.reduce((a, b) => Number(a) + Number(b.quantity), 0);
            this.totalBuy = this.buyProducts.reduce((a, b) => Number(a) + Number(b.quantity), 0);
            this.getYearData();
            this.getYearDataBuy();
            this.chart();
        }, () => {
            this.block = false;
        });
    }

    getYearData() {
        for (let i = 0; i < 12; ++i) {
            const transactions: Array<Transaction> = this.transaction.filter(t => new Date(Number(t.date)).getMonth() === i);
            const q = transactions.reduce((a, b) => Number(a) + Number(b.goldOut), 0)
            this.yearData.push(Number(q));
        }
    }

    getYearDataBuy() {
        for (let i = 0; i < 12; ++i) {
            const transactions: Array<Buy> = this.buy.filter(t => new Date(Number(t.date)).getMonth() === i);
            const q = transactions.reduce((a, b) => Number(a) + Number(b.goldIn), 0)
            this.yearDataBuy.push(Number(q));
        }
    }

    randomRgba() {
        const o = Math.round, r = Math.random, s = 255;
        return {
            background: 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.7 + ')',
            border: 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 1 + ')'
        };
    }

    chart() {
        const total = document.getElementById('total');
        const product = document.getElementById('product');
        const totalBuy = document.getElementById('totalBuy');
        const productBuy = document.getElementById('productBuy');

        new Chart(product, {
            type: 'bar',
            data: {
                labels: this.products.map(p => p.name),
                datasets: [{
                    data: this.products.map(p => this.transactionProducts.reduce((a, b) =>
                        Number(a) + Number(b.product === p.id ? b.quantity : 0), 0)),
                    backgroundColor: this.productChartColor.map(c => c.background),
                    borderColor: this.productChartColor.map(c => c.background),
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: this.translate.instant('product.product')
                }
            }
        });

        new Chart(total, {
            type: 'bar',
            data: {
                labels: this.months,
                datasets: [{
                    data: this.yearData,
                    backgroundColor: this.yearChartColor.map(c => c.background),
                    borderColor: this.yearChartColor.map(c => c.background),
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: this.translate.instant('product.year')
                }
            }
        });

        new Chart(productBuy, {
            type: 'bar',
            data: {
                labels: this.products.map(p => p.name),
                datasets: [{
                    data: this.products.map(p => this.buyProducts.reduce((a, b) =>
                        Number(a) + Number(b.product === p.id ? b.quantity : 0), 0)),
                    backgroundColor: this.productChartColor.map(c => c.background),
                    borderColor: this.productChartColor.map(c => c.background),
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: this.translate.instant('product.product')
                }
            }
        });

        new Chart(totalBuy, {
            type: 'bar',
            data: {
                labels: this.months,
                datasets: [{
                    data: this.yearDataBuy,
                    backgroundColor: this.yearChartColor.map(c => c.background),
                    borderColor: this.yearChartColor.map(c => c.background),
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: this.translate.instant('product.year')
                }
            }
        });
    }

}
