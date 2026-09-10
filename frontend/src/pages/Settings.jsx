import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Link2, LogOut, ChevronRight, CheckCircle, Loader2, X, Key, Info, Briefcase } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [connecting, setConnecting] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [showConnectModal, setShowConnectModal] = useState(null);
  const [credForm, setCredForm] = useState({ accessToken: '', pageId: '', accountName: '' });
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [switchMsg, setSwitchMsg] = useState('');
  const [switchingPage, setSwitchingPage] = useState(false);

  const defaultBizForm = { businessName: '', industry: '', location: '', website: '', description: '', targetAudience: '', brandTone: 'professional', goals: [] };
  const [bizForm, setBizForm] = useState(defaultBizForm);
  const [savingBiz, setSavingBiz] = useState(false);
  const [bizSuccess, setBizSuccess] = useState('');

  useEffect(() => { fetchAccounts(); fetchBusinessProfile(); }, []);

  useEffect(() => {
    const social = searchParams.get('social');
    const status = searchParams.get('status');
    if (social && status) {
      if (status === 'success') {
        alert(`Successfully connected ${social}!`);
      } else {
        alert(`Failed to connect ${social}: ${searchParams.get('msg') || 'Unknown error'}`);
      }
      setSearchParams({}, { replace: true });
      fetchAccounts();
    }
  }, [searchParams]);

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get('/social/accounts');
      const accountsMap = {};
      data.forEach(acc => {
        accountsMap[acc.platform] = {
          connected: acc.isConnected,
          username: acc.accountName,
          connectedAt: acc.connectedAt,
          availablePages: acc.availablePages || [],
          pageId: acc.pageId
        };
      });
      setConnectedAccounts(accountsMap);
    } catch (err) { console.error(err); }
  };

  const handleOAuthConnect = async (platform) => {
    setConnecting(platform);
    try {
      const { data } = await api.get(`/social/auth-url/${platform}`);
      if (!data.url) throw new Error('OAuth not available for this platform');
      const w = window.open(data.url, '_blank', 'width=700,height=700');
      if (w) {
        const timer = setInterval(() => {
          if (w.closed) {
            clearInterval(timer);
            fetchAccounts();
          }
        }, 700);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Could not start connection. Check backend config.');
    } finally {
      setConnecting(null);
    }
  };

  const handleSwitchPage = async (platform, pageId) => {
    setSwitchingPage(true); setSwitchMsg('');
    try {
      const { data } = await api.post('/social/facebook/select-page', { pageId });
      setSwitchMsg(data.message || 'Page switched');
      fetchAccounts();
      setTimeout(() => setSwitchMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to switch page');
    } finally {
      setSwitchingPage(false);
    }
  };

  const fetchBusinessProfile = async () => {
    try {
      const { data } = await api.get('/business/profile');
      if (data) {
        setBizForm({
          businessName: data.businessName || '',
          industry: data.industry || '',
          location: data.location || '',
          website: data.website || '',
          description: data.description || '',
          targetAudience: data.targetAudience || '',
          brandTone: data.brandTone || 'professional',
          goals: data.goals || []
        });
      }
    } catch { console.log('No business profile yet'); }
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    const platform = showConnectModal;
    setConnecting(platform);
    try {
      await api.post('/social/connect', { platform, accessToken: credForm.accessToken, pageId: credForm.pageId, accountName: credForm.accountName || `${platform}_user` });
      fetchAccounts();
      setShowConnectModal(null);
      setCredForm({ accessToken: '', pageId: '', accountName: '' });
    } catch (err) { alert(err.response?.data?.message || 'Error connecting account'); }
    finally { setConnecting(null); }
  };

  const handleDisconnect = async (platform) => {
    if (!confirm(`Disconnect ${platform}?`)) return;
    try { await api.delete(`/social/accounts/${platform}`); fetchAccounts(); } catch (err) { console.error(err); }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true); setProfileError(''); setProfileSuccess('');
    try {
      await api.put('/auth/profile', { name: profileForm.name });
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.name = profileForm.name;
      localStorage.setItem('user', JSON.stringify(storedUser));
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) { setProfileError(err.response?.data?.message || 'Error updating profile'); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    setSavingPassword(true); setPasswordError(''); setPasswordSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError('Passwords do not match'); setSavingPassword(false); return; }
    try {
      await api.put('/auth/password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) { setPasswordError(err.response?.data?.message || 'Error changing password'); }
    finally { setSavingPassword(false); }
  };

  const handleSaveBusiness = async () => {
    setSavingBiz(true); setBizSuccess('');
    try {
      await api.put('/business/profile', bizForm);
      setBizSuccess('Business profile saved!');
      setTimeout(() => setBizSuccess(''), 3000);
    } catch (err) { console.error(err); }
    finally { setSavingBiz(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const socialPlatforms = [
    { id: 'linkedin', name: 'LinkedIn', desc: 'Post articles and updates', icon: 'in', color: 'bg-[#0a66c2]', auth: true, manual: false },
    { id: 'facebook', name: 'Facebook', desc: 'Publish to Pages and Groups', icon: 'f', color: 'bg-[#1877F2]', auth: true, manual: false },
    { id: 'instagram', name: 'Instagram', desc: 'Share photos and reels', icon: 'ig', color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500', auth: true, manual: false },
    { id: 'twitter', name: 'Twitter (X)', desc: 'Share tweets and threads', icon: 'X', color: 'bg-black border border-white/20', auth: false, manual: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          Settings <SettingsIcon className="text-gray-400" />
        </h1>
        <p className="text-gray-400">Manage your account, business profile, and platform integrations.</p>
      </div>

      <div className="flex gap-6 relative z-10">
        <div className="w-56 shrink-0 glass-card p-2 h-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-purple-500/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={18} />{tab.label}<ChevronRight size={14} className="ml-auto opacity-50" />
              </button>
            );
          })}
          <hr className="border-white/5 my-2" />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />Logout
          </button>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-5 pb-6 border-b border-white/5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{user?.name || 'User'}</h2>
                  <p className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
                  <span className="inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 capitalize">{user?.plan || 'Free'} Plan</span>
                </div>
              </div>
              {profileError && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-lg">{profileError}</div>}
              {profileSuccess && <div className="bg-green-500/10 border border-green-500/40 text-green-400 text-sm p-3 rounded-lg">{profileSuccess}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input type="email" value={profileForm.email} disabled className="w-full bg-black/20 border border-gray-700/50 rounded-lg p-3 text-gray-400 cursor-not-allowed" />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={savingProfile} className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-70">
                {savingProfile ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Business Profile</h2>
                <p className="text-gray-400 text-sm">Configure your business details for better AI-powered recommendations and content generation.</p>
              </div>
              {bizSuccess && <div className="bg-green-500/10 border border-green-500/40 text-green-400 text-sm p-3 rounded-lg">{bizSuccess}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Business Name</label>
                  <input type="text" value={bizForm.businessName} onChange={(e) => setBizForm({...bizForm, businessName: e.target.value})} placeholder="Your business name" className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Industry</label>
                  <input type="text" value={bizForm.industry} onChange={(e) => setBizForm({...bizForm, industry: e.target.value})} placeholder="e.g. Fashion, Technology, Food" className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input type="text" value={bizForm.location} onChange={(e) => setBizForm({...bizForm, location: e.target.value})} placeholder="e.g. New York, USA" className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Website</label>
                  <input type="url" value={bizForm.website} onChange={(e) => setBizForm({...bizForm, website: e.target.value})} placeholder="https://yourbusiness.com" className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
                  <input type="text" value={bizForm.targetAudience} onChange={(e) => setBizForm({...bizForm, targetAudience: e.target.value})} placeholder="e.g. Small business owners, 25-45" className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Brand Tone</label>
                  <select value={bizForm.brandTone} onChange={(e) => setBizForm({...bizForm, brandTone: e.target.value})} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="funny">Funny</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="educational">Educational</option>
                    <option value="authoritative">Authoritative</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Business Description</label>
                <textarea rows={3} value={bizForm.description} onChange={(e) => setBizForm({...bizForm, description: e.target.value})} placeholder="Brief description of your business and what you do..." className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" />
              </div>
              <button onClick={handleSaveBusiness} disabled={savingBiz} className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-70">
                {savingBiz ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Business Profile'}
              </button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-1">Social Media Integrations</h2>
              <p className="text-gray-400 text-sm mb-4">Connect your real social accounts to auto-post and schedule directly from GrowVix.</p>
              {switchMsg && <div className="mb-4 bg-green-500/10 border border-green-500/40 text-green-400 text-sm p-3 rounded-lg">{switchMsg}</div>}
              <div className="space-y-3">
                {socialPlatforms.map(platform => {
                  const isConnected = connectedAccounts[platform.id]?.connected;
                  const account = connectedAccounts[platform.id];
                  return (
                    <div key={platform.id} className={`p-4 border rounded-xl transition-colors ${isConnected ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-full ${platform.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{platform.icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium">{platform.name}</h3>
                              {isConnected && <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full"><CheckCircle size={10} /> Connected</span>}
                            </div>
                            {isConnected ? <p className="text-sm text-green-300/70 mt-0.5">Connected as <span className="font-medium text-green-300">{account.username}</span></p> : <p className="text-sm text-gray-500">{platform.desc}</p>}
                          </div>
                        </div>
                        {isConnected ? (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleDisconnect(platform.id)} className="text-red-400/70 border border-red-500/30 hover:bg-red-500/10 hover:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Disconnect</button>
                            {platform.id === 'facebook' && account?.availablePages?.length > 1 && (
                              <select
                                value={account.pageId || ''}
                                disabled={switchingPage}
                                onChange={(e) => handleSwitchPage(platform.id, e.target.value)}
                                className="bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                              >
                                <option value="">Switch Page...</option>
                                {account.availablePages.map(page => (
                                  <option key={page.id} value={page.id}>{page.name}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => platform.manual ? setShowConnectModal(platform.id) : handleOAuthConnect(platform.id)}
                            disabled={connecting === platform.id}
                            className="text-purple-400 border border-purple-500/40 hover:bg-purple-500/10 px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
                          >
                            {connecting === platform.id ? <><Loader2 size={14} className="animate-spin" /> Connecting...</> : <>
                              Connect {platform.auth && <span className="text-xs text-gray-500">(OAuth)</span>}
                            </>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Security Settings</h2>
                <p className="text-gray-400 text-sm">Manage your password and account security.</p>
              </div>
              {passwordError && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-lg">{passwordError}</div>}
              {passwordSuccess && <div className="bg-green-500/10 border border-green-500/40 text-green-400 text-sm p-3 rounded-lg">{passwordSuccess}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} placeholder="Enter current password" className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">New Password</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} placeholder="Enter new password" className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} placeholder="Confirm new password" className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={savingPassword} className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-70">
                {savingPassword ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-white font-semibold flex items-center gap-2 capitalize">Connect {showConnectModal}</h3>
              <button onClick={() => setShowConnectModal(null)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleConnectSubmit} className="p-6 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 text-xs text-blue-300 leading-relaxed">
                <Info size={16} className="shrink-0" />
                <p>Provide an access token from the {showConnectModal} developer portal. This allows GrowVix to post on your behalf.</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1.5"><User size={14} /> Display Name</label>
                <input type="text" required placeholder="e.g. Your Name" value={credForm.accountName} onChange={(e) => setCredForm({...credForm, accountName: e.target.value})} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1.5"><Key size={14} /> Access Token</label>
                <input type="password" required placeholder="Enter your API access token" value={credForm.accessToken} onChange={(e) => setCredForm({...credForm, accessToken: e.target.value})} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              {(showConnectModal === 'facebook' || showConnectModal === 'instagram') && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1.5"><SettingsIcon size={14} /> Page ID</label>
                  <input type="text" required placeholder="Enter your Facebook Page ID" value={credForm.pageId} onChange={(e) => setCredForm({...credForm, pageId: e.target.value})} className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
              )}
              <div className="pt-2">
                <button type="submit" disabled={connecting} className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20 flex justify-center items-center gap-2">
                  {connecting ? <><Loader2 size={18} className="animate-spin" /> Connecting...</> : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
