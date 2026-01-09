import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit{
  loading = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });
  }

async login() {
  if (this.form.invalid) return;

  this.loading = true;

  const { email, password } = this.form.value;
  const { error } = await this.auth.login(email!, password!);

  if (error) {
    alert(error.message);
    return;
  }

  this.router.navigate(['dashboard']);
}
}