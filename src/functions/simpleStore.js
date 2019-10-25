import store from 'react-native-simple-store';

let cache = {};

export const STORE_KEYS = {
  mediaCategories: 'mediaCategories',
};

export class SimpleStore {
  static async read(key){
    try {
      //read from store
      const data = await store.get(key);
      //update cache var
      cache[key] = data;

      return data;

    } catch(error){
      console.log(`SimpleStore: unable to read from store for key: ${key}`);
      console.log(error);
      throw error;
    };
  };

  static readCache(key){
    return cache[key];
  };

  static async set(key, items = []){
    await store.save(key, items);
    //update cache var
    cache[key] = items;
  };

  static async append(key, item){
    await store.push(key, item);
  };

  static async appendItems(key, items = []){
    const oldItems = await store.get(key);
    const newItems = [...oldItems, ...items];

    await store.save(CategoryStore.KEY, newItems);
    cache[key] = newItems;
  };

  static clear(key){
    cache[key] = null;
  };

  static clearAll(){
    cache = {};
  };

  static async delete(key){
    await store.delete(key);
    await store.save(key, []);
    cache[key] = {};
  };
};