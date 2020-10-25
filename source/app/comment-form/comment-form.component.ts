import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './comment-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Comment} from "../model/comment";
import {Client} from "../model/client";
import {Supplier} from "../model/supplier";
import {Employee} from "../model/employee";

@Component({
    selector: 'app-comment-form',
    templateUrl: './comment-form.component.html',
})
export class CommentFormComponent implements OnInit, OnChanges {

    @Input() public comment: Comment;
    public block: boolean;
    public isOnEdit: boolean;
    public commentForm: FormGroup;
    public comments: FormControl;
    public date: FormControl;
    public client: Client;
    public supplier: Supplier;
    public employee: Employee;

    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public  photo: any;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService,
                private route: ActivatedRoute,
    ) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
    }

    public ngOnChanges() {
        this.initForm();
        this.getParams();
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else {
                this.isOnEdit = false;
                this.comment = new Comment();
                this.comment.date = new Date();
            }
            if(res.client) {
                this.getClient(res.client);
            }
            if(res.supplier) {
                this.getSupplier(res.supplier);
            }
            if(res.employee) {
                this.getEmployee(res.employee);
            }
        });
    }

    public getClient(id: number): void {
        Client
            .get(id)
            .then(val => {
                this.client = val;
            });
    }

    public getSupplier(id: number): void {
        Supplier
            .get(id)
            .then(val => {
                this.supplier = val;
            });
    }

    public getEmployee(id: number): void {
        Employee
            .get(id)
            .then(val => {
                this.employee = val;
            });
    }

    /**
     * get data
     *
     * @param  {string} name comment name
     * @returns void
     */
    public getData(id: number): void {
        Comment
            .get(id)
            .then(val => {
                this.comment = val;
                this.comment.date = new Date(Number(this.comment.date));
            });
    }

    public initForm(): void {
        this.comments = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);

        this.commentForm = this.fb.group({
            comments: this.comments,
            date: this.date,
        });
        this.commentForm.controls['date'].disable();
    }

    /**
     * onSave
     */
    public onSave(): void {
        this.onSaveOrUpdate();
    }


    /**
     * onSave
     */
    public onSaveOrUpdate(): void {
        this.comment.date = (this.comment.date as Date).getTime();
        if(this.client) {
            (this.comment.client as any) = this.client.id;
        }
        if(this.supplier) {
            (this.comment.supplier as any) = this.supplier.id;
        }
        if(this.employee) {
            (this.comment.employee as any) = this.employee.id;
        }
        let clientPromise: Promise<any>;
        if (this.isOnEdit) {
            clientPromise = this.comment.update();
        } else {
            clientPromise = this.comment.insert();
        }

    clientPromise.then(
        () => {
            this.block = false;
            this.goBack();
            this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
        },
        () => {
            this.comment.date = new Date(this.comment.date);
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });

    }

    goBack() {
        this.router.navigate([(this.client ? 'client-management/' :
            this.supplier ? 'supplier-management/' :
                this.employee ? 'employee-management/' : '') +
        (this.client ? this.client.id :
            this.supplier ? this.supplier.id :
                this.employee ? this.employee.id : 0) + '/' +  2]);
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }
}
