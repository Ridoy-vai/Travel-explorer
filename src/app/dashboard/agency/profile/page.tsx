import AgencyProfilePage from '@/Components/agency/AgencyProfilePage';
import { getUserToken } from '@/lib/session';
import React from 'react';

const page = async () => {
  const token = await getUserToken();
  return (
    <AgencyProfilePage token={token}/>
  );
};

export default page;