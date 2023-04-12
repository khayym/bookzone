import RNFetchBlob from 'rn-fetch-blob';

export const bookDownload = async () => {
  const downloadDest = `${RNFetchBlob.fs.dirs.DocumentDir}/70524.epub`;

  // check if file exists
  const isFileExist = await RNFetchBlob.fs.exists(downloadDest);
  if (isFileExist) {
    console.log('File already exists at:', downloadDest);
    return downloadDest; // return the full path of the file
  }

  try {
    const response = await RNFetchBlob.config({
      fileCache: true,
      path: downloadDest,
    }).fetch('GET', 'https://www.gutenberg.org/ebooks/70524.epub.noimages', {});

    console.log('The file saved to ', response.path());
    return response.path(); // return the full path of the downloaded file
  } catch (error) {
    console.log('Error occurred while downloading', error);
  }
};
