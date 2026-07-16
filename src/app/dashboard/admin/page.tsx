import { AdminOverview } from '@/Components/admin/AdminOverview';
import { getUserToken } from '@/lib/session';
// import React from 'react';

const page = async () => {
    const token = await getUserToken();

    return (
        <AdminOverview token={token} />
    );
};

export default page;