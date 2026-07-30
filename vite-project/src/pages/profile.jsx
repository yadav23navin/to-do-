import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import {
  FaEnvelope, FaMapMarkerAlt, FaGithub, FaLinkedin, FaGlobe,
  FaUserEdit, FaKey, FaShieldAlt, FaQuestionCircle, FaSignOutAlt,
  FaMoon, FaSun,
} from 'react-icons/fa'
import '../App.css'

const PROFILE_API = `${import.meta.env.VITE_API_URL}/api/profile`
const CONTACT_API = `${import.meta.env.VITE_API_URL}/api/contact`
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function Profile() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
  const name = currentUser?.name || 'User'
  const email = currentUser?.email || ''

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [saveError, setSaveError] = useState('')

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordDraft, setPasswordDraft] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const [contactDraft, setContactDraft] = useState({ name: '', email: '', message: '' })
  const [contactError, setContactError] = useState('')
  const [contactSuccess, setContactSuccess] = useState('')
  const [contactSending, setContactSending] = useState(false)

  const [themeSaving, setThemeSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(PROFILE_API, { headers: getAuthHeaders() })
        if (res.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('currentUser')
          navigate('/login')
          return
        }
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const currentTheme = (profile?.theme || 'Light').toLowerCase()
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [profile])

  if (loading) {
    return <p className="task-meta">{t('profile.loading')}</p>
  }

  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const openEdit = () => {
    setSaveError('')
    setDraft({
      role: profile?.role || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      experience: profile?.experience || '',
      skills: profile?.skills || [],
      phone: profile?.phone || '',
      github: profile?.github || '',
      linkedin: profile?.linkedin || '',
      portfolio: profile?.portfolio || '',
      theme: profile?.theme || 'Light',
    })
    setIsEditing(true)
  }

  const saveEdit = async () => {
    try {
      const res = await fetch(PROFILE_API, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(draft),
      })
      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('currentUser')
        navigate('/login')
        return
      }
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.message || 'Failed to save profile')
      }
      const updated = await res.json()
      setProfile(updated)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err.message)
    }
  }

  const openChangePassword = () => {
    setPasswordError('')
    setPasswordSuccess('')
    setPasswordDraft({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setIsChangingPassword(true)
  }

  const savePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordDraft.currentPassword || !passwordDraft.newPassword) {
      setPasswordError(t('passwordModal.fillAllFields'))
      return
    }
    if (passwordDraft.newPassword.length < 6) {
      setPasswordError(t('passwordModal.tooShort'))
      return
    }
    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setPasswordError(t('passwordModal.mismatch'))
      return
    }

    try {
      const res = await fetch(`${PROFILE_API}/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordDraft.currentPassword,
          newPassword: passwordDraft.newPassword,
        }),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('currentUser')
        navigate('/login')
        return
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.message || 'Failed to update password')
      }

      setPasswordSuccess(t('passwordModal.success'))
      setPasswordDraft({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setIsChangingPassword(false), 1200)
    } catch (err) {
      setPasswordError(err.message)
    }
  }

  const openHelp = () => {
    setContactError('')
    setContactSuccess('')
    setContactDraft({ name, email, message: '' })
    setIsHelpOpen(true)
  }

  const sendContact = async () => {
    setContactError('')
    setContactSuccess('')

    if (!contactDraft.name.trim()) {
      setContactError(t('helpModal.nameRequired'))
      return
    }
    if (!EMAIL_REGEX.test(contactDraft.email.trim())) {
      setContactError(t('helpModal.invalidEmail'))
      return
    }
    if (!contactDraft.message.trim()) {
      setContactError(t('helpModal.messageRequired'))
      return
    }

    setContactSending(true)
    try {
      const res = await fetch(CONTACT_API, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contactDraft),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('currentUser')
        navigate('/login')
        return
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.message || 'Failed to send message')
      }

      setContactSuccess(t('helpModal.sentSuccess'))
      setContactDraft({ name, email, message: '' })
    } catch (err) {
      setContactError(err.message)
    } finally {
      setContactSending(false)
    }
  }

  const toggleTheme = async () => {
    if (!profile || themeSaving) return
    const newTheme = theme === 'Dark' ? 'Light' : 'Dark'
    setThemeSaving(true)
    try {
      const res = await fetch(PROFILE_API, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...profile, theme: newTheme }),
      })
      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('currentUser')
        navigate('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to update theme')
      const updated = await res.json()
      setProfile(updated)
    } catch (err) {
      console.error('Failed to update theme', err)
    } finally {
      setThemeSaving(false)
    }
  }

  const changeLanguage = (e) => {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const skills = profile?.skills || []
  const bio = profile?.bio || t('profile.noBio')
  const role = profile?.role || t('profile.workspaceMember')
  const location = profile?.location || ''
  const experience = profile?.experience || 'Not specified'
  const github = profile?.github
  const linkedin = profile?.linkedin
  const portfolio = profile?.portfolio
  const theme = profile?.theme || 'Light'
  const themeLabel = theme === 'Dark' ? t('profile.dark') : t('profile.light')

  return (
    <section className="profile-page">
      <div className="profile-stack">

        <div className="profile-card profile-header-card">
          <div className="profile-avatar-large">{initials}</div>
          <h2>{name}</h2>
          <p className="profile-role">{role}</p>
          <div className="profile-meta-row">
            <span><FaEnvelope /> {email}</span>
            {location && <span><FaMapMarkerAlt /> {location}</span>}
          </div>
          <button className="button button-secondary" onClick={openEdit}>
            <FaUserEdit /> {t('profile.editProfile')}
          </button>
        </div>

        <div className="profile-card">
          <h3>{t('profile.about')}</h3>
          <p className="profile-about-text">{bio}</p>
          <p className="profile-experience">{t('profile.experience')}: {experience}</p>
        </div>

        <div className="profile-card">
          <h3>{t('profile.skills')}</h3>
          {skills.length > 0 ? (
            <div className="chip-row">
              {skills.map((skill) => (
                <span className="chip" key={skill}>{skill}</span>
              ))}
            </div>
          ) : (
            <p className="profile-experience">{t('profile.noSkills')}</p>
          )}
        </div>

        <div className="profile-card">
          <h3>{t('profile.accountInfo')}</h3>
          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('profile.username')}</span>
              <span className="profile-detail-value">{name.replace(/\s+/g, '').toLowerCase()}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('profile.email')}</span>
              <span className="profile-detail-value">{email}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('profile.role')}</span>
              <span className="profile-detail-value">{t('profile.workspaceMember')}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>{t('profile.workspace')}</h3>
          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('profile.workspace')}</span>
              <span className="profile-detail-value">{t('profile.workspaceName')}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('profile.role')}</span>
              <span className="profile-detail-value">{t('profile.member')}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('profile.workspaceId')}</span>
              <span className="profile-detail-value">TF-1024</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>{t('profile.preferences')}</h3>
          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('profile.theme')}</span>
              <button
                className="button button-secondary theme-toggle"
                onClick={toggleTheme}
                disabled={themeSaving}
              >
                {theme === 'Dark' ? <FaMoon /> : <FaSun />} {themeLabel}
              </button>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('profile.language')}</span>
              <select value={i18n.language} onChange={changeLanguage} className="language-select">
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>{t('profile.socialLinks')}</h3>
          <div className="social-links">
            <a href={github || '#'} className="social-link"><FaGithub /> {t('profile.github')}</a>
            <a href={linkedin || '#'} className="social-link"><FaLinkedin /> {t('profile.linkedin')}</a>
            <a href={portfolio || '#'} className="social-link"><FaGlobe /> {t('profile.portfolio')}</a>
          </div>
        </div>

        <div className="profile-card">
          <h3>{t('profile.quickActions')}</h3>
          <div className="quick-actions">
            <button className="button button-secondary" onClick={openEdit}><FaUserEdit /> {t('profile.editProfile')}</button>
            <button className="button button-secondary" onClick={openChangePassword}><FaKey /> {t('profile.changePassword')}</button>
            <button className="button button-secondary" onClick={() => setIsPrivacyOpen(true)}><FaShieldAlt /> {t('profile.privacy')}</button>
            <button className="button button-secondary" onClick={openHelp}><FaQuestionCircle /> {t('profile.help')}</button>
            <button className="button button-danger" onClick={handleLogout}><FaSignOutAlt /> {t('profile.logout')}</button>
          </div>
        </div>

      </div>

      {isEditing && draft && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{t('editModal.title')}</h3>

            <label>{t('editModal.roleTitle')}</label>
            <input
              type="text"
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            />

            <label>{t('editModal.location')}</label>
            <input
              type="text"
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            />

            <label>{t('editModal.aboutMe')}</label>
            <textarea
              rows={3}
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            />

            <label>{t('editModal.experience')}</label>
            <input
              type="text"
              value={draft.experience}
              onChange={(e) => setDraft({ ...draft, experience: e.target.value })}
            />

            <label>{t('editModal.skillsLabel')}</label>
            <input
              type="text"
              value={draft.skills.join(', ')}
              onChange={(e) => setDraft({ ...draft, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            />

            <label>{t('editModal.phone')}</label>
            <input
              type="text"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />

            <label>{t('editModal.githubUrl')}</label>
            <input
              type="text"
              value={draft.github}
              onChange={(e) => setDraft({ ...draft, github: e.target.value })}
            />

            <label>{t('editModal.linkedinUrl')}</label>
            <input
              type="text"
              value={draft.linkedin}
              onChange={(e) => setDraft({ ...draft, linkedin: e.target.value })}
            />

            <label>{t('editModal.portfolioUrl')}</label>
            <input
              type="text"
              value={draft.portfolio}
              onChange={(e) => setDraft({ ...draft, portfolio: e.target.value })}
            />

            {saveError && <p className="error">{saveError}</p>}

            <div className="modal-actions">
              <button className="button button-secondary" onClick={() => setIsEditing(false)}>{t('editModal.cancel')}</button>
              <button className="button button-primary" onClick={saveEdit}>{t('editModal.save')}</button>
            </div>
          </div>
        </div>
      )}

      {isChangingPassword && (
        <div className="modal-overlay" onClick={() => setIsChangingPassword(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{t('passwordModal.title')}</h3>

            <label>{t('passwordModal.current')}</label>
            <input
              type="password"
              value={passwordDraft.currentPassword}
              onChange={(e) => setPasswordDraft({ ...passwordDraft, currentPassword: e.target.value })}
            />

            <label>{t('passwordModal.new')}</label>
            <input
              type="password"
              value={passwordDraft.newPassword}
              onChange={(e) => setPasswordDraft({ ...passwordDraft, newPassword: e.target.value })}
            />

            <label>{t('passwordModal.confirm')}</label>
            <input
              type="password"
              value={passwordDraft.confirmPassword}
              onChange={(e) => setPasswordDraft({ ...passwordDraft, confirmPassword: e.target.value })}
            />

            {passwordError && <p className="error">{passwordError}</p>}
            {passwordSuccess && <p className="success">{passwordSuccess}</p>}

            <div className="modal-actions">
              <button className="button button-secondary" onClick={() => setIsChangingPassword(false)}>{t('passwordModal.cancel')}</button>
              <button className="button button-primary" onClick={savePassword}>{t('passwordModal.update')}</button>
            </div>
          </div>
        </div>
      )}

      {isPrivacyOpen && (
        <div className="modal-overlay" onClick={() => setIsPrivacyOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{t('privacyModal.title')}</h3>
            <p className="profile-about-text">{t('privacyModal.body')}</p>
            <div className="modal-actions">
              <button className="button button-primary" onClick={() => setIsPrivacyOpen(false)}>{t('privacyModal.close')}</button>
            </div>
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div className="modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{t('helpModal.title')}</h3>
            <ul className="checklist">
              <li><Trans i18nKey="helpModal.tip1" components={{ b: <strong /> }} /></li>
              <li><Trans i18nKey="helpModal.tip2" components={{ b: <strong /> }} /></li>
              <li><Trans i18nKey="helpModal.tip3" components={{ b: <strong /> }} /></li>
            </ul>

            <h3>{t('helpModal.contactTitle')}</h3>

            <label>{t('helpModal.yourName')}</label>
            <input
              type="text"
              value={contactDraft.name}
              onChange={(e) => setContactDraft({ ...contactDraft, name: e.target.value })}
            />

            <label>{t('helpModal.yourEmail')}</label>
            <input
              type="email"
              value={contactDraft.email}
              onChange={(e) => setContactDraft({ ...contactDraft, email: e.target.value })}
            />

            <label>{t('helpModal.message')}</label>
            <textarea
              rows={4}
              maxLength={2000}
              value={contactDraft.message}
              onChange={(e) => setContactDraft({ ...contactDraft, message: e.target.value })}
            />

            {contactError && <p className="error">{contactError}</p>}
            {contactSuccess && <p className="success">{contactSuccess}</p>}

            <div className="modal-actions">
              <button className="button button-secondary" onClick={() => setIsHelpOpen(false)}>{t('helpModal.close')}</button>
              <button className="button button-primary" onClick={sendContact} disabled={contactSending}>
                {contactSending ? t('helpModal.sending') : t('helpModal.send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Profile