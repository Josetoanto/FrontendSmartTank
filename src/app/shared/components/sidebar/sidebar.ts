import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  collapsed = false;
  collapsedOnMobile = false;

  constructor(private router: Router) {}

  

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.collapsedOnMobile = !this.collapsedOnMobile;
    } else {
      this.collapsed = !this.collapsed;
      document.body.classList.toggle('sidebar-collapsed', this.collapsed);
    }
  }

  menuItems = [
    { icon: 'home', label: 'Inicio', route: '/', active: false },
    { icon: 'bar_chart', label: 'Nivel del Tanque', route: '/tank-level', active: false },
    { icon: 'show_chart', label: 'Calidad del Agua', route: '/water3', active: false },
    { icon: 'analytics', label: 'Gráficas', route: '/water', active: false },
    { icon: 'receipt', label: 'Informes', route: '/water2', active: false }
  ];
  logout() {
    // lógica para cerrar sesión, limpiar tokens, redirigir, etc.
    console.log('Cerrando sesión...');
  }
}
