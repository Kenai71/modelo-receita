import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const COLLECTION_NAME = 'recipes';

/**
 * Carrega todas as receitas do Firestore.
 */
export async function loadRecipes() {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const recipes = [];
    querySnapshot.forEach((doc) => {
      recipes.push({ id: doc.id, ...doc.data() });
    });
    // Ordena do mais recente para o mais antigo por padrão
    return recipes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (error) {
    console.error('Falha ao carregar receitas do Firestore:', error);
    return [];
  }
}

/**
 * Salva ou atualiza uma única receita no Firestore.
 */
export async function saveRecipe(recipe) {
  try {
    const recipeRef = doc(db, COLLECTION_NAME, recipe.id);
    // Cria uma cópia sem o ID para não salvar o ID dentro do documento redundantemente (embora não haja problema)
    const dataToSave = { ...recipe };
    delete dataToSave.id;
    await setDoc(recipeRef, dataToSave);
  } catch (error) {
    console.error('Falha ao salvar receita:', error);
    throw error;
  }
}

/**
 * Exclui uma receita do Firestore pelo ID.
 */
export async function deleteRecipe(recipeId) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, recipeId));
  } catch (error) {
    console.error('Falha ao excluir receita:', error);
    throw error;
  }
}

/**
 * Faz o upload de uma imagem para o Firebase Storage.
 */
export async function uploadImage(file, recipeId) {
  if (!file) return null;
  try {
    // Cria uma referência com um nome único (ex: usando timestamp ou o próprio id da receita)
    const fileExtension = file.name.split('.').pop();
    const fileName = `images/recipes/${recipeId}-${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Falha no upload da imagem:', error);
    throw error;
  }
}
