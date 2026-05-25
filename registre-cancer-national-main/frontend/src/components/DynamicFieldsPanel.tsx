import React, { useState, useEffect } from 'react';

interface FieldDefinition {
    id: string;
    cancer_category: string;
    field_name: string;
    field_key: string;
    field_type: 'text' | 'number' | 'select' | 'boolean' | 'date';
    field_options: any; 
    is_required: boolean;
    display_order: number;
}

interface FieldValue {
    id?: string;
    field_definition_id: string;
    field_value: string;
    field_key?: string;
    field_name?: string;
}

interface DynamicFieldsPanelProps {
    patientId: string;
    diagnosisId: string;
    cancerCategory: string;
    readOnly?: boolean;
}

export default function DynamicFieldsPanel({ patientId, diagnosisId, cancerCategory, readOnly = false }: DynamicFieldsPanelProps) {
    const [fields, setFields] = useState<FieldDefinition[]>([]);
    const [values, setValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!cancerCategory || !diagnosisId || !patientId) return;
        fetchData();
    }, [cancerCategory, diagnosisId, patientId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch definitions
            const defRes = await fetch(`/api/dynamic-fields/definitions?cancer_category=${encodeURIComponent(cancerCategory)}`, { headers });
            if (!defRes.ok) throw new Error('Erreur lors du chargement des définitions');
            const defData = await defRes.json();
            setFields(defData);

            // Fetch existing values
            const valRes = await fetch(`/api/dynamic-fields/values/${patientId}/${diagnosisId}`, { headers });
            if (!valRes.ok) throw new Error('Erreur lors du chargement des valeurs');
            const valData: FieldValue[] = await valRes.json();
            
            const valueMap: Record<string, string> = {};
            valData.forEach(v => {
                valueMap[v.field_definition_id] = v.field_value;
            });
            setValues(valueMap);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess(false);
            const token = localStorage.getItem('token');
            
            const payload = fields.map(f => ({
                field_definition_id: f.id,
                field_value: values[f.id] || ''
            }));

            const res = await fetch(`/api/dynamic-fields/values`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    cancer_diagnosis_id: diagnosisId,
                    values: payload
                })
            });

            if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4 text-sm text-[var(--text-secondary)]">Chargement des champs personnalisés...</div>;
    if (fields.length === 0) return <div className="p-4 text-sm text-[var(--text-secondary)]">Aucun champ personnalisé défini.</div>;

    const renderInput = (field: FieldDefinition) => {
        const val = values[field.id] || '';
        const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setValues({ ...values, [field.id]: e.target.value });
        };

        if (field.field_type === 'select') {
            let options: string[] = [];
            try {
                options = typeof field.field_options === 'string' ? JSON.parse(field.field_options) : field.field_options;
            } catch (e) {
                options = field.field_options || [];
            }
            
            return (
                <select 
                    className="w-full p-2 border border-[var(--border-input)] rounded bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    value={val}
                    onChange={onChange}
                    disabled={readOnly}
                    required={field.is_required}
                >
                    <option value="">Sélectionner...</option>
                    {Array.isArray(options) && options.map((opt, i) => {
                        const optVal = typeof opt === 'string' ? opt : (opt as any)?.value || '';
                        const optLabel = typeof opt === 'string' ? opt : (opt as any)?.label || optVal;
                        return <option key={i} value={optVal}>{optLabel}</option>;
                    })}
                </select>
            );
        }

        if (field.field_type === 'boolean') {
            return (
                <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" value="true" checked={val === 'true'} onChange={onChange} disabled={readOnly} />
                        <span>Oui</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" value="false" checked={val === 'false'} onChange={onChange} disabled={readOnly} />
                        <span>Non</span>
                    </label>
                </div>
            );
        }

        const typeMap = {
            'text': 'text',
            'number': 'number',
            'date': 'date'
        };

        return (
            <input 
                type={typeMap[field.field_type as keyof typeof typeMap] || 'text'}
                className="w-full p-2 border border-[var(--border-input)] rounded bg-[var(--bg-surface)] text-[var(--text-primary)]"
                value={val}
                onChange={onChange}
                disabled={readOnly}
                required={field.is_required}
            />
        );
    };

    return (
        <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-input)] shadow-sm mt-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Informations spécifiques ({cancerCategory})</h3>
            
            {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-2 rounded mb-4 text-sm">Valeurs sauvegardées avec succès</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(field => (
                    <div key={field.id} className="flex flex-col">
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                            {field.field_name} {field.is_required && <span className="text-red-500">*</span>}
                        </label>
                        {renderInput(field)}
                    </div>
                ))}
            </div>

            {!readOnly && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder les champs'}
                    </button>
                </div>
            )}
        </div>
    );
}
