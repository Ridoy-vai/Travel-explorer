import AddPackageForm from '@/Components/agency/AddPackageForm';
import { getUserToken } from '@/lib/session';
import React from 'react';

const page = async () => {
  const token = await getUserToken();
  return (
    <AddPackageForm token={token}/>
  );
};

export default page;