import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { familyService } from '../../services/familyService';
import type { FamilyMember } from '../../types/family';
import { FAMILY_ROLES, MEMBER_COLORS } from '../../types/family';
import { X, Plus, Edit2, Trash2, User } from 'lucide-react';

interface FamilyManagerProps {
    members: FamilyMember[];
    onClose: () => void;
    onUpdate: () => void;
}

const FamilyManager: React.FC<FamilyManagerProps> = ({ members, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
    const [name, setName] = useState('');
    const [role, setRole] = useState<'parent' | 'child' | 'other'>('parent');
    const [color, setColor] = useState(MEMBER_COLORS[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEdit = (member: FamilyMember) => {
        setEditingMember(member);
        setName(member.name);
        setRole(member.role);
        setColor(member.color);
        setShowForm(true);
    };

    const handleDelete = async (memberId: string) => {
        if (!confirm('¿Estás seguro de eliminar este miembro?')) return;

        setLoading(true);
        try {
            await familyService.deleteMember(memberId);
            onUpdate();
        } catch (err) {
            setError('Error al eliminar el miembro');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError('');
        setLoading(true);

        try {
            const memberData = { name, role, color };

            if (editingMember) {
                await familyService.updateMember(editingMember.id, memberData);
            } else {
                await familyService.createMember(user.uid, memberData);
            }

            setShowForm(false);
            setEditingMember(null);
            setName('');
            setRole('parent');
            setColor(MEMBER_COLORS[0]);
            onUpdate();
        } catch (err) {
            setError('Error al guardar el miembro');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingMember(null);
        setName('');
        setRole('parent');
        setColor(MEMBER_COLORS[0]);
        setError('');
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-glass-white-5">
                    <h2 className="text-2xl font-semibold">Miembros de la Familia</h2>
                    <button onClick={onClose} className="p-2 hover:bg-glass-white-5 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-danger bg-opacity-10 border border-danger rounded-lg">
                            <p className="text-danger text-sm">{error}</p>
                        </div>
                    )}

                    {!showForm ? (
                        <>
                            {/* Members List */}
                            <div className="space-y-3 mb-6">
                                {members.length === 0 ? (
                                    <div className="text-center py-8 text-text-secondary">
                                        <p>No hay miembros registrados</p>
                                        <p className="text-sm text-text-muted mt-2">
                                            Agrega miembros de tu familia para asignarles eventos
                                        </p>
                                    </div>
                                ) : (
                                    members.map((member) => {
                                        const roleLabel = FAMILY_ROLES.find((r) => r.value === member.role)?.label;
                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-4 p-4 bg-bg-tertiary border border-glass-white-5 rounded-lg"
                                            >
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: member.color }}
                                                >
                                                    <User size={24} color="white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold">{member.name}</h4>
                                                    <p className="text-sm text-text-muted">{roleLabel}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className="p-2 hover:bg-glass-white-5 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member.id)}
                                                        className="p-2 hover:bg-danger hover:bg-opacity-20 rounded-lg transition-colors text-danger"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <button
                                onClick={() => setShowForm(true)}
                                className="btn btn-primary w-full"
                            >
                                <Plus size={20} />
                                <span>Agregar Miembro</span>
                            </button>
                        </>
                    ) : (
                        /* Add/Edit Form */
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="label">Nombre</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ej: María, Juan..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Rol</label>
                                <select
                                    className="input"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as any)}
                                >
                                    {FAMILY_ROLES.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="label">Color de Identificación</label>
                                <div className="flex flex-wrap gap-3">
                                    {MEMBER_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`w-12 h-12 rounded-full transition-all ${color === c ? 'ring-4 ring-offset-2 ring-offset-bg-secondary' : ''
                                                }`}
                                            style={{
                                                backgroundColor: c,
                                            }}
                                            onClick={() => setColor(c)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn btn-ghost flex-1"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                                    {loading ? 'Guardando...' : editingMember ? 'Actualizar' : 'Agregar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FamilyManager;
