import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { persistor, RootState } from '@/redux/store';
import { clearCredentials } from '@/redux/slices/authSlice';
import { setProfile, clearProfile } from '@/redux/slices/profileSlice';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/redux/lib/api';
import ProfileSection from '@/polymet/components/profile-section';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  CameraIcon,
  EditIcon,
  KeyIcon,
  LogOutIcon,
  SaveIcon,
  LockIcon,
  RefreshCcwIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { useResetPasswordMutation } from '@/redux/lib/authApi';
import toast, { Toaster } from 'react-hot-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import PhoneVerificationDialog from '@/polymet/components/phoneVerificationDialog';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'account' | 'security'>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);

  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.profile);
  const { data: profileData, isLoading, error, refetch } = useGetProfileQuery(undefined, {
    skip: !!profile, // Skip fetching if profile exists in state
  });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const navigate = useNavigate();

  // Sync profile data with Redux state when fetched
  useEffect(() => {
    if (profileData) {
      dispatch(setProfile(profileData));
    }
  }, [profileData, dispatch]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearCredentials());
      persistor.purge();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      await updateProfile({
        name: profile.name || undefined,
        phoneNumber: profile.phoneNumber || undefined,
      }).unwrap();
      setIsEditing(false);
      await refetch();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setPasswordError(error.data?.message || 'Failed to update profile');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  // Handle RTK Query error types safely
  const getErrorMessage = (error: any): string => {
    if (!error) return 'Failed to load profile';
    if ('status' in error) {
      // FetchBaseQueryError
      return 'error' in error ? error.error : `Error ${error.status}: Failed to load profile`;
    }
    // SerializedError
    return error.message || 'Failed to load profile';
  };

  // Handle sending verification code (mock implementation)
  const handleSendVerificationCode = async (phoneNumber: string) => {
    // Replace with actual API call to send verification code
    console.log('Sending verification code to:', phoneNumber);
  };

  // Handle verifying the code (mock implementation)
  const handleVerifyCode = async (phoneNumber: string, code: string) => {
    // Replace with actual API call to verify the code
    console.log('Verifying code:', code);
    await updateProfile({
      ...profile,
      phoneNumber,
      number_verified: true,
    }).unwrap();
    await refetch();
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto py-8">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-red-500">
        {getErrorMessage(error)}
        <Button variant="outline" size="sm" onClick={refetch} className="ml-4">
          <RefreshCcwIcon className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        No profile data available
        <Button variant="outline" size="sm" onClick={refetch} className="ml-4">
          <RefreshCcwIcon className="mr-2 h-4 w-4" />
          Fetch Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCcwIcon className="mr-2 h-4 w-4" />
            Refresh Profile
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'account' | 'security')}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <ProfileSection
            title="Account Information"
            action={
              isEditing ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                >
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )
            }
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} alt={profile.email} />
                  <AvatarFallback>
                    {profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled
                    title="Avatar upload not implemented"
                  >
                    <CameraIcon className="mr-2 h-4 w-4" />
                    Change
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      type="text"
                      value={profile.name || ''}
                      onChange={(e) =>
                        dispatch(setProfile({ ...profile, name: e.target.value || null }))
                      }
                    />
                  ) : (
                    <p className="text-lg">{profile.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg">{profile.email}</p>
                    <LockIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={profile.phoneNumber || ''}
                      onChange={(e) =>
                        dispatch(setProfile({ ...profile, phoneNumber: e.target.value || null }))
                      }
                    />
                  ) : (
                    <div className='flex items-center justify-between'>
                      <div className='flex gap-4 items-center'>
                        <p className="text-lg">{profile.phoneNumber || 'Not provided'}</p>
                        {profile.phoneNumber ? (
                          <p className={profile.number_verified ? 'text-green-500' : 'text-red-500'}>
                            {profile.number_verified === false ? (
                              <span>Not verified</span>
                            ) : (
                              <span>Verified</span>
                            )}
                          </p>
                        ) : ('')}
                      </div>
                      <div>
                        <Button onClick={() => setShowPhoneDialog(true)}>
                          {profile.phoneNumber ? 'Verify' : 'Add phone number'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Account Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="font-mono">{profile.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <p>{formatDate(profile.joinDate)}</p>
                </div>
              </div>
            </div>
          </ProfileSection>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <ProfileSection
            title="Password"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                <KeyIcon className="mr-2 h-4 w-4" />
                Change
              </Button>
            }
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Last changed</p>
                <p></p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm">Password strength:</p>
                <Badge className="bg-green-500">Strong</Badge>
              </div>
            </div>
          </ProfileSection>
        </TabsContent>
      </Tabs>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>

            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}

            {!passwordError && (
              <p className="text-muted-foreground mb-4">
                Click below to send a password reset email.
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setPasswordError('');

                  if (!profile?.email) {
                    setPasswordError('Email not found');
                    return;
                  }

                  const promise = resetPassword({ email: profile.email }).unwrap();

                  toast.promise(promise, {
                    loading: 'Sending...',
                    success: <b>Reset email sent!</b>,
                    error: (err: any) => {
                      const message = err?.data?.message || 'Failed to send reset email';
                      setPasswordError(message);
                      return <b>{message}</b>;
                    },
                  });

                  try {
                    await promise;
                    setShowPasswordModal(false);
                  } catch (err) {
                    // Error handled inside toast
                  }
                }}
                disabled={isResetting}
              >
                {'Send Email'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PhoneVerificationDialog
        isOpen={showPhoneDialog}
        onOpenChange={setShowPhoneDialog}
        initialPhoneNumber={profile.phoneNumber || ''}
        onSendVerificationCode={handleSendVerificationCode}
        onVerifyCode={handleVerifyCode}
      />
    </div>
  );
}