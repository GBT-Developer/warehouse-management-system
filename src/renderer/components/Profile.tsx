import { useAuth } from 'renderer/providers/AuthProvider';

function Profile() {
  const { user } = useAuth();
  const { logout } = useAuth().actions;

  return (
    /**
     * Extract the currrentUser from the context, if you want to
     * get the User info, like the email, display name, etc.
     */
    <div>
      <h3>Welcome! {user?.email}</h3>
      <p>Sign In Status: {user && 'active'}</p>
      <button type="button" onClick={logout}>
        Sign Out
      </button>
    </div>
  );
}
export default Profile;
