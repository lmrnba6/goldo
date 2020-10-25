import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './comment.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {AuthenticationService} from "../_services/authentication.service";
import {Client} from "../model/client";
import {Comment} from "../model/comment";
import {Supplier} from "../model/supplier";
import {Employee} from "../model/employee";

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
})
export class CommentComponent implements OnInit, OnChanges {

    @Input() public client: Client;
    @Input() public supplier: Supplier;
    @Input() public employee: Employee;
    public filter: string = '';
    public data: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public comment: Comment;
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

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.isUser = this.authService.getCurrentUser().role === 'user';
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
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
        Promise.all([
            this.client ? Comment.getAllClientPaged(offset, limit, sort, order, filter, this.client.id) :
            this.supplier ? Comment.getAllSupplierPaged(offset, limit, sort, order, filter, this.supplier.id) :
            this.employee ? Comment.getAllEmployeePaged(offset, limit, sort, order, filter, this.employee.id) :
                Comment.getAll(),
            this.client ? Comment.getClientCount(this.filter, this.client.id) :
            this.supplier ? Comment.getSupplierCount(this.filter, this.supplier.id) :
            this.employee ? Comment.getEmployeeCount(this.filter, this.employee.id) :
                Comment.getCount(this.filter)])
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
        this.sortDirection = event.sortDirection.length ? event.sortDirection : 'ASC';
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
        this.setting.settingColumn = true;;
        this.setting.tableName = this.tableName;
        this.setting.filter = true;
        this.setting.addRow = this.isAdmin || this.isUser;
        this.setting.cols = [
            {columnDef: 'date', header: 'comment.placeholder.date', type: 'date', cell: (row: any) => `0${row.date}`},
            {columnDef: 'comment', header: 'comment.placeholder.comment', type: 'text', cell: (row: any) => `${row.comment}`},
            {columnDef: 'settings',class: 'a10', header: '', type: 'settings', delete: this.isAdmin, editRow: true}
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
                    Comment
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
                }
            });
    }

    /**
     * add row
     */
    public onAddRow(): void {
        this.router.navigate(['comment/' +
        (this.client ? 'form-client/' :
            this.supplier ? 'form-supplier/' :
                this.employee ? 'form-employee/' : 'from') +
        (this.client ? this.client.id :
            this.supplier ? this.supplier.id :
                this.employee ? this.employee.id : 0)]);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Comment): void {
        this.comment = event;
        this.router.navigate(['comment/'+ (this.client ? 'form-client/' :
            this.supplier ? 'form-supplier/' :
                this.employee ? 'form-employee/' : 'from') +
        (this.client ? this.client.id :
            this.supplier ? this.supplier.id :
                this.employee ? this.employee.id : 0) + '/' + event.id]);
    }

    onFilter(filter: string) {
        this.filter = filter;
        this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    }

}
