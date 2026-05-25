import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, UserCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface EditPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    currentUser: any;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditPatientModal: React.FC<EditPatientModalProps> = ({ isOpen, onClose, patientId, currentUser }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [doctors, setDoctors] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && patientId) {
            setSuccessMessage(null);
            setErrorMessage(null);
            fetchPatient();
            fetchDoctors();
        }
    }, [isOpen, patientId]);

    const fetchPatient = async () => {
        setFetching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API}/api/patients/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const p = response.data.patient || response.data;
            setFormData({
                first_name: p.first_name || '',
                last_name: p.last_name || '',
                birth_date: p.birth_date ? p.birth_date.substring(0, 10) : '',
                age: p.age || '',
                gender: p.gender || '',
                phone_primary: p.phone_primary || '',
                full_address: p.full_address || '',
                wilaya_residence: p.wilaya_residence || '',
                cancer_type: p.cancer_type || '',
                cancer_code: p.cancer_code || '',
                status: p.status || '',
                assigned_doctor_id: p.assigned_doctor_id || ''
            });
        } catch (error) {
            console.error("Fetch patient error:", error);
            setErrorMessage("Erreur lors de la récupération des données du patient.");
        } finally {
            setFetching(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const hospitalDoctors = response.data.filter((u: any) => u.role === 'Médecin' && u.status === 'active');
            setDoctors(hospitalDoctors);
        } catch (error) {
            console.error("Fetch Doctors Error:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        // Validation
        if (!formData.first_name || !formData.last_name || !formData.age) {
            setErrorMessage("Les champs Prénom, Nom et Âge sont obligatoires.");
            setLoading(false);
            return;
        }

        if (formData.age < 0 || formData.age > 120) {
            setErrorMessage("Veuillez saisir un âge valide (0-120).");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            if (payload.assigned_doctor_id === '') {
                payload.assigned_doctor_id = null;
            }
            
            await axios.put(`${API}/api/patients/${patientId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage("✅ Informations du patient mises à jour avec succès.");
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error("Update patient error:", error);
            setErrorMessage(error.response?.data?.error || "Erreur lors de la mise à jour.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '800px',
                padding: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '24px', right: '24px', background: '#f8fafc', border: 'none',
                    cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '12px'
                }}>
                    <X size={20} />
                </button>

                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Modifier Patient</h2>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Mise à jour des informations civiles et médicales</p>
                    </div>
                </div>

                {fetching ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#00AAFF' }} />
                        <p style={{ marginTop: '16px', color: '#64748b' }}>Chargement des données...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {successMessage && (
                            <div style={{ padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', marginBottom: '24px', fontWeight: '600' }}>
                                {successMessage}
                            </div>
                        )}
                        {errorMessage && (
                            <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '600' }}>
                                <AlertCircle size={20} /> {errorMessage}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Personal Info */}
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Informations Personnelles</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Nom *</label>
                                        <input type="text" name="last_name" className="login-input" style={{ width: '100%', textTransform: 'uppercase' }} value={formData.last_name} onChange={handleChange} required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Prénom *</label>
                                        <input type="text" name="first_name" className="login-input" style={{ width: '100%' }} value={formData.first_name} onChange={handleChange} required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Date de naissance</label>
                                        <input type="date" name="birth_date" className="login-input" style={{ width: '100%' }} value={formData.birth_date} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Âge *</label>
                                        <input type="number" name="age" className="login-input" style={{ width: '100%' }} value={formData.age} onChange={handleChange} required min="0" max="120" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Genre</label>
                                        <select name="gender" className="login-input" style={{ width: '100%' }} value={formData.gender} onChange={handleChange}>
                                            <option value="Homme">Homme</option>
                                            <option value="Femme">Femme</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Téléphone</label>
                                        <input type="text" name="phone_primary" className="login-input" style={{ width: '100%' }} value={formData.phone_primary} onChange={handleChange} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Adresse complète</label>
                                        <input type="text" name="full_address" className="login-input" style={{ width: '100%' }} value={formData.full_address} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Medical Info */}
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #e0e7ff', paddingBottom: '8px' }}>Informations Médicales</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Type de Cancer</label>
                                        <input type="text" name="cancer_type" className="login-input" style={{ width: '100%' }} value={formData.cancer_type} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Statut</label>
                                        <select name="status" className="login-input" style={{ width: '100%' }} value={formData.status} onChange={handleChange}>
                                            <option value="Active">Actif</option>
                                            <option value="Décédé">Décédé</option>
                                            <option value="Perdu de vue">Perdu de vue</option>
                                            <option value="En rémission">En rémission</option>
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Médecin Assigné</label>
                                        <select name="assigned_doctor_id" className="login-input" style={{ width: '100%' }} value={formData.assigned_doctor_id} onChange={handleChange}>
                                            <option value="">Aucun</option>
                                            {doctors.map(d => (
                                                <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                            <button type="button" className="login-button" style={{ width: 'auto', backgroundColor: '#f1f5f9', color: '#475569', padding: '12px 24px' }} onClick={onClose} disabled={loading}>
                                Annuler
                            </button>
                            <button type="submit" className="login-button" style={{ width: 'auto', padding: '12px 24px', backgroundColor: '#0f172a' }} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Enregistrer</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditPatientModal;
