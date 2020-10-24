import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Register} from "../model/register";
import './register-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-register-form',
    templateUrl: './register-form.component.html',
})
export class RegisterFormComponent implements OnInit {

    public register: Register;
    public block: boolean;
    public isOnEdit: boolean;
    public registerForm: FormGroup;
    public date: FormControl;
    public amount: FormControl;
    public comment: FormControl;
    public month: FormControl;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public sign: string = '+';

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private auth: AuthenticationService
    ) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    parseAmount(amount: number) {
        this.register.amount = Number(Number(amount).toFixed(0));
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
                if(res.type) {
                    this.sign = res.type
                }
                this.isOnEdit = false;
                this.register = new Register();
                this.register.date = new Date();
            }
            if (res.amount) {
                this.register.amount = res.amount;
            }
        });
        this.initForm();
        this.register.responsible =this.auth.getCurrentUser();
    }

    public getData(id: number): void {
        this.block = true;
        Register
            .get(id)
            .then((val: Register) => {
                this.register = val;
                this.block = false;
                this.register.date = new Date(Number(this.register.date));
            },() => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);

        this.registerForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
        });
    }

    /**
     * onSave
     */
    public async onSave(): Promise<void> {
        await this.onSaveOrUpdate();
    }

    /**
     * onSave
     */
    public async onSaveOrUpdate(): Promise<void> {
        this.register.responsible = this.auth.getCurrentUser().id;
        this.register.amount = this.sign === '-' ? this.register.amount * -1 : this.register.amount;
        const copy: Register = new Register();
        copy.id = this.register.id;
        copy.responsible = this.auth.getCurrentUser().id;
        copy.error = this.register.error;
        copy.date = (this.register.date as Date).getTime();
        copy.comment = this.register.comment;
        copy.amount = this.register.amount;
        let employeePromise: Promise<any>;
        if (this.isOnEdit) {
            employeePromise = copy.update();
        } else {
            employeePromise = copy.insert();
        }
        this.block = true;
        employeePromise.then(
            () => {
                this.block = false;
                this.goBack();
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    goBack() {
        this.router.navigate(['register/']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
