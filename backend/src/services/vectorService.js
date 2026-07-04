import Resume from '../models/Resume.js';

export async function saveResumeEmbedding(userId, embedding) {
  try {
    const resume = await Resume.findOne({ userId });
    if (resume) {
      resume.embedding = embedding;
      await resume.save();
      console.log(`Saved resume embedding for user: ${userId}`);
    } else {
      console.error(`Could not save embedding: Resume not found for user ${userId}`);
    }
  } catch (err) {
    console.error('Error saving resume embedding:', err);
  }
}

export async function findSimilarResumes(queryEmbedding, topK = 5) {
  try {
    const allResumes = await Resume.find({});
    const similarities = [];

    for (const resume of allResumes) {
      if (resume.embedding && resume.embedding.length > 0) {
        const score = cosineSimilarity(queryEmbedding, resume.embedding);
        similarities.push({ resume, score });
      }
    }

    // Sort descending by score
    similarities.sort((a, b) => b.score - a.score);

    return similarities.slice(0, topK).map(item => item.resume);
  } catch (err) {
    console.error('Error finding similar resumes:', err);
    return [];
  }
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default {
  saveResumeEmbedding,
  findSimilarResumes
};
