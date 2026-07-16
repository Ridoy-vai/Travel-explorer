// app/admin/users/page.js
import { AdminUserManagement } from '@/Components/admin/AdminUserManagement';
import { getUserToken } from '@/lib/session';

const page = async () => {
    const token = await getUserToken();
    return (
        <div className="p-6">
            <AdminUserManagement token={token} />
        </div>
    );
};

export default page;