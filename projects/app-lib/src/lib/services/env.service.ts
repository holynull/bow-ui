import { Inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class EnvService {
    environment: any;
    constructor(@Inject('environment') public _environment) {
        this.environment = _environment;
    }
}
