// src/pages/SupplierProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getSupplierProfile } from '../apis/profile';
// profile.css متستوردة مركزيًا في main.jsx زي باقي الاستايلات

const STATUS_LABELS = {
  active: 'نشط',
  pending: 'قيد المراجعة',
  inactive: 'غير مفعّل',
  banned: 'موقوف',
};

function statusVariant(status) {
  if (status === 'active') return 'active';
  if (status === 'pending') return 'pending';
  return 'inactive';
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return isoString;
  }
}

function initialsOf(name) {
  if (!name) return 'س';
  return name.trim().charAt(0);
}

function SkeletonLine({ width, height = 14 }) {
  return (
    <div
      className="sp-skeleton-bar"
      style={{ width, height, marginBottom: 10 }}
    />
  );
}

export default function SupplierProfilePage() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  async function loadProfile() {
    setStatus('loading');
    try {
      const data = await getSupplierProfile();
      setProfile(data);
      setStatus('ready');
    } catch (err) {
      toast.error(err.message || 'حدث خطأ غير متوقع');
      setStatus('error');
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (status === 'loading') {
    return (
      <div className="sp-page">
        <div className="sp-skeleton">
          <div
            className="sp-skeleton-bar"
            style={{ height: 148, borderRadius: '14px 14px 0 0' }}
          />
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: '0 0 14px 14px',
              padding: '24px 28px',
              marginBottom: 20,
            }}
          >
            <SkeletonLine width="40%" height={22} />
            <SkeletonLine width="25%" />
          </div>
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '24px 28px',
            }}
          >
            <SkeletonLine width="30%" height={16} />
            <SkeletonLine width="60%" />
            <SkeletonLine width="50%" />
            <SkeletonLine width="70%" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="sp-page">
        <div className="sp-state">
          <h2>تعذر تحميل البروفايل</h2>
          <p>تحققي من الاتصال أو من تسجيل الدخول وحاولي مرة أخرى.</p>
          <button onClick={loadProfile}>حاولي مرة أخرى</button>
        </div>
      </div>
    );
  }

  const sealClass =
    profile.status === 'active'
      ? ''
      : profile.status === 'pending'
      ? 'is-pending'
      : 'is-inactive';

  const documents = [
    { key: 'certificate_image', label: 'شهادة الآيزو', icon: 'bi-patch-check', url: profile.certificate_image },
    { key: 'company_image_url', label: 'صورة الشركة', icon: 'bi-building', url: profile.company_image_url },
    { key: 'tax_card_image', label: 'البطاقة الضريبية', icon: 'bi-file-earmark-text', url: profile.tax_card_image },
  ].filter((doc) => doc.url);

  return (
    <div className="sp-page">
      <div className="sp-wrap">
        <div className="sp-header">
          <div
            className="sp-banner"
            style={
              profile.company_image_url
                ? { backgroundImage: `url(${profile.company_image_url})` }
                : undefined
            }
          />
          <div className="sp-identity">
            <div className="sp-avatar">
              {profile.company_image_url ? (
                <img src={profile.company_image_url} alt={profile.fullname} />
              ) : (
                initialsOf(profile.fullname)
              )}
            </div>

            <div className="sp-identity-text">
              <h1 className="sp-name">{profile.fullname}</h1>
              <p className="sp-company">{profile.company_name}</p>
              <span className={`sp-chip ${statusVariant(profile.status)}`}>
                {STATUS_LABELS[profile.status] || profile.status}
              </span>
            </div>

            <div
              className={`sp-seal ${sealClass}`}
              title={
                Number(profile.is_verified) === 1
                  ? 'حساب موثّق'
                  : 'لم يتم التوثيق بعد'
              }
            >
              <i
                className={`bi ${
                  Number(profile.is_verified) === 1
                    ? 'bi-patch-check-fill'
                    : 'bi-patch-exclamation'
                }`}
                style={{ fontSize: 16, marginBottom: 4, display: 'block' }}
              />
              {Number(profile.is_verified) === 1 ? 'موثّق' : 'غير موثّق'}
            </div>
          </div>
        </div>

        <section className="sp-section">
          <h3><i className="bi bi-telephone" style={{ marginLeft: 8 }} />بيانات التواصل</h3>
          <div className="sp-grid">
            <div className="sp-field">
              <label>البريد الإلكتروني</label>
              <span>{profile.email}</span>
            </div>
            <div className="sp-field">
              <label>رقم الهاتف</label>
              <span>{profile.phone}</span>
            </div>
            <div className="sp-field">
              <label>العنوان</label>
              <span>{profile.address}</span>
            </div>
            <div className="sp-field">
              <label>المحافظة</label>
              <span>{profile.governorate}</span>
            </div>
          </div>
        </section>

        <section className="sp-section">
          <h3><i className="bi bi-building" style={{ marginLeft: 8 }} />بيانات الشركة</h3>
          <div className="sp-grid">
            <div className="sp-field">
              <label>اسم الشركة</label>
              <span>{profile.company_name}</span>
            </div>
            <div className="sp-field mono">
              <label>الرقم القومي</label>
              <span>{profile.national_id}</span>
            </div>
            <div className="sp-field">
              <label>اسم الشهادة</label>
              <span>{profile.certificate_name || '—'}</span>
            </div>
            <div className="sp-field">
              <label>تاريخ الانضمام</label>
              <span>{formatDate(profile.created_at)}</span>
            </div>
          </div>
        </section>

        {documents.length > 0 && (
          <section className="sp-section">
            <h3><i className="bi bi-file-earmark-text" style={{ marginLeft: 8 }} />المستندات</h3>
            <div className="sp-docs">
              {documents.map((doc) => (
                <a
                  key={doc.key}
                  className="sp-doc"
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div
                    className="sp-doc-thumb"
                    style={{ backgroundImage: `url(${doc.url})` }}
                  />
                  <div className="sp-doc-label">
                    <span><i className={`bi ${doc.icon}`} style={{ marginLeft: 6 }} />{doc.label}</span>
                    <span className="tag">عرض</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}