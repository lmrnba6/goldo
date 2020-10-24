import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './transaction.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Transaction} from "../model/transaction";
import {Client} from "../model/client";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit, OnChanges {

    @Input() public client: Client;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public transaction: Transaction;
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
    public totalGold = 0;
    public totalAmount = 0;
    public amountImage = `${this.getPath()}dist/assets/images/amountImage.png`;
    public goldImage = `${this.getPath()}dist/assets/images/goldImage.png`;
    public homeImage = `${this.getPath()}dist/assets/images/homeImage.png`;
    public clientImage = `${this.getPath()}dist/assets/images/clientImage.png`;
    public sold: number = 0;

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
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.isUser = this.authService.getCurrentUser().role === 'user';
        this.initSetting();
    }

    ngOnChanges(): void {
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        this.initSetting();
    }


    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([this.client ?
            Transaction.getAllPagedByClient(offset, limit, sort, order, this.client.id) :
            Transaction.getAllPaged(offset, limit, sort, order, filter), this.client ? Transaction.getCountByClient(this.client.id) :
            Transaction.getCount(this.filter)])
            .then(
                values => {
                    this.block = false;
                    this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                    this.totalAmount = values[0].reduce((a,b) => Number(a) + Number(b.totalAmount), 0);
                    this.totalGold = values[0].reduce((a,b) => Number(a) + Number(b.totalGold), 0);
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
    }

    public toAbs(amount) {
        return Math.abs(amount);
    }

    /**
     * sortOnChange
     */
    public sortOnChange(event: any): void {
        this.sortName = event.col;
        this.sortDirection = event.sortDirection.length ? event.sortDirection : 'DESC';
        this.pageIndex = 0;
        this.getDataTable(this.pageIndex, this.pageSize, event.col, event.sortDirection, this.filter);
    }

    /**
     * onPageChange
     */
    public onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = true;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.client;
        this.setting.addRow = this.isUser || this.isAdmin;
        this.setting.cols = [
            {columnDef: 'date', header: 'transaction.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            // {
            //     columnDef: 'amountOut',
            //     header: 'transaction.placeholder.amountOut',
            //     type: 'text',
            //     cell: (row: any) => `${row.amountOut} ${this.translate.instant('transaction.placeholder.dinar')}`
            // },
            {
                columnDef: 'goldIn',
                header: 'transaction.placeholder.goldIn',
                type: 'text',
                cell: (row: any) => `${row.goldIn} ${this.translate.instant('transaction.placeholder.gram')}`
            },
            {
                columnDef: 'goldOut',
                header: 'transaction.placeholder.goldOut',
                type: 'text',
                cell: (row: any) => `${row.goldOut} ${this.translate.instant('transaction.placeholder.gram')}`
            },
            {
                columnDef: 'amountIn',
                header: 'transaction.placeholder.amountIn',
                type: 'text',
                cell: (row: any) => `${row.amountIn} ${this.translate.instant('transaction.placeholder.dinar')}`
            },
            {
                columnDef: 'amountDue',
                header: 'transaction.placeholder.amountDue',
                type: 'text',
                cell: (row: any) => `${row.amountDue} ${this.translate.instant('transaction.placeholder.dinar')}`
            },
            {
                columnDef: 'totalAmount',
                header: 'transaction.placeholder.totalAmount',
                type: 'text',
                cell: (row: any) => `${row.totalAmount} ${this.translate.instant('transaction.placeholder.dinar')}`
            },
            {
                columnDef: 'responsible',
                header: 'user.user',
                type: 'text',
                cell: (row: any) => `${row.responsible}`
            },
        ];
        !this.client && this.setting.cols.unshift({columnDef: 'client', header: 'transaction.placeholder.client', type: 'text', cell: (row: any) => `${row.client}`})
        this.setting.cols.push({
            columnDef: 'settings',
            class: 'a10',
            header: '',
            type: 'settings',
            delete: this.isAdmin,
            editRow: true
        });
    }

    /**
     * init data
     */
    public onRowDeleted(id: number): void {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.remove_row_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    Transaction.get(id).then(() => {
                        this.block = true;
                        Transaction
                            .delete(id)
                            .then(
                                () => {
                                    this.block = false;
                                    this.data = [];
                                    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
                                    this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                                },
                                () => {
                                    this.block = false;
                                    this.messagesService.notifyMessage(this.translate.instant('messages.unable_delete_relation'), '', 'error');
                                }
                            );
                    });
                }
            });
    }


    goBack() {
        this.router.navigate(['transactions']);
    }

    /**
     * add row
     */
    public onAddRow(): void {
        this.router.navigate(this.client ? ['transaction/form-client/' + this.client.id] : ['transaction/form']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Transaction): void {
        this.transaction = event;
        this.router.navigate(this.client ? ['transaction/form-client/' + this.client.id + '/' + event.id] : ['transaction/form/' + event.id]);

    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
