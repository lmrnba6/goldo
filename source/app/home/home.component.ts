import {Component, OnInit} from '@angular/core';
import './home.component.scss';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import {Product} from "../model/product";
import {Transaction} from "../model/transaction";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

    logo = '';
    data: any;
    date: string;
    setting: AbstractTableSetting;
    session: Product;
    days: Array<string>;
    filter: string;
    clients: number;
    instructors: number;
    trainings: number
    sessions: number;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isTeacher: boolean;
    public isClient: boolean;
    public clientImage = `${this.getPath()}dist/assets/images/clientImage.png`;
    public goldImage = `${this.getPath()}dist/assets/images/goldImage.png`;
    public amountImage = `${this.getPath()}dist/assets/images/amountImage.png`;
    public productImage = `${this.getPath()}dist/assets/images/productImage.png`;
    public homeImage = `${this.getPath()}dist/assets/images/homeImage.png`;
    public totalAmount = 0;
    public totalGold = 0;
    constructor() {}

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    public toAbs(amount) {
        return Math.abs(amount);
    }

    ngOnInit(): void {
        this.block = true;
        Promise.all([Transaction.getCount(''), Product.getCount('')]).then(
            values => {
                this.clients = (values[0][0] as any).count;
                this.trainings = (values[1][0] as any).count;
                this.block = false;
            });
        this.getSold();
        this.initSetting();
        this.getLogo();
    }

    public getSold(): void {
        this.block = true;
            Transaction.getAll().then(
                values => {
                    this.block = false;
                    this.totalAmount = values.reduce((a,b) => Number(a) + Number(b.totalAmount), 0);
                    this.totalGold = values.reduce((a,b) => Number(a) + Number(b.totalGold), 0);
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

    toDay() {
        let a = new Date();
        let weekdays = new Array(7);
        weekdays[0] = "sunday";
        weekdays[1] = "monday";
        weekdays[2] = "tuesday";
        weekdays[3] = "wednesday";
        weekdays[4] = "thursday";
        weekdays[5] = "friday";
        weekdays[6] = "saturday";
        this.days =weekdays;
        this.date = weekdays[a.getDay()];
        return weekdays[a.getDay()];
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = false;
        this.setting.filter = false;
        this.setting.paging = false;
        this.setting.addRow = false;
        this.setting.hideHeader = true;
        this.setting.tools = false;
        this.setting.cols = [
            {columnDef: 'time', class:'a25', header: 'weekday.placeholder.time', type: 'text', cell: (row: any) => `${row.time}`},
            {columnDef: 'name', class:'a75', header: 'weekday.title', type: 'html', cell: (row: any) => `${this.handleLines(row.name)}`},
        ];
    }

    handleLines(text: string) {
        text = text || '';
        const list = text.split('---');
        const s = list.reduce((a,b) => {
            a = a + `<li class="timeTable">${b}</li>`; return a
        },'')
        return `<ul>${s}</ul>`
    }

}
