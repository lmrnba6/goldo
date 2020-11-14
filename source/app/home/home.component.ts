import {Component, OnInit} from '@angular/core';
import './home.component.scss';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import {Product} from "../model/product";
import {Transaction} from "../model/transaction";
import {Buy} from "../model/buy";
import {AuthenticationService} from "../_services/authentication.service";
import moment = require("moment");
import {Router} from "@angular/router";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

    logo = '';
    data: any;
    date: string;
    setting: AbstractTableSetting;
    days: Array<string>;
    filter: string;
    clients: number;
    trainings: number
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isTeacher: boolean;
    public isClient: boolean;
    public clientImage = `${this.getPath()}dist/assets/images/clientImage.png`;
    public supplierImage = `${this.getPath()}dist/assets/images/supplierImage.png`;
    public goldImage = `${this.getPath()}dist/assets/images/goldImage.png`;
    public amountImage = `${this.getPath()}dist/assets/images/amountImage.png`;
    public productImage = `${this.getPath()}dist/assets/images/productImage.png`;
    public homeImage = `${this.getPath()}dist/assets/images/homeImage.png`;
    public totalAmount = 0;
    public totalGold = 0;
    public totalAmountBuy = 0;
    public totalGoldBuy = 0;

    constructor(private auth: AuthenticationService, private router: Router) {
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    public toAbs(amount) {
        return Math.abs(amount);
    }

    ngOnInit(): void {
        const exp = localStorage.getItem('expiration');
        if (!this.auth.getCurrentUser().role.includes('super') && exp && moment(Number(exp)).isBefore(moment())) {
            this.auth.logout();
            this.router.navigate(['/login']);
        }
        this.block = true;
        Promise.all([Transaction.getCount(''), Product.getCount('')]).then(
            values => {
                this.clients = (values[0][0] as any).count;
                this.trainings = (values[1][0] as any).count;
                this.block = false;
            });
        this.getSold();
        this.getLogo();
    }

    public getSold(): void {
        this.block = true;
        Promise.all([Transaction.getAll(), Buy.getAll()]).then(
            values => {
                this.block = false;
                this.totalAmount = values[0].reduce((a, b) => Number(a) + Number(b.totalAmount), 0);
                this.totalGold = values[0].reduce((a, b) => Number(a) + Number(b.totalGold), 0);
                this.totalAmountBuy = values[1].reduce((a, b) => Number(a) + Number(b.totalAmount), 0);
                this.totalGoldBuy = values[1].reduce((a, b) => Number(a) + Number(b.totalGold), 0);
            });
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    getLogo() {
        this.logo = '../../dist/assets/images/goldo.png';
    }

}
