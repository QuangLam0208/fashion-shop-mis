import React from 'react';

import AppLoading from '@modules/main/AppLoading';
import AppRoutes from '@routes/routes';
import { Loading } from '@components/common/Loading';

const App = () => (
    <React.Suspense fallback={<Loading show />}>
        <AppLoading />
        <AppRoutes />
    </React.Suspense>
);

export default App;
