import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";


@Injectable({providedIn: 'root'})
export class MessagesService {

    constructor(public snackBar: MatSnackBar) {
    }

    /**
     * notifyMessage
     */
    public notifyMessage(message: string, action: string, result: string): void {
        this.snackBar.open(message, action, {
            duration: 4000,
            verticalPosition: 'top',
            horizontalPosition: 'right',
            panelClass: result
        });
    }

}
