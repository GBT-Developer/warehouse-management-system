import { useNavigate } from 'react-router-dom';
import { PageLayout } from 'renderer/layout/PageLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    /**
     * Extract the currrentUser from the context, if you want to
     * get the User info, like the email, display name, etc.
     */
    <PageLayout>
      <div className="flex flex-col items-center justify-center mt-[1rem]">
        <p className="text-lg">Welcome, {user?.email}</p>
      </div>
    </PageLayout>
  );
}
export default ProfilePage;
