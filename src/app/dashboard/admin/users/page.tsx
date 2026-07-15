// app/admin/users/page.js
import { AdminUserManagement } from '@/Components/admin/AdminUserManagement';

const page = () => {
    return (
        <div className="p-6">
            <AdminUserManagement />
        </div>
    );
};

export default page;