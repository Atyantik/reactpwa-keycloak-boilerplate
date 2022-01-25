import { Route } from '@pawjs/pawjs/src/@types/route';

const GuestRoutes: Route[] = [
  {
    path: '/',
    component: () => import('@pages/home'),
  },
];

export default GuestRoutes;
