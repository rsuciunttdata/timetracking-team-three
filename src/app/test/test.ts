import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.css'
})
export class Test {
  constructor(private authService:AuthService) { }

  async ngOnInit() {
    const success = await this.authService.login('aschiop2002@yahoo.com', 'password123');
    console.log('Login success:', success);
    console.log('Current user:', this.authService.getUser()());
  }
}
