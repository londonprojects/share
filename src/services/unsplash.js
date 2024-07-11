import axios from 'axios';

const UNSPLASH_ACCESS_KEY = '9tdu1sdQdRJV4zwTDqLsSxT9-yJbuud6msoTTMAu_Lg';

const unsplash = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
  },
});

export const getRandomImage = async (query) => {
  try {
    const response = await unsplash.get('/photos/random', {
      params: { query, count: 1 },
    });
    return response.data[0].urls.small;
  } catch (error) {
    console.error('Error fetching image from Unsplash', error);
    return null;
  }
};
