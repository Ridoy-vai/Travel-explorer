import TravelerDashboardOverview from '@/Components/traveler/Travelerdashboardoverview';
import { getUserToken } from '@/lib/session';
import React from 'react';

const page = async() => {
    const token = await getUserToken();
    return (
       <TravelerDashboardOverview token={token} />
    );
};

export default page;