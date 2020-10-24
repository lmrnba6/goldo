﻿import {RouterModule, Routes} from '@angular/router';


import {LoginComponent} from './login/login.component';
import {LayoutComponent} from "./layout/layout.component";
import {HomeComponent} from "./home/home.component";
import {AuthGuard} from './_guards/auth.guard';
import {AdministrationComponent} from "./administration/administration.component";
import {UserComponent} from "./user/user.component";
import {UserFormComponent} from "./user-form/user-form.component";
import {ClientComponent} from "./client/client.component";
import {ClientFormComponent} from "./client-form/client-form.component";
import {ProductComponent} from "./product/product.component";
import {ProductFormComponent} from "./product-form/product-form.component";
import {ClientManagementComponent} from "./client-management/client-management.component";
import {DocumentComponent} from "./document/document.component";
import {TransactionFormComponent} from "./transaction-form/transaction-form.component";
import {CommentFormComponent} from "./comment-form/comment-form.component";
import {LogsComponent} from "./logs/logs.component";
import {TransactionComponent} from "./transaction/transaction.component";
import {CalculatorComponent} from "./calculator/calculator.component";
import {EmployeeManagementComponent} from "./employee-management/employee-management.component";
import {EmployeeFormComponent} from "./employee-form/employee-form.component";
import {EmployeeComponent} from "./employee/employee.component";
import {PaymentComponent} from "./payment/payment.component";
import {PaymentFormComponent} from "./payment-form/payment-form.component";
import {StatsComponent} from "./stats/stats.component";
import {RegisterComponent} from "./register/register.component";
import {RegisterFormComponent} from "./register-form/register-form.component";

const appRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                component: HomeComponent
            },
            {
                path: 'payment',
                component: PaymentComponent
            },
            {
                path: 'payment/form/:employee',
                component: PaymentFormComponent
            },
            {
                path: 'payment/form/:employee/:id',
                component: PaymentFormComponent
            },
            {
                path: 'clients/:client',
                component: HomeComponent
            },
            {
                path: 'settings',
                component: AdministrationComponent
            },
            {
                path: 'settings/users',
                component: UserComponent
            },
            {
                path: 'settings/users/form',
                component: UserFormComponent
            },
            {
                path: 'settings/users/form/:id',
                component: UserFormComponent
            },
            {
                path: 'calculator',
                component: CalculatorComponent
            },
            {
                path: 'client',
                component: ClientComponent
            },
            {
                path: 'client/form',
                component: ClientFormComponent
            },
            {
                path: 'client/form/:id',
                component: ClientFormComponent
            },
            {
                path: 'comment/form/:client',
                component: CommentFormComponent
            },
            {
                path: 'comment/form/:client/:id',
                component: CommentFormComponent
            },
            {
                path: 'employee',
                component: EmployeeComponent
            },
            {
                path: 'employee/form',
                component: EmployeeFormComponent
            },
            {
                path: 'employee/form/:id',
                component: EmployeeFormComponent
            },
            {
                path: 'transaction',
                component: TransactionComponent
            },
            {
                path: 'transaction/form',
                component: TransactionFormComponent
            },
            {
                path: 'transaction/form/:id',
                component: TransactionFormComponent
            },
            {
                path: 'transaction/form-client/:client',
                component: TransactionFormComponent
            },
            {
                path: 'transaction/form-client/:client/:transaction',
                component: TransactionFormComponent
            },
            {
                path: 'product',
                component: ProductComponent
            },
            {
                path: 'product/form',
                component: ProductFormComponent
            },
            {
                path: 'product/form/:id',
                component: ProductFormComponent
            },
            {
                path: 'client-management/:id',
                component: ClientManagementComponent
            },
            {
                path: 'client-management/:id/:tab',
                component: ClientManagementComponent
            },
            {
                path: 'client-management-client/:client',
                component: ClientManagementComponent
            },
            {
                path: 'client-management-client/:client/:tab',
                component: ClientManagementComponent
            },
            {
                path: 'employee-management/:id',
                component: EmployeeManagementComponent
            },
            {
                path: 'employee-management/:id/:tab',
                component: EmployeeManagementComponent
            },
            {
                path: 'employee-management-client/:client',
                component: EmployeeManagementComponent
            },
            {
                path: 'employee-management-client/:client/:tab',
                component: EmployeeManagementComponent
            },
            {
                path: 'document',
                component: DocumentComponent
            },
            {
                path: 'logs',
                component: LogsComponent
            },
            {
                path: 'stats',
                component: StatsComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            },
            {
                path: 'register/form',
                component: RegisterFormComponent
            },
            {
                path: 'register/form/type/:type/:amount',
                component: RegisterFormComponent
            },
            {
                path: 'register/form/type/:type',
                component: RegisterFormComponent
            },
            {
                path: 'register/form/:id',
                component: RegisterFormComponent
            },
        ]
    },
    //{path: 'unauthorized', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    // otherwise redirect to home
    {path: '**', redirectTo: ''}
];

export const routing = RouterModule.forRoot(appRoutes, {enableTracing: false});
