import { InteractionManager } from 'react-native';
import { FileSystem } from 'react-native-unimodules';
import _ from 'lodash';
import axios from 'axios';


//wrapper func for setstate that returns a promise
export function setStateAsync(that, newState) {
  return new Promise((resolve) => {
      that.setState(newState, () => {
        resolve();
      });
  });
};

//wrapper for timeout that returns a promise
export function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//returns a shuffled an array
export function shuffleArray(array = []) {
  var newArray = _.cloneDeep(array);
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return(newArray);
}

//pick a random item from an array
export function randomElementFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

//when i exceeds max, go back to zero
export function returnToZero(i, max){
  let mod = i % (max + 1);
  return i <= max? i : mod;
}

export function plural(string = "", count = 0, suffix = 's'){
  return string + (count > 1? suffix : '');
}

export function getTimestamp(inMilliseconds = false){
  const dateTime  = new Date().getTime();
  return Math.floor(dateTime / (inMilliseconds? 1 : 1000));
}

/** returns undefined when index is invalid */
export function getLast(array) {
  return array[array.length - 1];
}

/** returns undefined when index is invalid */
export function getFirst(array) {
  return array[0];
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export function getLetter(index = 0){
  return alphabet[index];
};

export function isValidTimestamp(timestamp){
  return (new Date(timestamp)).getTime() > 0;
};

export function isEmpty(string){
  const text = string || '';
  return (text.length == 0) || (text == '');
};

export function hexToRgbA(hex, opacity){
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c= hex.substring(1).split('');
    if(c.length== 3){
      c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    };
    c= '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + opacity + ')';
  };
  throw new Error('Bad Hex');
};

const isDataUrlRegex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
export function isDataURL(s) {
  return !!s.match(isDataUrlRegex);
};

/** returns null if not valid */
export function getBase64MimeType(encoded = '') {
  if (typeof encoded !== 'string') return null;
  const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  if (mime && mime.length) {
    return mime[1];
  };
};

const imageMimeTypes = ['image/png', 'image/jpeg'];
export function isMimeTypeImage(type){
  return imageMimeTypes.includes(type)
};

export function isBase64Image(photouri){
  //check if uri is valid base64
  const isBase64 = isDataURL(photouri);
  //check if uri is an image
  const type    = getBase64MimeType(photouri);
  const isImage = isMimeTypeImage(type);
  //check if uri is a valid base64image
  return(isBase64 && isImage);
};

export async function createFolderIfDoesntExist(folder_uri){
  try {
    //get details of folder
    const info = await FileSystem.getInfoAsync(folder_uri, {size: false, md5: false});
    const { exists, isDirectory } = info;

    const shouldMakeDirectory = (!exists && !isDirectory);
    if(shouldMakeDirectory){
      //create direcory
      await FileSystem.makeDirectoryAsync(folder_uri);
      _doesFolderExist = true;
    };

  } catch(error){
    console.log('Unable to create folder');
    console.log(error);
    throw error;
  };
};

export function addLeadingZero(number){
  return number < 10? `0${number}`: number;
};

export function formatPercent(percent){
  const isWhole = (percent % 1 === 0);
  const formatted = isWhole? percent : percent.toFixed(2);
  return(`${formatted}%`);
};

export function replacePropertiesWithNull(obj = {}){
  //make a copy of the object
  let new_obj = _.cloneDeep(obj);
  //get an array of all the property names
  const keys = Object.keys(obj);
  //replace all the properties with null
  keys.forEach((property) => {
    new_obj[property] = null;
  });
  return(new_obj);
};

export function nextFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  });
};

export async function randomDelay(min, max) {
  const delay = Math.random() * (max - min) + min
  const startTime = performance.now()

  while (performance.now() - startTime < delay) {
    await nextFrame()
  };
};

export async function fetchWithProgress(url, callback){
  try {
    let previousPercentage = 0;
    const config = {
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percentage = Math.round((loaded * 100) / total);

        const didChange = (previousPercentage != percentage);
        previousPercentage = percentage;
        //call callback and pass percentage progress
        didChange && callback && callback(percentage);
      },
    };
    const response = await axios.get(url, config);
    return (response);
  } catch(error){
    console.log('fetchWithProgress: unable to fetch');
    console.log(error);
    throw error;
  };
};

export function runAfterInteractions(){
  return new Promise(resolve => {
    InteractionManager.runAfterInteractions(() => {
      resolve();
    });
  });
};

export async function parseIfJSON(text){
  try {
    return({isJson: true, json: await JSON.parse(text)});
  } catch(error){
    return({isJson: false, json: null});
  };
};

export function spreadIfTrue(condition, value = {}){
  return condition? value : {};
};

export function asyncAlert({title, desc}){
  return new Promise(resolve => Alert.alert(
    title, desc,
    [{text: 'OK', onPress: () => resolve()}],
  ));
};

/*
export function countOccurences(item = '', items = []){
  const reducer = (acc, cur) => {
    const didMatch = (cur === item);
    return didMatch? (acc + 1) : acc;  
  };

  return items.reduce(reducer, 0);
};
*/

export function countOccurences(item = '', items = []){
  return items.filter(i => i === item).length;
};

//returns undefined if property does not exist
export function getProperty(obj, key) {
  return key.split(".").reduce((o, x) => 
    ((typeof o == "undefined" || o === null)? o : o[x]), obj
  );
};


export function capitalize(string = '') {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function convertHoursToMS(hours){
  const minutes = hours   * 60;
  const seconds = minutes * 60;
  return (seconds * 1000);
};

export function formatMsToDuration(mills) {
  const seconds = Math.floor(mills   / 1000);
  const minutes = Math.floor(seconds / 60  );
  const hours   = Math.floor(minutes / 60  );

  const modSec = (seconds % 60);
  const modMin = (minutes % 60);

  const pad = (num) => ("0"+num).slice(-2);
  return `${pad(hours)}:${pad(modMin)}:${pad(modSec)}`
};

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
};