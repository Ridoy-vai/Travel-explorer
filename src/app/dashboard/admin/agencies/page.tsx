import AdminAgencyVerification from '@/Components/admin/AdminAgencyVerification';
import { getUserToken } from '@/lib/session';
import React from 'react';

const page = async () => {
  const token = await getUserToken();

  return (
    <AdminAgencyVerification token={token} />
  );
};

export default page;