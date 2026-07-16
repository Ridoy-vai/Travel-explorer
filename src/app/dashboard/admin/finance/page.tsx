import { AdminFinance } from '@/Components/admin/AdminFinance';
import { getUserToken } from '@/lib/session';
import React from 'react';

const page = async () => {
    const token = await getUserToken();

    return (
        <AdminFinance token={token} />
    );
};

export default page;