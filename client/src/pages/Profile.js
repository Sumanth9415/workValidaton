// client/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, redeemPoints } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';
import './Profile.css'; // Specific styling

const Profile = () => {
  const { id } = useParams(); // User ID from URL
  const navigate = useNavigate();
  const { user: loggedInUser, loading: authLoading, updateUserPoints } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading || !loggedInUser) {
        return;
      }
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await getUserProfile(id);
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setProfileError(err.response?.data?.msg || 'Failed to load profile. It might not exist or you don\'t have access.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [id, authLoading, loggedInUser]);

  const handleRedeemPoints = async (e) => {
    e.preventDefault();
    setRedeemError(null);
    setRedeemSuccess(null);
    setIsRedeeming(true);

    const amount = parseInt(redeemAmount, 10);

    if (isNaN(amount) || amount <= 0) {
      setRedeemError('Please enter a positive number for redemption.');
      setIsRedeeming(false);
      return;
    }
    if (!profile || profile.points < amount) {
      setRedeemError('Insufficient points for this redemption.');
      setIsRedeeming(false);
      return;
    }

    try {
      const res = await redeemPoints(amount);
      setRedeemSuccess(res.data.msg);
      // Update local profile points and global AuthContext points
      setProfile(prevProfile => ({ ...prevProfile, points: prevProfile.points - amount }));
      updateUserPoints(loggedInUser.points - amount); // Update points in AuthContext
      setRedeemAmount('');
    } catch (err) {
      console.error('Points redemption failed:', err.response?.data?.msg || err.message);
      setRedeemError(err.response?.data?.msg || 'Failed to redeem points.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (authLoading || profileLoading) {
    return <LoadingSpinner />;
  }

  if (profileError) {
    return <div className="error-message">{profileError}</div>;
  }

  if (!profile) {
    return <div className="error-message">Profile not found.</div>;
  }

  // Check if the logged-in user is viewing their own profile
  const isMyProfile = loggedInUser && loggedInUser._id === id;

  return (
    <div className="profile-container">
      <h1>User Profile: {profile.username}</h1>

      <div className="profile-details">
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Points:</strong> {profile.points}</p>
        <p><strong>Member Since:</strong> {dayjs(profile.date).format('MMM D, YYYY')}</p>
      </div>

      {isMyProfile && profile.role === 'worker' && (
        <div className="wallet-section">
          <h2>Redeem Points</h2>
          <p>Your current balance: {profile.points} points</p>
          <form onSubmit={handleRedeemPoints} className="app-form redeem-form">
            <div className="form-group">
              <label htmlFor="redeemAmount">Amount to Redeem</label>
              <input
                type="number"
                id="redeemAmount"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                min="1"
                required
                disabled={isRedeeming}
              />
            </div>
            {redeemError && <p className="error-message">{redeemError}</p>}
            {redeemSuccess && <p className="success-message">{redeemSuccess}</p>}
            <button type="submit" className="btn btn-primary" disabled={isRedeeming || profile.points === 0}>
              {isRedeeming ? 'Redeeming...' : 'Redeem Points'}
            </button>
            <p className="redemption-info">
              (This is a simulation. In a real application, this would trigger a gift card or voucher generation.)
            </p>
          </form>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="btn btn-secondary back-btn">
        Back
      </button>
    </div>
  );
};

export default Profile;