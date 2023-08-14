import { useNavigate } from 'react-router-dom';
import { AppLayout } from 'renderer/layout/AppLayout';
import { useAuth } from 'renderer/providers/AuthProvider';

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    /**
     * Extract the currrentUser from the context, if you want to
     * get the User info, like the email, display name, etc.
     */
    <AppLayout>
      <div className="flex flex-col items-center justify-center mt-[1rem]">
        <p className="text-lg">Welcome, {user?.email}</p>
        <button className="InputButton" onClick={() => navigate('/inputpage')}>
          Input Stock
        </button>
        <button className='user-button' onClick={() => navigate('/adminpage')}>
          Users
        </button>
      </div>
    </AppLayout>
  );
}
export default ProfilePage;
