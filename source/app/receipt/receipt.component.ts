import {Component, OnInit} from '@angular/core';
import './receipt.component.scss';
import {ActivatedRoute, Router} from "@angular/router";
import {Payment} from "../model/payment";
import {Transaction} from "../model/transaction";
import {Buy} from "../model/buy";
import {Product} from "../model/product";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html'
})
export class ReceiptComponent implements OnInit {
    receiptName: string;
    id: number;
    date: Date = new Date;
    title: string;
    center: string;
    public products: Array<Product> = [];
    payment: Payment;
    transaction: Transaction;
    buy: Buy;
    payment_code: string;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
    ) {}


    ngOnInit() {
        this.payment_code = new Date().getTime().toString();
        this.title = this.translate.instant('receipt.receipt');
        this.center = 'Goldo';
        this.getParams();
    }

    toDate(d: number) {
        return new Date(Number(d));
    }

    capitalize(s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            this.receiptName = res.name;
            this.id = res.id;
            this.getData();
        });
    }

    getData() {
        if(this.receiptName === 'transaction'){
            Promise.all([Product.getAllByTransaction(this.id), Transaction.get(this.id)]).then(vals =>{
                this.products = vals[0];
                this.transaction = vals[1];
            });
        }
        if(this.receiptName === 'buy'){
            Promise.all([Product.getAllByBuy(this.id), Buy.get(this.id)]).then(vals =>{
                this.products = vals[0];
                this.buy = vals[1];
            });
        }
        if(this.receiptName === 'payment'){
            Payment.get(this.id).then(p => this.payment = p);
        }
    }

    print() {
        let modal = window.open('', 'modal');
        modal!.document.write(document.getElementById('receipt')!.outerHTML );
        modal!.document.close();
        setTimeout(() => {modal!.print();}, 100);
    }

    goBack() {
        this.router.navigate([this.receiptName === 'transaction' || this.receiptName === 'buy' ? this.receiptName : ('employee-management/' + this.payment.employee + '/1')]);
    }
    

}


