/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  Modal,
  Button,
  TextInput,
  Keyboard,
  Dimensions,
  Switch,
} from 'react-native';
import {io} from 'socket.io-client';
import {Provider, useSelector, useDispatch} from 'react-redux';
import {Svg, Line} from 'react-native-svg';

import store, {loadingAction, setTickersAction} from './store';

const HOST = 'http://localhost:4000';
const TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'FB', 'TSLA'];

const Ticker = ({ticker}) => (
  <View
    style={{
      flexDirection: 'row',
      height: 80,
      marginHorizontal: 20,
      borderRadius: 20,
      borderColor: 'grey',
      borderWidth: 1,
      alignItems: 'center',
      padding: 10,
      marginVertical: 10,
      justifyContent: 'space-around',
    }}>
    <View
      style={{
        width: 40,
        height: 40,
        backgroundColor:
          ticker.yield > 1 ? 'rgba(0, 128, 0, 0.4)' : 'rgba(255, 0, 0, 0.5)',
        borderRadius: 10,
        borderColor: ticker.yield > 1 ? 'green' : 'red',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Svg
        width="24"
        height="24"
        style={{
          transform: [{rotateZ: ticker.yield > 1 ? '-90deg' : '90deg'}],
        }}>
        <Line
          x1={4}
          x2={20}
          y={12}
          stroke={ticker.yield > 1 ? 'green' : 'red'}
          strokeWidth="2"
        />
        <Line
          x1={12}
          x2={20}
          y1={8}
          y2={12}
          stroke={ticker.yield > 1 ? 'green' : 'red'}
          strokeWidth="2"
        />
        <Line
          x1={12}
          x2={20}
          y1={16}
          y2={12}
          stroke={ticker.yield > 1 ? 'green' : 'red'}
          strokeWidth="2"
        />
      </Svg>
    </View>

    <View style={{}}>
      <Text style={{fontWeight: '600'}}>{ticker.ticker}</Text>
      <Text style={{color: 'grey'}}>{ticker.price}</Text>
    </View>

    <View style={{}}>
      <Text
        style={[
          {fontWeight: '500'},
          ticker.yield > 1 ? {color: 'green'} : {color: 'red'},
        ]}>
        {ticker.yield > 1 ? '+' : '-'}
        {ticker.change_percent}%
      </Text>
      <Text style={ticker.yield > 1 ? {color: 'green'} : {color: 'red'}}>
        {ticker.yield > 1 ? '+' : '-'}
        {ticker.change}
      </Text>
    </View>
  </View>
);

const App = () => {
  const socket = io(HOST);
  const {loading, data} = useSelector(state => state);
  const dispatch = useDispatch();

  const [showModal, setShowModal] = React.useState(false);
  const [intervalValue, setIntervalValue] = React.useState(5);
  const [filteredTickers, setFilteredTickers] = React.useState(TICKERS);

  React.useEffect(() => {
    socket.on('connect', () => {
      if (socket.connected) {
        socket.emit('start');
        dispatch(loadingAction(false));
      }
    });

    startListen();

    return () => {
      socket.on('disconnect', () => {
        console.log('disconnected');
      });
    };
  }, []);

  const startListen = () => {
    socket.on('ticker', response => {
      dispatch(setTickersAction(response));
    });
  };

  const handleSaveInterval = () => {
    socket.emit('setInterval', intervalValue);

    startListen();

    Keyboard.dismiss();
  };

  const handleSwitch = ticker => {
    const found = filteredTickers.includes(ticker);
    let filtered;

    if (found) {
      filtered = filteredTickers.filter(item => item !== ticker);
    } else {
      filtered = [...filteredTickers, ticker];
    }

    setFilteredTickers(filtered);
  };

  if (loading) {
    <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text style={{fontWeight: '600', fontSize: 24, marginLeft: 20}}>
          Stocks
        </Text>

        <View style={{alignSelf: 'flex-end', marginRight: 20}}>
          <Button
            title="Settings"
            onPress={() => setShowModal(prevState => !prevState)}
          />
        </View>
      </View>

      {data && data.length > 0 ? (
        data.map((ticker, index) => {
          return (
            filteredTickers.includes(ticker.ticker) && (
              <Ticker key={index} ticker={ticker} />
            )
          );
        })
      ) : (
        <View />
      )}

      <Modal animationType="slide" transparent={false} visible={showModal}>
        <SafeAreaView>
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              marginBottom: 40,
            }}>
            <View
              style={{
                justifyContent: 'center',
                marginLeft: 20,
              }}>
              <Text style={{fontWeight: '600', fontSize: 24}}>Settings</Text>
            </View>

            <View style={{alignSelf: 'flex-end', marginRight: 20}}>
              <Button
                title="Close"
                onPress={() => setShowModal(prevState => !prevState)}
              />
            </View>
          </View>

          <View
            style={{
              borderColor: 'grey',
              borderRadius: 20,
              borderWidth: 1,
              marginHorizontal: 20,
              padding: 10,
            }}>
            <Text>Update interval (sec):</Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 5,
              }}>
              <TextInput
                value={intervalValue.toString()}
                onChangeText={setIntervalValue}
                keyboardType="number-pad"
                style={{
                  borderColor: 'grey',
                  borderWidth: 1,
                  borderRadius: 10,
                  width: '75%',
                  padding: 5,
                }}
                maxLength={4}
              />

              <Button title="Save" onPress={() => handleSaveInterval()} />
            </View>
          </View>

          <View
            style={{
              borderBottomColor: 'grey',
              borderBottomWidth: 1,
              width: Dimensions.get('window').width - 80,
              alignSelf: 'center',
              marginVertical: 20,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 20,
              marginBottom: 5,
            }}>
            <Text style={{fontSize: 16, fontWeight: '500'}}>Title</Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 16, fontWeight: '500'}}>Local</Text>
              <Text style={{marginLeft: 10, fontSize: 16, fontWeight: '500'}}>
                Server
              </Text>
            </View>
          </View>
          {TICKERS.map((ticker, index) => {
            return (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 20,
                  marginVertical: 5,
                }}>
                <Text>{ticker}</Text>
                <View style={{flexDirection: 'row'}}>
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    onValueChange={() => handleSwitch(ticker)}
                    value={filteredTickers.includes(ticker)}
                  />
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    onValueChange={() => handleSwitch(ticker)}
                    value={filteredTickers.includes(ticker)}
                    style={{marginLeft: 5}}
                  />
                </View>
              </View>
            );
          })}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);
