import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
    
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  loading = false;
  form!: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder, 
    private supabaseService: SupabaseService,
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
    const { error } = await this.supabaseService.login(email!, password!);

    if (error) {
      alert(error.message);
      return;
    }

    this.router.navigate(['dashboard']);
  }
}