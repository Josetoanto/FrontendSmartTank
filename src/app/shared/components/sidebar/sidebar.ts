import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  collapsed = false;
  collapsedOnMobile = false;

  toggleSidebar() {
    // Si es mobile, alterna collapsedOnMobile, si no, alterna collapsed
    if (window.innerWidth <= 768) {
      this.collapsedOnMobile = !this.collapsedOnMobile;
    } else {
      this.collapsed = !this.collapsed;
      document.body.classList.toggle('sidebar-collapsed', this.collapsed);
    }
  }

  menuItems = [
    { icon: 'bar_chart', label: 'Seguimiento', active: false },
    { icon: 'show_chart', label: 'Graficas', active: true },
    { icon: 'receipt', label: 'Informes de', active: false },
    { icon: 'track_changes', label: 'Objetivos de', active: false }
  ];
}
