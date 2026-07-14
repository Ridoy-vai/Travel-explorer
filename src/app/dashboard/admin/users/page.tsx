// import { AdminUserManagement } from '@/Components/admin/AdminUserManagement';
import process from 'process';
import React from 'react';
// import { useMemo } from 'react';
// import AdminUserManagement from '@/Components/admin/AdminUserManagement';
const page = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/allusers`, { cache: 'no-store' });
    const json = await res.json();
    // console.log('req', json);
    return (
        <div>
            {/* <AdminUserManagement userdatas={json} /> */}
            need to fix the AdminUserManagement component to work with server components
        </div>
    );
};

export default page;