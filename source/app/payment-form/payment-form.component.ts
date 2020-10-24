import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Payment} from "../model/payment";
import './payment-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Employee} from "../model/employee";
import {AuthenticationService} from "../_services/authentication.service";
import {DialogsService} from "../_services/dialogs.service";

@Component({
    selector: 'app-payment-form',
    templateUrl: './payment-form.component.html',
})
export class PaymentFormComponent implements OnInit {

    public payment: Payment;
    public block: boolean;
    public isOnEdit: boolean;
    public express: boolean;
    public offer: boolean;
    public paymentForm: FormGroup;
    public date: FormControl;
    public amount: FormControl;
    public comment: FormControl;
    public charge: FormControl;
    public month: FormControl;
    public employee: FormControl;
    public employees: Array<Employee> = [];
    public employeesFiltered: Array<Employee> = [];
    public employeeSelected: Employee | any;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public oldPayment: number;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private auth: AuthenticationService,
                private dialogsService: DialogsService
    ) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    parseAmount(amount: number) {
        this.payment.amount = Number(Number(amount).toFixed(0));
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if(res.employee) {
                this.getEmployee(res.employee);
            }
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else {
                this.isOnEdit = false;
                this.payment = new Payment();
                this.payment.date = new Date();
            }
            this.initForm();
        });
    }

    public displayFnEmployee(employee: Employee) {
        return employee ? employee.name : '';
    }

    public employeeOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Employee.getAllPaged(0, 10, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.employeesFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
            this.employeeSelected = null;
        }
    }

    public employeeOnSelect(employee: Employee): void {
        this.employeeSelected = employee;
    }

    getEmployee(id) {
        this.block = true;
        Employee.get(id).then(employee => {
            this.employeeSelected = employee;
            this.block = false;
            this.paymentForm.controls['employee'].disable();
        }, () => {
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });
    }

    public getData(id: number): void {
        this.block = true;
        Payment
            .get(id)
            .then((val: Payment) => {
                this.payment = val;
                this.block = false;
                this.payment.date = new Date(Number(this.payment.date));
            },() => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.employee = new FormControl(null, [Validators.required]);

        this.paymentForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
            employee: this.employee,
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
        this.payment.employee = this.employeeSelected.id;
        this.payment.responsible = this.auth.getCurrentUser().id;
        const copy: Payment = new Payment();
        copy.id = this.payment.id;
        copy.responsible = this.auth.getCurrentUser().id;
        copy.employee = this.employeeSelected.id;
        copy.error = this.payment.error;
        copy.date = (this.payment.date as Date).getTime();
        copy.comment = this.payment.comment;
        copy.amount = this.payment.amount;
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
                if(this.payment.amount > 0 && !this.isOnEdit) {
                    this.handleRegister();
                }
                this.goBack();
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    handleRegister() {
        this.dialogsService
            .confirm('register.title', 'messages.add_to_register_message', true, 'usd')
            .subscribe(confirm => {
                if (confirm) {
                    this.router.navigate(['register/form/type/-' + '/' + this.payment.amount])
                }
            });
    }

    goBack() {
        this.router.navigate(['employee-management/' + this.employeeSelected.id + '/' + 1]);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
