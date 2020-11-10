import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './payment.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Payment} from "../model/payment";
import {Employee} from "../model/employee";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit, OnChanges {

    @Input() public employee: Employee;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public payment: Payment;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
    public isAdmin: boolean;
    public isUser: boolean;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService,
    ) {
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    ngOnInit(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.isUser = this.authService.getCurrentUser().role === 'user';
        this.initSetting();
    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
        this.initSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([
            Payment.getAllPaged(offset, limit, sort, order, this.employee.id),
            Payment.getCountByEmployee(this.employee.id)])
            .then(
                values => {
                    this.block = false;
                    this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
    }


    /**
     * sortOnChange
     */
    public sortOnChange(event: any): void {
        this.sortName = event.col;
        this.sortDirection = event.sortDirection.length ? event.sortDirection : 'DESC';
        this.pageIndex = 0;
        this.getDataTable(this.pageIndex, this.pageSize, event.col, event.sortDirection);
    }

    /**
     * onPageChange
     */
    public onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = true;
        this.setting.tableName = this.tableName;
        this.setting.filter = false;
        this.setting.addRow = true;
        this.setting.cols = [
            {columnDef: 'date', header: 'payment.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {
                columnDef: 'amount',
                header: 'payment.placeholder.amount',
                type: 'text',
                cell: (row: any) => `${Number(row.amount).toFixed(0)} ${this.translate.instant('transaction.placeholder.dinar')}`
            },
            {
                columnDef: 'comment',
                header: 'payment.placeholder.comment',
                type: 'text',
                cell: (row: any) => `${row.comment}`
            },
            {
                columnDef: 'responsible',
                header: 'payment.placeholder.responsible',
                type: 'text',
                cell: (row: any) => `${row.responsible}`
            },
            {
                columnDef: 'settings',
                class: 'a20',
                header: '',
                type: 'settings',
                delete: true,
                editRow: true,
                print: true
            }
        ];
    }

    /**
     * init data
     */
    public onRowDeleted(id: number): void {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.remove_row_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    this.block = true;
                    Payment
                        .safeDelete(id)
                        .then(
                            () => {
                                this.block = false;
                                this.data = [];
                                this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
                                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                            },
                            () => {
                                this.block = false;
                                this.messagesService.notifyMessage(this.translate.instant('messages.unable_delete_relation'), '', 'error');
                            }
                        );
                }
            });
    }


    goBack() {
        this.router.navigate(['payments']);
    }


    /**
     * add row
     */
    public onAddRow(): void {
        this.router.navigate(['payment/form/' + this.employee.id]);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Payment): void {
        this.payment = event;
        this.router.navigate(['payment/form/' + this.employee.id + '/' + event.id]);

    }

    public onPrintRow(event: Payment) {
        this.router.navigate(['receipt/payment/' + event.id])
    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection);
    }

}
