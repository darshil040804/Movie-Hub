import {Client, Databases, ID, Query} from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        // 1) find any existing document
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ]);

        if (result.documents.length > 0) {
            // 2a) if it exists, bump the count
            const doc = result.documents[0];
            const updated = await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                doc.$id,                // or doc.id
                { count: Number(doc.count) + 1 }
            );
            return updated;

        } else {
            // 2b) otherwise create it, with a correct template literal
            const created = await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }
            );
            return created;
        }

    } catch (error) {
        console.error('❌ updateSearchCount failed:', error);
        throw error;
    }
};

export const getTrendingMovies = async() => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count"),
        ])
        return result.documents;
    } catch (error) {
        console.error(error);
    }
}
