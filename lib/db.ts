import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { db } from "./firebase"

// Example of basic CRUD operations
export const createDocument = async (
  collection: string,
  id: string,
  data: any
) => {
  await setDoc(doc(db, collection, id), data)
}

export const getDocument = async (collection: string, id: string) => {
  const docSnap = await getDoc(doc(db, collection, id))
  return docSnap.exists() ? docSnap.data() : null
}

export const updateDocument = async (
  collection: string,
  id: string,
  data: any
) => {
  await updateDoc(doc(db, collection, id), data)
}

export const deleteDocument = async (collection: string, id: string) => {
  await deleteDoc(doc(db, collection, id))
}

export const queryDocuments = async (
  collectionName: string,
  field: string,
  operator: any,
  value: any
) => {
  const q = query(collection(db, collectionName), where(field, operator, value))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
