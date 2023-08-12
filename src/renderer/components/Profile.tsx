import { AppLayout } from 'renderer/layout/AppLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

function Profile() {
  const { user } = useAuth();

  return (
    /**
     * Extract the currrentUser from the context, if you want to
     * get the User info, like the email, display name, etc.
     */
    <AppLayout>
      <div className="flex flex-col items-center justify-center mt-[1rem]">
        <p className="text-lg">Welcome, {user?.email}</p>
      </div>
    </AppLayout>
  );
}
export default Profile;
