import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {routing} from './app.routing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';
import {LoginComponent} from "./login/login.component";
import {NavComponent} from "./nav/nav.component";
import {FooterComponent} from "./footer/footer.component";
import {LayoutComponent} from "./layout/layout.component";
import {HomeComponent} from "./home/home.component";
import {
    MAT_DATE_LOCALE,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatOptionModule,
    MatPaginatorIntl,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from "@angular/material";
import {UserComponent} from "./user/user.component";
import {UserFormComponent} from "./user-form/user-form.component";
import {AdministrationComponent} from "./administration/administration.component";
import {AbstractTableComponent} from "./abstract-table/abstract-table.component";
import {LoaderComponent} from "./loader/loader.component";
import {CdkTableModule} from "@angular/cdk/table";
import {CommonModule} from "@angular/common";
import {ConfirmDialogComponent} from "./confirm-dialog/confirm-dialog.component";
import {InfoDialogComponent} from "./info-dialog/info-dialog.component";
import {MatPaginatorClass} from "./abstract-table/matPaginatorIntl";
import {ClientComponent} from "./client/client.component";
import {ClientFormComponent} from "./client-form/client-form.component";
import {ProductComponent} from "./product/product.component";
import {ProductFormComponent} from "./product-form/product-form.component";
import {ClientManagementComponent} from "./client-management/client-management.component";
import {DocumentComponent} from "./document/document.component";
import {IndicatorComponent} from "./indicator/indicator.component";
import {FloatingActionMenuModule} from "ng2-floating-action-menu";
import {SafePipe} from "./_pipes/safe.pipe";
import {TransactionComponent} from "./transaction/transaction.component";
import {TransactionFormComponent} from "./transaction-form/transaction-form.component";
import {CommentComponent} from "./comment/comment.component";
import {CommentFormComponent} from "./comment-form/comment-form.component";
import {PromptDialogComponent} from "./prompt-dialog/prompt-dialog.component";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {LogsComponent} from "./logs/logs.component";
import {MAT_SNACK_BAR_DEFAULT_OPTIONS} from "@angular/material/snack-bar";
import {ClipboardModule} from "ngx-clipboard";
import {CalculatorComponent} from "./calculator/calculator.component";
import {EmployeeComponent} from "./employee/employee.component";
import {EmployeeFormComponent} from "./employee-form/employee-form.component";
import {EmployeeManagementComponent} from "./employee-management/employee-management.component";
import {PaymentComponent} from "./payment/payment.component";
import {PaymentFormComponent} from "./payment-form/payment-form.component";
import {StatsComponent} from "./stats/stats.component";
import {RegisterFormComponent} from "./register-form/register-form.component";
import {RegisterComponent} from "./register/register.component";
import {SupplierComponent} from "./supplier/supplier.component";
import {SupplierFormComponent} from "./supplier-form/supplier-form.component";
import {SupplierManagementComponent} from "./supplier-management/supplier-management.component";
import {BuyComponent} from "./buy/buy.component";
import {BuyFormComponent} from "./buy-form/buy-form.component";
import {ReceiptComponent} from "./receipt/receipt.component";


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            },
            isolate: true
        }),
        routing,
        MatTableModule,
        MatPaginatorModule,
        CdkTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatSortModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatDatepickerModule,
        CommonModule,
        MatButtonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MatOptionModule,
        MatCardModule,
        MatRadioModule,
        MatToolbarModule,
        MatMenuModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatListModule,
        MatExpansionModule,
        MatSelectModule,
        MatTabsModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatGridListModule,
        MatAutocompleteModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatProgressBarModule,
        MatStepperModule,
        MatBadgeModule,
        MatChipsModule,
        FloatingActionMenuModule,
        DragDropModule,
        ClipboardModule
    ],
    declarations: [
        SafePipe,
        AppComponent,
        LoginComponent,
        NavComponent,
        FooterComponent,
        LayoutComponent,
        HomeComponent,
        UserComponent,
        UserFormComponent,
        AdministrationComponent,
        AbstractTableComponent,
        LoaderComponent,
        ConfirmDialogComponent,
        InfoDialogComponent,
        ClientComponent,
        ClientFormComponent,
        ProductComponent,
        ProductFormComponent,
        ClientManagementComponent,
        DocumentComponent,
        IndicatorComponent,
        TransactionComponent,
        TransactionFormComponent,
        CommentComponent,
        CommentFormComponent,
        PromptDialogComponent,
        LogsComponent,
        CalculatorComponent,
        EmployeeComponent,
        EmployeeFormComponent,
        EmployeeManagementComponent,
        PaymentComponent,
        PaymentFormComponent,
        StatsComponent,
        RegisterFormComponent,
        RegisterComponent,
        SupplierComponent,
        SupplierFormComponent,
        SupplierManagementComponent,
        BuyComponent,
        BuyFormComponent,
        ReceiptComponent
    ],
    entryComponents: [ConfirmDialogComponent, InfoDialogComponent, PromptDialogComponent],
    providers: [
        { provide: MatPaginatorIntl, useClass: MatPaginatorClass },
        { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4000} }
    ],
    bootstrap: [
        AppComponent
    ],
})

export class AppModule {
}

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
