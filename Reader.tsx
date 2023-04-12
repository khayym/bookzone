import React, {useState} from 'react';
import {useWindowDimensions, View, Text} from 'react-native';
import {Button, ProgressBar} from 'react-native-paper';
import {Reader, useReader} from '@epubjs-react-native/core';
import {useFileSystem} from '@epubjs-react-native/file-system';
import {bookDownload} from './downloader';
import {styles} from './styles';

const ReaderScreen = () => {
  const MIN_READING_TIME_PER_PAGE = 4000;

  const [bookPath, setBookPath] = useState('');
  const {width, height} = useWindowDimensions();
  const [progressData, setProgressData] = useState([0, {total: 0, current: 0}]);
  const [pageStartTime, setPageStartTime] = useState(null);
  const [validPageProgress, setValidPageProgress] = useState(0);

  const handleBookDownload = async () => {
    console.log('Downloading book...');
    const path = await bookDownload();
    setBookPath(path);
    console.log('Book downloaded:', path);
  };

  const {
    changeFontSize,
    currentLocation,
    totalLocations,
    goNext,
    goPrevious,
    progress,
  } = useReader();

  const handlePageChange = () => {
    const currentTime = new Date().getTime();
    if (pageStartTime) {
      const elapsedTime = currentTime - pageStartTime;
      if (elapsedTime >= MIN_READING_TIME_PER_PAGE) {
        const currentLocationIndex = currentLocation?.end.index || 0;
        const totalPages = totalLocations || 1;
        const currentPageProgress = (currentLocationIndex / totalPages) * 100;
        // Check if user has actually read the page by comparing progress with the previous progress
        const [prevProgress, _] = progressData;
        if (currentPageProgress > prevProgress) {
          setValidPageProgress(currentPageProgress);
          setProgressData([
            currentPageProgress,
            {total: totalPages, current: currentLocationIndex},
          ]);
        } else {
          // Reset the page start time to ensure that the user spends enough time on the page
          setPageStartTime(currentTime - MIN_READING_TIME_PER_PAGE);
        }
      }
    }
    setPageStartTime(currentTime);
  };

  return (
    <View style={styles.root}>
      <Button mode="elevated" onPress={handleBookDownload}>
        Download and Read book
      </Button>

      {bookPath ? (
        <Reader
          src={`file://${bookPath}`}
          width={width}
          height={height / 1.3}
          fileSystem={useFileSystem}
          onLocationChange={handlePageChange}
        />
      ) : (
        <Text style={styles.text}>Download a book to start reading!</Text>
      )}
      <View style={styles.buttons}>
        <View style={{flexDirection: 'row'}}>
          <Button mode="contained-tonal" onPress={goPrevious}>
            Prev
          </Button>
          <Button mode="contained" onPress={goNext}>
            Next
          </Button>
          <Button mode="contained" onPress={() => changeFontSize('21px')}>
            Change font size
          </Button>
        </View>
        <Text>
          page:
          {progressData[1].current}/{progressData[1].total}
        </Text>
        <ProgressBar progress={validPageProgress / 100} color={'red'} />
        <Text>progress:{validPageProgress.toFixed(2)}%</Text>
      </View>
    </View>
  );
};

export default ReaderScreen;
