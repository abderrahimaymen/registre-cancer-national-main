import React, { useState, useEffect } from 'react';

interface FieldDefinition {
    id?: string;
    cancer_category: string;
    field_name: string;
    field_key: string;
    field_type: 'text' | 'number' | 'select' | 'boolean' | 'date';
    field_options?: string;
    is_required: boolean;
    display_order: number;
}

export default function DynamicFieldsManager() {
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [fields, setFields] = useState<FieldDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [editingField, setEditingField] = useState<Partial<FieldDefinition> | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch known categories
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/reference/cancer-rules', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const uniqueCats = Array.from(new Set(data.map((d: any) => d.category)));
                    setCategories(uniqueCats as string[]);
                    if (uniqueCats.length > 0) setSelectedCategory(uniqueCats[0] as string);
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) fetchFields();
    }, [selectedCategory]);

    const fetchFields = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/dynamic-fields/definitions?cancer_category=${encodeURIComponent(selectedCategory)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFields(data);
            }
        } catch (err) {
            console.error("Failed to load fields", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!editingField?.field_name || !editingField?.field_type) return;

        try {
            const token = localStorage.getItem('token');
            const isEdit = !!editingField.id;
            
            // Auto generate field_key if not provided or new
            let field_key = editingField.field_key;
            if (!isEdit && !field_key) {
                field_key = editingField.field_name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
            }

            const payload = {
                ...editingField,
                cancer_category: selectedCategory,
                field_key,
                field_options: editingField.field_options ? 
                    (typeof editingField.field_options === 'string' ? JSON.parse(editingField.field_options) : editingField.field_options) 
                    : []
            };

            const url = isEdit ? `/api/dynamic-fields/definitions/${editingField.id}` : `/api/dynamic-fields/definitions`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
            
            setEditingField(null);
            fetchFields();
        } catch (err: any) {
            setError(err.message || 'Format JSON invalide pour les options ?');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Supprimer ce champ ?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/dynamic-fields/definitions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchFields();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const renderForm = () => {
        if (!editingField) return null;
        
        return (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-3">{editingField.id ? 'Modifier le champ' : 'Nouveau champ'}</h4>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                
                <form onSubmit={handleSave} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nom du champ</label>
                        <input 
                            required type="text"
                            value={editingField.field_name || ''}
                            onChange={e => setEditingField({...editingField, field_name: e.target.value})}
                            className="w-full p-2 border rounded text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Clé interne (unique)</label>
                        <input 
                            type="text"
                            value={editingField.field_key || ''}
                            onChange={e => setEditingField({...editingField, field_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                            placeholder="auto-générée si vide"
                            disabled={!!editingField.id}
                            className="w-full p-2 border rounded text-sm bg-gray-100"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select 
                                required
                                value={editingField.field_type || 'text'}
                                onChange={e => setEditingField({...editingField, field_type: e.target.value as any})}
                                className="w-full p-2 border rounded text-sm"
                            >
                                <option value="text">Texte</option>
                                <option value="number">Nombre</option>
                                <option value="select">Liste déroulante</option>
                                <option value="boolean">Oui/Non</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ordre d'affichage</label>
                            <input 
                                type="number"
                                value={editingField.display_order || 0}
                                onChange={e => setEditingField({...editingField, display_order: parseInt(e.target.value) || 0})}
                                className="w-full p-2 border rounded text-sm"
                            />
                        </div>
                    </div>
                    
                    {editingField.field_type === 'select' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Options (Format JSON: ["Option 1", "Option 2"])</label>
                            <input 
                                type="text"
                                value={typeof editingField.field_options === 'string' ? editingField.field_options : JSON.stringify(editingField.field_options || [])}
                                onChange={e => setEditingField({...editingField, field_options: e.target.value})}
                                placeholder='["Positif", "Négatif"]'
                                className="w-full p-2 border rounded text-sm font-mono"
                            />
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2">
                        <input 
                            type="checkbox" id="req"
                            checked={!!editingField.is_required}
                            onChange={e => setEditingField({...editingField, is_required: e.target.checked})}
                        />
                        <label htmlFor="req" className="text-sm">Champ obligatoire</label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3">
                        <button type="button" onClick={() => setEditingField(null)} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
                            Annuler
                        </button>
                        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            Sauvegarder
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-h-[80vh] overflow-y-auto w-full max-w-2xl text-[var(--text-primary)]">
            <h2 className="text-xl font-bold mb-4">Gestion des champs dynamiques</h2>
            
            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Catégorie de cancer</label>
                <select 
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-input)]"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Champs pour {selectedCategory}</h3>
                <button 
                    onClick={() => setEditingField({ field_type: 'text', is_required: false, display_order: (fields.length * 10) + 10 })}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                    + Ajouter un champ
                </button>
            </div>

            {renderForm()}

            {loading ? (
                <div className="py-4 text-center text-sm text-[var(--text-secondary)]">Chargement...</div>
            ) : fields.length === 0 ? (
                <div className="py-4 text-center text-sm text-[var(--text-secondary)] italic bg-gray-50 dark:bg-gray-800 rounded">
                    Aucun champ défini pour cette catégorie.
                </div>
            ) : (
                <div className="border border-[var(--border-input)] rounded overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-[var(--border-input)]">
                            <tr>
                                <th className="px-4 py-2">Ordre</th>
                                <th className="px-4 py-2">Nom</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Obligatoire</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-input)]">
                            {fields.map(f => (
                                <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-2 text-gray-500">{f.display_order}</td>
                                    <td className="px-4 py-2 font-medium">{f.field_name}</td>
                                    <td className="px-4 py-2 text-gray-600">{f.field_type}</td>
                                    <td className="px-4 py-2">{f.is_required ? 'Oui' : 'Non'}</td>
                                    <td className="px-4 py-2">
                                        <button 
                                            onClick={() => setEditingField({
                                                ...f,
                                                field_options: typeof f.field_options === 'object' ? JSON.stringify(f.field_options) : f.field_options
                                            })}
                                            className="text-blue-600 hover:underline mr-3"
                                        >
                                            Modifier
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(f.id!)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
