import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { FamilyMember, FamilyMemberInput } from '../types/family';

const COLLECTION_NAME = 'familyMembers';

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    return new Date(timestamp);
};

// Convert Firestore document to FamilyMember
const convertDocToMember = (doc: any): FamilyMember => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        createdAt: convertTimestampToDate(data.createdAt),
    } as FamilyMember;
};

export const familyService = {
    // Create a new family member
    async createMember(userId: string, memberInput: Omit<FamilyMemberInput, 'userId'>): Promise<string> {
        const memberData = {
            ...memberInput,
            userId,
            createdAt: Timestamp.fromDate(new Date()),
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), memberData);
        return docRef.id;
    },

    // Update a family member
    async updateMember(memberId: string, updates: Partial<FamilyMemberInput>): Promise<void> {
        await updateDoc(doc(db, COLLECTION_NAME, memberId), updates);
    },

    // Delete a family member
    async deleteMember(memberId: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, memberId));
    },

    // Get all family members for a user
    async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
        const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(convertDocToMember);
    },
};
