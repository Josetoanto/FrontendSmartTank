import { Routes } from '@angular/router';
import { Login } from '../../features/example/presentation/pages/login/login';
import { Register } from '../../features/example/presentation/pages/register/register';
import { LadingPage } from '../../shared/pages/lading-page/lading-page';
import { WaterQualityChart } from '../../shared/pages/water-quality-chart/water-quality-chart';
import { WaterQualityReport } from '../../shared/pages/water-quality-report/water-quality-report';
import { WaterQuality } from '../../shared/pages/water-quality/water-quality';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { TankLevel } from '../../shared/pages/tank-level/tank-level';

export const userRoute: Routes = [
    {path: 'login', component: Login},
    {path: 'register', component: Register},
    {path: '', component: LadingPage},
    {path: 'water', component: WaterQualityChart},
    {path: 'water2', component: WaterQualityReport},
    {path: 'water3', component: WaterQuality},
    {path: 'tank-level', component: TankLevel},
    {path:  'sidebar', component: Sidebar},
];
