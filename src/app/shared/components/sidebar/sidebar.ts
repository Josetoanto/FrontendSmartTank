import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  collapsed = false;
  collapsedOnMobile = false;

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.collapsedOnMobile = !this.collapsedOnMobile;
    } else {
      this.collapsed = !this.collapsed;
      document.body.classList.toggle('sidebar-collapsed', this.collapsed);
    }
  }

  logout() {
    // lógica para cerrar sesión, limpiar tokens, redirigir, etc.
    console.log('Cerrando sesión...');
  }
}
