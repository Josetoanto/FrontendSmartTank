import { Routes } from '@angular/router';
import { Login } from '../../features/example/presentation/pages/login/login';
import { Register } from '../../features/example/presentation/pages/register/register';
import { LadingPage } from '../../shared/pages/lading-page/lading-page';
import { WaterQualityChart } from '../../shared/pages/water-quality-chart/water-quality-chart';
import { WaterQualityReport } from '../../shared/pages/water-quality-report/water-quality-report';
import { WaterQuality } from '../../shared/pages/water-quality/water-quality';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { TankLevel } from '../../shared/pages/tank-level/tank-level';
import { WaterHistogram } from '../../shared/pages/water-histogram/water-histogram';
import { ErrorPage } from '../../shared/pages/error-page/error-page';

export const userRoute: Routes = [
        {path: '', component: LadingPage},
        {path: 'register', component: Register},
        {path: 'login', component: Login},
        {path: 'water-frecuence', component: WaterQualityChart},
        {path: 'water-bar', component: WaterQualityReport},
        {path: 'water-cake', component: WaterQuality},
        {path: 'water-histogram', component: WaterHistogram},
        {path: 'tank-level', component: TankLevel},
        { path: '**', component: ErrorPage },
        {path:  'sidebar', component: Sidebar},
        {path:  'water4', component: WaterHistogram},

];

