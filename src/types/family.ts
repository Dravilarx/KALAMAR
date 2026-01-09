export type FamilyRole = 'parent' | 'child' | 'other';

export interface FamilyMember {
    id: string;
    userId: string;
    name: string;
    role: FamilyRole;
    avatar?: string;
    color: string; // For visual identification in calendar
    createdAt: Date;
}

export interface FamilyMemberInput extends Omit<FamilyMember, 'id' | 'createdAt'> { }

export const FAMILY_ROLES: { value: FamilyRole; label: string }[] = [
    { value: 'parent', label: 'Padre/Madre' },
    { value: 'child', label: 'Hijo/Hija' },
    { value: 'other', label: 'Otro' },
];

export const MEMBER_COLORS = [
    '#3b82f6', // blue
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#f97316', // orange
];
